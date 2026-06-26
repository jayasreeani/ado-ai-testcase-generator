import React, { useCallback, useEffect, useState } from "react";
import type { GeneratedTestCase, UserStoryContext } from "./types";
import {
  createTestCaseWorkItem,
  getApiBaseUrl,
  getCurrentWorkItemId,
  initializeSdk,
  loadUserStoryContext,
  setApiBaseUrl,
} from "./services/adoApi";
import { generateTestCases } from "./services/aiApi";
import "./styles.css";

function makeId(): string {
  return `tc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function TestCaseGenerator(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userStory, setUserStory] = useState<UserStoryContext | null>(null);
  const [testCases, setTestCases] = useState<GeneratedTestCase[]>([]);
  const [count, setCount] = useState(5);
  const [includeNegative, setIncludeNegative] = useState(true);
  const [includeBoundary, setIncludeBoundary] = useState(true);
  const [apiBaseUrl, setApiBaseUrlState] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        await initializeSdk();
        const configuredUrl = getApiBaseUrl();
        if (configuredUrl) {
          setApiBaseUrlState(configuredUrl);
        }
        const workItemId = await getCurrentWorkItemId();
        const context = await loadUserStoryContext(workItemId);
        setUserStory(context);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user story.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!userStory) return;

    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const apiBaseUrl = getApiBaseUrl() || apiBaseUrlState.trim();
      if (!apiBaseUrl) {
        throw new Error("Enter the AI backend API Base URL before generating.");
      }
      setApiBaseUrl(apiBaseUrl);
      const response = await generateTestCases(apiBaseUrl, {
        userStory,
        options: { count, includeNegative, includeBoundary },
      });

      setTestCases(
        response.testCases.map((tc) => ({
          ...tc,
          id: makeId(),
          selected: true,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }, [userStory, count, includeNegative, includeBoundary, apiBaseUrlState]);

  const handleCreate = useCallback(async () => {
    if (!userStory) return;

    const selected = testCases.filter((tc) => tc.selected);
    if (selected.length === 0) {
      setError("Select at least one test case to create.");
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const createdIds: number[] = [];
      for (const tc of selected) {
        const id = await createTestCaseWorkItem(userStory.id, tc, userStory);
        createdIds.push(id);
      }
      setSuccess(`Created ${createdIds.length} test case(s): #${createdIds.join(", #")}`);
      setTestCases((prev) => prev.filter((tc) => !tc.selected));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create test cases.");
    } finally {
      setCreating(false);
    }
  }, [userStory, testCases]);

  const toggleSelected = (id: string) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, selected: !tc.selected } : tc))
    );
  };

  const updateTitle = (id: string, title: string) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, title } : tc))
    );
  };

  if (loading) {
    return <div className="panel">Loading user story…</div>;
  }

  return (
    <div className="panel">
      <header className="header">
        <h2>AI Test Case Generator</h2>
        <p className="subtitle">
          Generate Test Cases from <strong>{userStory?.title}</strong>
        </p>
      </header>

      {error && <div className="banner error">{error}</div>}
      {success && <div className="banner success">{success}</div>}

      <section className="options">
        <label>
          AI backend API URL
          <input
            type="url"
            placeholder="https://your-api.azurewebsites.net"
            value={apiBaseUrlState}
            onChange={(e) => setApiBaseUrlState(e.target.value)}
          />
        </label>
        <label>
          Number of test cases
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={includeNegative}
            onChange={(e) => setIncludeNegative(e.target.checked)}
          />
          Include negative scenarios
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={includeBoundary}
            onChange={(e) => setIncludeBoundary(e.target.checked)}
          />
          Include boundary cases
        </label>
        <button
          type="button"
          className="btn primary"
          onClick={() => void handleGenerate()}
          disabled={generating}
        >
          {generating ? "Generating…" : "Generate test cases"}
        </button>
      </section>

      {testCases.length > 0 && (
        <section className="results">
          <div className="results-header">
            <h3>Preview ({testCases.length})</h3>
            <button
              type="button"
              className="btn success"
              onClick={() => void handleCreate()}
              disabled={creating}
            >
              {creating ? "Creating…" : "Create selected in Azure DevOps"}
            </button>
          </div>

          {testCases.map((tc) => (
            <article key={tc.id} className="test-case-card">
              <label className="checkbox card-select">
                <input
                  type="checkbox"
                  checked={tc.selected}
                  onChange={() => toggleSelected(tc.id)}
                />
                <input
                  className="title-input"
                  value={tc.title}
                  onChange={(e) => updateTitle(tc.id, e.target.value)}
                />
              </label>
              {tc.description && <p className="description">{tc.description}</p>}
              <ol className="steps">
                {tc.steps.map((step, i) => (
                  <li key={i}>
                    <strong>Action:</strong> {step.action}
                    <br />
                    <strong>Expected:</strong> {step.expectedResult}
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
