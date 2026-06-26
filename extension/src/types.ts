export interface TestStep {
  action: string;
  expectedResult: string;
}

export interface GeneratedTestCase {
  id: string;
  title: string;
  description: string;
  steps: TestStep[];
  selected: boolean;
}

export interface UserStoryContext {
  id: number;
  title: string;
  description: string;
  acceptanceCriteria: string;
  areaPath: string;
  iterationPath: string;
}

export interface GenerateRequest {
  userStory: UserStoryContext;
  options: {
    count: number;
    includeNegative: boolean;
    includeBoundary: boolean;
  };
}

export interface GenerateResponse {
  testCases: Omit<GeneratedTestCase, "id" | "selected">[];
}
