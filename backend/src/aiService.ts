export interface TestStep {
  action: string;
  expectedResult: string;
}

export interface GeneratedTestCasePayload {
  title: string;
  description: string;
  steps: TestStep[];
}

interface UserStoryInput {
  title: string;
  description?: string;
  acceptanceCriteria?: string;
}

interface GenerateOptions {
  count?: number;
  includeNegative?: boolean;
  includeBoundary?: boolean;
}

const SYSTEM_PROMPT = `You are a senior QA engineer. Generate Azure DevOps Test Cases from user stories.
Return ONLY valid JSON with this shape:
{
  "testCases": [
    {
      "title": "string",
      "description": "string",
      "steps": [
        { "action": "string", "expectedResult": "string" }
      ]
    }
  ]
}
Rules:
- Each test case must have 2-6 clear steps with action and expected result.
- Cover happy path, edge cases when requested, and negative scenarios when requested.
- Titles must be specific and traceable to the user story.
- Do not include markdown or commentary outside the JSON.`;

export async function generateTestCasesFromStory(
  userStory: UserStoryInput,
  options: GenerateOptions
): Promise<GeneratedTestCasePayload[]> {
  const count = Math.min(Math.max(options.count ?? 5, 1), 20);
  const userPrompt = buildUserPrompt(userStory, count, options);

  const provider = process.env.AI_PROVIDER ?? "azure-openai";

  if (provider === "openai") {
    return callOpenAI(userPrompt);
  }

  return callAzureOpenAI(userPrompt);
}

function buildUserPrompt(
  userStory: UserStoryInput,
  count: number,
  options: GenerateOptions
): string {
  return `Generate ${count} test cases for this user story.

Title: ${userStory.title}
Description: ${stripHtml(userStory.description ?? "")}
Acceptance Criteria: ${stripHtml(userStory.acceptanceCriteria ?? "")}

Options:
- Include negative scenarios: ${options.includeNegative ?? true}
- Include boundary cases: ${options.includeBoundary ?? true}`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function callAzureOpenAI(userPrompt: string): Promise<GeneratedTestCasePayload[]> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-4o";

  if (!endpoint || !apiKey) {
    throw new Error("AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY must be set.");
  }

  const url = `${endpoint.replace(/\/$/, "")}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Azure OpenAI error: ${body}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  return parseTestCases(data.choices[0]?.message?.content ?? "");
}

async function callOpenAI(userPrompt: string): Promise<GeneratedTestCasePayload[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY must be set.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI error: ${body}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  return parseTestCases(data.choices[0]?.message?.content ?? "");
}

function parseTestCases(content: string): GeneratedTestCasePayload[] {
  const parsed = JSON.parse(content) as { testCases?: GeneratedTestCasePayload[] };
  if (!Array.isArray(parsed.testCases) || parsed.testCases.length === 0) {
    throw new Error("AI response did not contain test cases.");
  }
  return parsed.testCases;
}
