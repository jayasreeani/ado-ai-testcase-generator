import type { GenerateRequest, GenerateResponse } from "../types";

export async function generateTestCases(
  apiBaseUrl: string,
  request: GenerateRequest
): Promise<GenerateResponse> {
  if (!apiBaseUrl) {
    throw new Error(
      "API Base URL is not configured. Set it in extension configuration (Organization Settings → Extensions)."
    );
  }

  const response = await fetch(`${apiBaseUrl}/api/generate-testcases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Generation failed (${response.status})`);
  }

  return response.json() as Promise<GenerateResponse>;
}
