import type { TourStep } from '@/components/tour/TourProvider';

/**
 * Tour copy for every tool in the suite, keyed by the slug used in the
 * suite's lib/tools.ts. Each tool repo imports only its own entry:
 *
 *   import { getTourFor } from '@/lib/tour';
 *   const steps = getTourFor('prd-builder');
 *
 * The five highlighted targets are the same across tools, so the tag work in
 * each repo is identical:
 *
 *   data-tour="input"    the form / input panel
 *   data-tour="sample"   the ✨ Sample data button
 *   data-tour="run"      the primary action button
 *   data-tour="results"  the output panel
 *   data-tour="export"   the export / copy actions
 *
 * A missing target degrades to a centred card, so partially tagged tools
 * still run their tour.
 */

interface ToolTourCopy {
  /** Tool name as shown in the first step. */
  name: string;
  /** One sentence: what this tool is for. */
  intro: string;
  /** What goes in the input panel, and what makes the output good. */
  input: string;
  /** What the primary action actually does. */
  run: string;
  /** How to read the output. */
  results: string;
  /** Where the output goes next. */
  exports: string;
}

const COPY: Record<string, ToolTourCopy> = {
  'interview-insights': {
    name: 'Interview Insights Extractor',
    intro:
      'Turns a raw user interview into insights, verbatim quotes and recurring themes in about a minute.',
    input:
      'Paste the transcript — speaker labels optional. Product context and your learning goal are optional too, but they sharpen what the extractor looks for.',
    run: 'Extracts insights, pulls the quotes behind them and clusters recurring themes across the interview.',
    results:
      'Every insight keeps the quote and timestamp it came from, so you can defend it in a prioritization discussion instead of paraphrasing from memory.',
    exports: 'Send the insights to your research repo, or export them as Markdown or CSV.',
  },
  'competitor-monitor': {
    name: 'Competitor Monitor',
    intro:
      'Tracks changes on competitor websites and gives you a digest of what actually matters to your product.',
    input:
      'Add the URLs you care about — pricing pages, changelogs, positioning pages. Say what counts as a relevant change and the rest is filtered out.',
    run: 'Fetches the current version of each page and diffs it against the last snapshot.',
    results:
      'Changes are grouped by competitor and rated by relevance, with the exact copy that changed so you can judge it yourself.',
    exports: 'Export the digest, or copy a single change into your competitive one-pager.',
  },
  'user-stories-generator': {
    name: 'User Story Generator',
    intro: 'Splits a feature description into sprint-ready user stories with acceptance criteria.',
    input:
      'Describe the feature once, in plain language. Story format and detail level control how the output lands in your tracker.',
    run: 'Breaks the feature into independent stories, each with acceptance criteria and a rough estimate.',
    results:
      'Stories are editable inline. Criteria are written so a developer and a tester read them the same way.',
    exports:
      'Export straight to Jira with criteria intact, so refinement starts from a draft instead of a blank ticket.',
  },
  'prd-builder': {
    name: 'PRD Builder',
    intro:
      'Turns a plain-language brief into a structured PRD: problem, scope, non-goals, requirements and open questions.',
    input:
      'Describe the feature the way you would explain it to a colleague. Target user and success metric are what keep the draft from being generic.',
    run: 'Generates every section in a consistent structure, including the non-goals most drafts leave implicit.',
    results:
      'Open questions are listed separately with space for an owner, so the unresolved parts stay visible instead of slipping into the sprint.',
    exports: 'Export to Markdown or Confluence and keep editing where your team reviews documents.',
  },
  'story-map-builder': {
    name: 'Story Map Builder',
    intro:
      'Builds a map of the whole user journey, then slices it into increments you could actually release.',
    input:
      'Start from the user activities, then add the steps underneath each one. Import an existing backlog if you already have the pieces.',
    run: 'Arranges activities and steps into the map and proposes a first horizontal slice.',
    results:
      'Each slice is a candidate release. Move a story between slices and the scope of every release updates with it.',
    exports: 'Export a slice as a set of tickets, or the whole map as an image for the wall.',
  },
  'rice-jira': {
    name: 'RICE / MoSCoW Calculator',
    intro:
      'Scores and ranks your backlog with RICE, and re-cuts the same list as MoSCoW when numbers are not the right language.',
    input:
      'One item per line, or paste a CSV straight out of Jira. Missing scores are estimated and flagged as low confidence rather than silently filled in.',
    run: 'Scores every item, sorts the list, and shows the arithmetic behind each position.',
    results:
      'Switch between the RICE ranking and the MoSCoW cut without re-entering anything — same data, two different conversations.',
    exports: 'Push the ranked list back to Jira or Linear, or export it as CSV for the roadmap review.',
  },
  'stakeholder-updates': {
    name: 'Stakeholder Update Generator',
    intro: 'Converts sprint status into an update a non-technical stakeholder will actually read.',
    input:
      'Paste the board summary as it is. Audience and tone decide how much translation the draft does.',
    run: 'Rewrites ticket language into outcomes, risks and decisions needed.',
    results:
      'Blockers are separated from progress and always carry an owner and a date, which is what turns an update into a decision.',
    exports: 'Copy it into email or Slack, formatted for the channel you picked.',
  },
  'release-notes-generator': {
    name: 'Release Notes Generator',
    intro: 'Turns a list of merged tickets into notes written for users, not for the team that closed them.',
    input:
      'Paste the tickets or connect the release. Pick the audience: end users, admins or internal teams.',
    run: 'Groups changes by what they mean for the user and drops the internal refactors nobody outside the team needs.',
    results:
      'Highlights first, fixes after. Every entry is one sentence a user can act on, with the ticket reference kept for traceability.',
    exports: 'Export as Markdown for the changelog, or as HTML for the in-app release note.',
  },
  'metrics-dashboard': {
    name: 'Product Metrics Dashboard',
    intro: 'Visualizes your key product metrics in a clean dashboard — no BI tool and no SQL.',
    input:
      'Upload a CSV or connect a source, then pick the metrics that matter and the period you want to compare against.',
    run: 'Builds the dashboard: trend per metric, change against the baseline and the segments behind it.',
    results:
      'Each chart states the baseline it is measured against, so a number never appears without the context that makes it readable.',
    exports: 'Export a chart for a deck, or the whole dashboard as a shareable snapshot.',
  },
  'okr-generator': {
    name: 'OKR Generator',
    intro:
      'Turns a fuzzy strategic goal into an objective and key results you can actually grade at the end of the quarter.',
    input:
      'State the goal in plain language. A baseline is optional but it is what makes the targets arguable instead of aspirational.',
    run: 'Proposes one objective with two to four key results, each with a baseline, a target and a measurement source.',
    results:
      'Every key result is checked for measurability and paired with a counter-metric, so a win in one place is not a hidden loss elsewhere.',
    exports: 'Export to your OKR tool or as CSV for the quarterly planning doc.',
  },
  'hypothesis-validator': {
    name: 'A/B Hypothesis Validator',
    intro: 'Designs experiments, calculates statistical significance and documents what you learned.',
    input:
      'Define the hypothesis and the primary metric before the numbers. The tool asks for the minimum effect you would act on.',
    run: 'Calculates the sample size you need up front, and significance once results are in.',
    results:
      'It tells you whether you can call the test, or how much longer it needs to run — and it says "inconclusive" when that is the honest answer.',
    exports: 'Export the experiment record so the learning survives the sprint that produced it.',
  },
  'feature-validation-canvas': {
    name: 'Feature Validation Canvas',
    intro:
      'Pressure-tests a feature idea against desirability, viability and feasibility before anyone builds it.',
    input:
      'Answer the prompts on each of the three axes. Gaps are fine — an unanswered prompt is itself a finding.',
    run: 'Scores each axis and surfaces the weakest assumptions behind the idea.',
    results:
      'Weak spots come back as the assumptions to test first, with a suggested way to test each one. It is a starting point, not a verdict.',
    exports: 'Export the canvas as a one-pager for the discovery review.',
  },
};

/** Build the six-step tour for a tool. Returns [] for an unknown slug. */
export function getTourFor(slug: string): TourStep[] {
  const c = COPY[slug];
  if (!c) return [];

  return [
    { kicker: 'Welcome', title: c.name, body: `${c.intro} This 30-second tour shows how to use it.` },
    { target: 'input', kicker: 'Step 1', title: 'Start here', body: c.input, place: 'right' },
    {
      target: 'sample',
      kicker: 'Step 2',
      title: 'Sample data fills every field',
      body:
        'Realistic example data, one click. Use it to see the shape of the output before you paste anything of your own.',
      place: 'right',
    },
    { target: 'run', kicker: 'Step 3', title: 'Run it', body: c.run, place: 'right' },
    { target: 'results', kicker: 'Step 4', title: 'Read the output', body: c.results, place: 'left' },
    {
      target: 'export',
      kicker: 'Step 5',
      title: 'Take it where your team works',
      body: `${c.exports} Nothing is stored on our servers.`,
      place: 'left',
    },
  ];
}

export const TOUR_SLUGS = Object.keys(COPY);
