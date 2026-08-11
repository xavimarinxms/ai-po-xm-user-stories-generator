// ─── Form ─────────────────────────────────────────────────────────────────────

export type Complexity = 'simple' | 'moderate' | 'complex';

export interface StoryFormData {
  featureTitle: string;
  persona: string;
  mainGoal: string;
  benefit: string;
  context: string;
  complexity: Complexity;
}

// ─── Story ────────────────────────────────────────────────────────────────────

export type Priority = 'Must Have' | 'Should Have' | 'Could Have';

export interface GherkinScenario {
  name: string;
  steps: string[];
}

export interface Story {
  id: string;
  index: number;
  title: string;
  priority: Priority;
  classic: {
    persona: string;
    want: string;
    soThat: string;
  };
  gherkin: {
    feature: string;
    scenarios: GherkinScenario[];
  };
  acceptanceCriteria: string[];
}

// ─── Jira ─────────────────────────────────────────────────────────────────────

export interface JiraConfig {
  domain: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

export interface JiraResult {
  key?: string;
  url?: string;
  error?: string;
}

export interface JiraStoryPayload {
  title: string;
  persona: string;
  want: string;
  soThat: string;
  acceptanceCriteria: string[];
  gherkinText: string;
}
