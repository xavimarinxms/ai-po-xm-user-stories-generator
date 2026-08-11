import Link from 'next/link';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Describe your feature',
    desc: 'Enter the feature title, user persona, main goal, and expected benefit. Or paste a sentence and let AI parse it for you.',
  },
  {
    step: '02',
    title: 'Choose complexity',
    desc: 'Select Simple (2 stories), Moderate (3), or Complex (5). The engine generates complete stories for each level.',
  },
  {
    step: '03',
    title: 'Export or push to Jira',
    desc: 'Copy each story individually, export all as CSV, or push directly to your Jira project with one click.',
  },
];

const ROADMAP: {
  category: string;
  items: { label: string; desc: string; status: 'planned' | 'considering' }[];
}[] = [
  {
    category: 'Rich input',
    items: [
      { label: 'Image drop (wireframe / screenshot)', desc: 'Drag a mockup or screenshot — AI extracts requirements and fills the form automatically.', status: 'planned' },
      { label: 'PDF / TXT drop', desc: 'Drop a PRD, brief, or requirements doc and generate a full batch of stories from it.', status: 'planned' },
      { label: 'Figma / Notion URL', desc: 'Paste a Figma frame or Notion page URL and let the tool parse it as context.', status: 'considering' },
    ],
  },
  {
    category: 'Export & integrations',
    items: [
      { label: 'Excel export', desc: 'Export stories as a formatted spreadsheet with ID, title, acceptance criteria, priority, and points.', status: 'planned' },
      { label: 'Azure DevOps', desc: 'Push stories directly to Azure DevOps Work Items, same as the Jira integration.', status: 'planned' },
      { label: 'Markdown export', desc: 'Copy stories as Markdown ready to paste in GitHub / GitLab Issues or Confluence.', status: 'planned' },
      { label: 'Copy all at once', desc: 'Single button to copy all generated stories to the clipboard in one action.', status: 'planned' },
    ],
  },
  {
    category: 'Story management',
    items: [
      { label: 'Inline editing', desc: 'Edit any generated story directly in the card before exporting or pushing to Jira.', status: 'planned' },
      { label: 'Drag to reorder', desc: 'Reorder stories by priority using drag and drop before exporting.', status: 'considering' },
      { label: 'Select & export', desc: 'Mark stories as included or discarded and export only the ones you want.', status: 'planned' },
      { label: 'Generate more', desc: 'Add extra stories to an existing set without re-filling the entire form.', status: 'planned' },
    ],
  },
  {
    category: 'AI improvements',
    items: [
      { label: 'Conflict detection', desc: 'AI flags overlaps or contradictions across the generated stories before you export.', status: 'considering' },
      { label: 'Story point estimation', desc: 'Suggest Fibonacci points based on the complexity of each acceptance criterion.', status: 'considering' },
      { label: 'Refinement mode', desc: 'Paste an existing poorly written story and get a rewritten, structured version back.', status: 'planned' },
    ],
  },
  {
    category: 'Batch & sessions',
    items: [
      { label: 'Batch mode', desc: 'Process multiple features at once — input a list and generate all stories in one run.', status: 'considering' },
      { label: 'CSV feature import', desc: 'Upload a CSV of features and generate a full story map in bulk.', status: 'planned' },
      { label: 'Session history', desc: 'Save and revisit previous generation sessions locally, no backend required.', status: 'considering' },
    ],
  },
];

const STATUS_BADGE: Record<string, string> = {
  planned:     'bg-blue-50 text-blue-700 border-blue-200',
  considering: 'bg-gray-100 text-gray-600 border-gray-200',
};
const STATUS_LABEL: Record<string, string> = {
  planned:     'Planned',
  considering: 'Considering',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V3ZM2 8a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V8ZM3 12a1 1 0 000 2h4a1 1 0 000-2H3Z" fill="white"/>
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">User Story Generator</span>
              <span className="hidden sm:inline text-xs text-gray-500 ml-2">
                by{' '}
                <a href="https://xavimarin.net" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors">
                  Xavi Marín
                </a>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#roadmap" className="text-xs text-gray-500 hover:text-gray-700 transition-colors hidden sm:block">
              Roadmap
            </a>
            <a
              href="https://xavimarin.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors hidden sm:block"
            >
              xavimarin.net
            </a>
            <Link
              href="/demo"
              className="text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg px-3.5 py-1.5 transition-colors"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 pt-24 pb-24 text-center">
          <p className="text-xs font-semibold text-brand-600 mb-5 tracking-widest uppercase">
            PO Toolkit · Tool #1 of 13
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5 tracking-tight leading-tight">
            Write user stories<br />in seconds
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
            Describe a feature and get structured user stories in Classic and Gherkin format —
            complete with acceptance criteria. Push directly to Jira with one click.
          </p>
          {/* Integration badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 11.286H6A5.143 5.143 0 0 0 .857 16.43v.857a.857.857 0 0 0 .857.857h9.857a.857.857 0 0 0 .857-.857v-5.143a.857.857 0 0 0-.857-.857zm6.858-3.429L13.286.714a.857.857 0 0 0-1.715 0v8.143a.857.857 0 0 0 .857.857h8.143a.857.857 0 0 0 0-1.714L15.43 7.857l5.143-5.143a.857.857 0 0 0-1.215-1.215l-5.143 5.143L13.286.7a.857.857 0 0 0-.857.857V1.57h-.002z"/></svg>
              Jira integration
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              Classic &amp; Gherkin format
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              CSV export
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              20 min → 2 min per feature
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              ✨ Try with sample data
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M1 8a.75.75 0 01.75-.75h10.69L8.22 3.03a.75.75 0 111.06-1.06l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l4.22-4.22H1.75A.75.75 0 011 8z"/>
              </svg>
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Use your own data
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            No login required · No data stored · Free forever
          </p>
        </section>

        {/* Output preview */}
        <section className="border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What you get</h2>
              <p className="text-sm text-gray-500">Classic and Gherkin format, generated simultaneously</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Classic format */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Classic format</span>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-900 font-medium leading-relaxed">
                    As a <span className="text-brand-600 font-semibold">new user</span>, I want to{' '}
                    <span className="text-brand-600 font-semibold">complete onboarding in under 5 steps</span> so that{' '}
                    <span className="text-brand-600 font-semibold">I can start using the product without friction</span>.
                  </p>
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Acceptance criteria</p>
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      <li className="flex gap-2"><span className="text-brand-500 mt-0.5">✓</span>User sees a progress indicator showing current step out of total steps</li>
                      <li className="flex gap-2"><span className="text-brand-500 mt-0.5">✓</span>User can skip optional steps and complete them later from the profile page</li>
                      <li className="flex gap-2"><span className="text-brand-500 mt-0.5">✓</span>Completion triggers a welcome email within 60 seconds</li>
                    </ul>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">Medium · 5 pts</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-medium">Onboarding</span>
                  </div>
                </div>
              </div>
              {/* Gherkin format */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Gherkin format</span>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs leading-relaxed">
                  <p className="text-purple-400 font-semibold">Feature:</p>
                  <p className="text-gray-300 ml-2 mb-3">Streamlined user onboarding</p>
                  <p className="text-purple-400 font-semibold">Scenario:</p>
                  <p className="text-gray-300 ml-2 mb-2">New user completes onboarding</p>
                  <p><span className="text-blue-400 font-semibold">Given</span><span className="text-gray-300"> I am a new user on the platform</span></p>
                  <p><span className="text-blue-400 font-semibold">When</span><span className="text-gray-300"> I follow the onboarding flow</span></p>
                  <p><span className="text-blue-400 font-semibold">Then</span><span className="text-gray-300"> I complete setup in 5 steps or fewer</span></p>
                  <p><span className="text-blue-400 font-semibold">And</span><span className="text-gray-300"> I receive a welcome email within 60s</span></p>
                  <p><span className="text-blue-400 font-semibold">And</span><span className="text-gray-300"> I can skip optional steps</span></p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">Both formats generated from the same input · Ready to copy or push to Jira</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-gray-100 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How it works</h2>
              <p className="text-sm text-gray-500">Three steps from idea to Jira-ready story</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="bg-white rounded-xl border border-gray-200 p-6">
                  <span className="text-xs font-bold text-brand-500 font-mono">{item.step}</span>
                  <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section id="roadmap" className="border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Roadmap</h2>
              <p className="text-sm text-gray-500">What's coming next to this tool</p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE.planned}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Planned
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE.considering}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Considering
                </span>
              </div>
            </div>

            <div className="space-y-10">
              {ROADMAP.map((group) => (
                <div key={group.category}>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    {group.category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.items.map((item) => (
                      <div
                        key={item.label}
                        className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900 leading-snug">{item.label}</p>
                          <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_BADGE[item.status]}`}>
                            {STATUS_LABEL[item.status]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why I built this */}
        <section className="border-t border-gray-100 bg-gray-50">
          <div className="max-w-3xl mx-auto px-6 py-16">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">Why I built this</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Problem', text: 'Writing well-structured user stories manually is slow (20+ min/feature) and output quality varies by author.' },
                { label: 'Solution', text: 'A template engine that generates Classic + Gherkin stories from structured inputs, with direct Jira export via API.' },
                { label: 'Impact', text: 'Reduces story writing from ~20 min to under 2 min per feature, with consistent quality and format every time.' },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">{item.label}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>
            Built by{' '}
            <a href="https://xavimarin.net" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
              Xavi Marín
            </a>
            {' '}· No data stored on our servers
          </span>
          <span>PO Toolkit #1 of 13</span>
        </div>
      </footer>
    </div>
  );
}
