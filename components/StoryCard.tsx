'use client';

import { useState } from 'react';
import type { Story, JiraResult } from '@/types';
import { storyToClassic, storyToGherkin } from '@/lib/storyTemplates';

const PRIORITY_STYLES: Record<string, string> = {
  'Must Have':   'bg-red-50 text-red-700 border-red-200',
  'Should Have': 'bg-amber-50 text-amber-700 border-amber-200',
  'Could Have':  'bg-emerald-50 text-emerald-700 border-emerald-200',
};

interface StoryCardProps {
  story: Story;
  onSendToJira: (story: Story) => Promise<JiraResult>;
  jiraLoading: boolean;
}

export default function StoryCard({ story, onSendToJira, jiraLoading }: StoryCardProps) {
  const [view, setView] = useState<'classic' | 'gherkin'>('classic');
  const [copied, setCopied] = useState(false);
  const [jiraResult, setJiraResult] = useState<JiraResult | null>(null);

  const copyText = view === 'gherkin' ? storyToGherkin(story) : storyToClassic(story);

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(copyText);
    } catch {
      /* Clipboard API blocked (e.g. embedded iframe without permission) — fail silently. */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJira = async () => {
    const result = await onSendToJira(story);
    setJiraResult(result);
    setTimeout(() => setJiraResult(null), 6000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center border border-gray-200">
              {story.index}
            </span>
            <h3 className="text-sm font-semibold text-gray-900 truncate">{story.title}</h3>
          </div>
          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${PRIORITY_STYLES[story.priority] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {story.priority}
          </span>
        </div>
      </div>

      {/* View toggle */}
      <div className="px-6 pt-4 flex gap-1">
        {(['classic', 'gherkin'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              view === v
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            {v === 'classic' ? 'Classic' : 'Gherkin'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {view === 'classic' ? <ClassicView story={story} /> : <GherkinView story={story} />}
      </div>

      {/* Acceptance criteria */}
      <div className="px-6 pb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
          Acceptance Criteria
        </p>
        <ul className="space-y-1.5">
          {story.acceptanceCriteria.map((ac, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-brand-500" />
              {ac}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="px-6 pb-5 pt-3 flex items-center justify-between gap-3 border-t border-gray-100">
        {/* Copy */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
              </svg>
              <span className="text-emerald-600">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25z"/>
                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25z"/>
              </svg>
              Copy {view === 'gherkin' ? 'Gherkin' : 'story'}
            </>
          )}
        </button>

        {/* Jira */}
        <div className="flex items-center gap-2">
          {jiraResult && (
            <span className={`text-xs font-medium ${jiraResult.error ? 'text-red-600' : 'text-emerald-600'}`}>
              {jiraResult.error
                ? `Error: ${jiraResult.error}`
                : <a href={jiraResult.url} target="_blank" rel="noopener noreferrer" className="underline">Created {jiraResult.key} ↗</a>
              }
            </span>
          )}
          <button
            onClick={handleJira}
            disabled={jiraLoading}
            className="flex items-center gap-1.5 text-xs font-medium text-[#0052CC] hover:text-[#0747A6] bg-[#DEEBFF] hover:bg-[#B3D4FF] border border-[#4C9AFF]/30 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {jiraLoading ? (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.004-1.005Z" opacity=".65"/>
                <path d="M6.016 6.008H17.58a5.22 5.22 0 0 1-5.232 5.215h-2.13V13.28A5.22 5.22 0 0 1 5.012 8.065V7.012a1.005 1.005 0 0 1 1.004-1.004Z" opacity=".4"/>
                <path d="M11.572 0h11.564a5.218 5.218 0 0 1-5.232 5.215h-2.131v2.057A5.215 5.215 0 0 1 10.568 12.52V1.005A1.005 1.005 0 0 1 11.572 0Z"/>
              </svg>
            )}
            Send to Jira
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-views ────────────────────────────────────────────────────────────────

function ClassicView({ story }: { story: Story }) {
  const { persona, want, soThat } = story.classic;
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-1 font-mono text-sm border border-gray-200">
      <p><span className="text-gray-500">As a</span> <span className="text-brand-600 font-medium">{persona}</span>,</p>
      <p><span className="text-gray-500">I want to</span> <span className="text-gray-900">{want}</span>,</p>
      <p><span className="text-gray-500">so that</span> <span className="text-gray-900">{soThat}</span>.</p>
    </div>
  );
}

function GherkinView({ story }: { story: Story }) {
  return (
    <div className="space-y-3">
      {story.gherkin.scenarios.map((scenario, si) => (
        <div key={si} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Scenario: {scenario.name}
          </p>
          <ul className="space-y-1 font-mono text-sm">
            {scenario.steps.map((step, i) => {
              const keyword = step.split(' ')[0];
              const rest = step.slice(keyword.length);
              return (
                <li key={i}>
                  <span className="font-semibold text-brand-600">{keyword}</span>
                  <span className="text-gray-800">{rest}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
