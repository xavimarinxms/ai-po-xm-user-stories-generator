/**
 * storyTemplates.ts
 * Pure TypeScript template engine for generating User Stories + Gherkin scenarios.
 */

import type { Story, StoryFormData, Complexity } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const low = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const clean = (s: string) => low(s.trim().replace(/\.$/, ''));

type ArchetypeFn = (data: StoryFormData) => Omit<Story, 'index'>;

// ─── Archetypes ───────────────────────────────────────────────────────────────

const coreHappyPath: ArchetypeFn = ({ persona, mainGoal, benefit, featureTitle, context }) => ({
  id: 'core',
  title: cap(clean(mainGoal)),
  priority: 'Must Have',
  classic: {
    persona,
    want: clean(mainGoal),
    soThat: clean(benefit),
  },
  gherkin: {
    feature: featureTitle,
    scenarios: [
      {
        name: `Successful ${low(featureTitle)}`,
        steps: [
          `Given I am a ${persona} logged into the system`,
          `And I navigate to the ${featureTitle} section`,
          `When I ${clean(mainGoal)}`,
          `Then the system should confirm the action was successful`,
          `And I should see the updated result immediately`,
        ],
      },
    ],
  },
  acceptanceCriteria: [
    `A ${persona} can ${clean(mainGoal)} without errors`,
    `The action completes within 2 seconds`,
    `A success confirmation is displayed after the action`,
    ...(context ? [`The feature supports the following context: ${clean(context)}`] : []),
  ],
});

const validationAndErrors: ArchetypeFn = ({ persona, mainGoal, featureTitle }) => ({
  id: 'validation',
  title: `Validate inputs when trying to ${clean(mainGoal)}`,
  priority: 'Must Have',
  classic: {
    persona,
    want: `receive clear error messages when I provide invalid data while trying to ${clean(mainGoal)}`,
    soThat: 'I can correct mistakes quickly and avoid losing my progress',
  },
  gherkin: {
    feature: featureTitle,
    scenarios: [
      {
        name: 'Required field is empty',
        steps: [
          `Given I am a ${persona} on the ${featureTitle} screen`,
          `When I try to ${clean(mainGoal)} with a required field left empty`,
          `Then I should see an inline error message next to the empty field`,
          `And the form should NOT be submitted`,
          `And the other fields should retain their values`,
        ],
      },
      {
        name: 'Invalid format provided',
        steps: [
          `Given I am a ${persona} on the ${featureTitle} screen`,
          `When I enter data in an incorrect format`,
          `Then I should see a specific error indicating the expected format`,
          `And I should be able to correct the value without losing other inputs`,
        ],
      },
    ],
  },
  acceptanceCriteria: [
    'All required fields are validated before submission',
    'Error messages are specific, human-readable, and appear inline next to the field',
    'The form does not reset on validation failure — filled fields are preserved',
    'Errors disappear as soon as the user corrects the value',
  ],
});

const feedbackAndConfirmation: ArchetypeFn = ({ persona, mainGoal, featureTitle, benefit }) => ({
  id: 'feedback',
  title: `Get confirmation after ${clean(mainGoal)}`,
  priority: 'Should Have',
  classic: {
    persona,
    want: `see clear feedback after I ${clean(mainGoal)}`,
    soThat: clean(benefit),
  },
  gherkin: {
    feature: featureTitle,
    scenarios: [
      {
        name: 'Success notification shown',
        steps: [
          `Given I am a ${persona} who has successfully completed ${low(featureTitle)}`,
          `Then I should see a success notification or confirmation message`,
          `And the notification should disappear automatically after 5 seconds`,
          `Or I should be able to dismiss it manually`,
        ],
      },
      {
        name: 'Action can be undone',
        steps: [
          `Given I have just completed ${low(featureTitle)}`,
          `When I see the confirmation message`,
          `Then I should have the option to undo the action within 5 seconds`,
          `And if I click undo, the system should revert to the previous state`,
        ],
      },
    ],
  },
  acceptanceCriteria: [
    'A toast or inline confirmation appears within 500ms of a successful action',
    'The notification clearly states what happened (e.g. "Story saved successfully")',
    'The notification is accessible (announces to screen readers)',
    'An undo option is provided where reversible',
  ],
});

const emptyAndEdgeState: ArchetypeFn = ({ persona, featureTitle, mainGoal }) => ({
  id: 'empty-state',
  title: `Handle empty state before ${clean(mainGoal)}`,
  priority: 'Should Have',
  classic: {
    persona,
    want: `see a helpful empty state when there is no data yet in ${featureTitle}`,
    soThat: 'I understand what to do next and am not confused by a blank screen',
  },
  gherkin: {
    feature: featureTitle,
    scenarios: [
      {
        name: 'Empty state shown on first load',
        steps: [
          `Given I am a ${persona} accessing ${featureTitle} for the first time`,
          `And there is no existing data`,
          `Then I should see an empty state illustration or message`,
          `And the message should explain what this section is for`,
          `And there should be a clear CTA to ${clean(mainGoal)}`,
        ],
      },
    ],
  },
  acceptanceCriteria: [
    'An empty state is shown when there is no data to display',
    'The empty state includes a short description and a primary CTA',
    'The empty state is visually distinct from a loading or error state',
  ],
});

const permissionsAndAccess: ArchetypeFn = ({ persona, featureTitle, mainGoal }) => ({
  id: 'permissions',
  title: `Control access permissions for ${featureTitle}`,
  priority: 'Must Have',
  classic: {
    persona: 'administrator',
    want: `control who can ${clean(mainGoal)}`,
    soThat: `only authorised ${persona}s can perform this action and data remains secure`,
  },
  gherkin: {
    feature: featureTitle,
    scenarios: [
      {
        name: 'Authorised user can access the feature',
        steps: [
          `Given I am a ${persona} with the correct permissions`,
          `When I navigate to the ${featureTitle} section`,
          `Then I should see and be able to use all available actions`,
        ],
      },
      {
        name: 'Unauthorised user is blocked',
        steps: [
          `Given I am a user without the required permissions`,
          `When I navigate to the ${featureTitle} section`,
          `Then I should see a "Permission denied" message`,
          `And I should NOT be able to ${clean(mainGoal)}`,
          `And the system should NOT expose any sensitive data`,
        ],
      },
    ],
  },
  acceptanceCriteria: [
    'Access is restricted based on user role or permission level',
    'Unauthorised users see a clear, non-technical "access denied" message',
    'The back-end validates permissions on every request — not just the UI',
  ],
});

// ─── Public API ───────────────────────────────────────────────────────────────

const ARCHETYPES: ArchetypeFn[] = [
  coreHappyPath,
  validationAndErrors,
  feedbackAndConfirmation,
  emptyAndEdgeState,
  permissionsAndAccess,
];

const COUNTS: Record<Complexity, number> = { simple: 2, moderate: 3, complex: 5 };

export function generateStories(data: StoryFormData): Story[] {
  const count = COUNTS[data.complexity] ?? 3;
  return ARCHETYPES.slice(0, count).map((fn, i) => ({
    ...fn(data),
    index: i + 1,
  }));
}

// ─── Serializers ──────────────────────────────────────────────────────────────

export function storyToGherkin(story: Story): string {
  const lines: string[] = [`Feature: ${story.gherkin.feature}`, ''];
  for (const scenario of story.gherkin.scenarios) {
    lines.push(`  Scenario: ${scenario.name}`);
    for (const step of scenario.steps) {
      lines.push(`    ${step}`);
    }
    lines.push('');
  }
  return lines.join('\n').trim();
}

export function storyToClassic(story: Story): string {
  const { persona, want, soThat } = story.classic;
  return [
    `As a ${persona},`,
    `I want to ${want},`,
    `so that ${soThat}.`,
    '',
    'Acceptance Criteria:',
    ...story.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`),
  ].join('\n');
}

// ─── Sample data ──────────────────────────────────────────────────────────────

export const SAMPLE_DATA: StoryFormData = {
  featureTitle: 'User Onboarding Flow',
  persona: 'new registered user',
  mainGoal: 'complete my profile setup in under 3 minutes',
  benefit: 'I can start using the platform immediately without being blocked by missing information',
  context: 'The onboarding consists of 3 steps: personal info, role selection, and notification preferences',
  complexity: 'moderate',
};
