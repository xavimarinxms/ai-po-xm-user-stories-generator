'use client';

import { Suspense, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StoryForm from '@/components/StoryForm';
import StoryCard from '@/components/StoryCard';
import JiraConfigModal from '@/components/JiraConfigModal';
import { generateStories, storyToGherkin, SAMPLE_DATA } from '@/lib/storyTemplates';
import { downloadCSV } from '@/lib/csvExport';
import type { StoryFormData, Story, JiraConfig, JiraResult } from '@/types';

const EMPTY_FORM: StoryFormData = {
  featureTitle: '',
  persona: '',
  mainGoal: '',
  benefit: '',
  context: '',
  complexity: 'moderate',
};

export default function DemoPage() {
  const [form, setForm] = useState<StoryFormData>(EMPTY_FORM);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [showJiraModal, setShowJiraModal] = useState(false);
  const [jiraConfig, setJiraConfig] = useState<JiraConfig | null>(null);
  const [jiraLoadingId, setJiraLoadingId] = useState<string | null>(null);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setStories(generateStories(form));
      setLoading(false);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 600);
  };

  const handleSendToJira = async (story: Story): Promise<JiraResult> => {
    if (!jiraConfig) {
      setShowJiraModal(true);
      return {};
    }
    setJiraLoadingId(story.id);
    try {
      const res = await fetch('/api/jira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jiraConfig,
          story: {
            title: story.title,
            persona: story.classic.persona,
            want: story.classic.want,
            soThat: story.classic.soThat,
            acceptanceCriteria: story.acceptanceCriteria,
            gherkinText: storyToGherkin(story),
          },
        }),
      });
      return await res.json();
    } catch {
      return { error: 'Network error. Please try again.' };
    } finally {
      setJiraLoadingId(null);
    }
  };

  const handleReset = () => {
    setStories([]);
    setForm(EMPTY_FORM);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Suspense fallback={null}>
        <Header showBackToHome />
      </Suspense>

      {/* Demo banner */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2.5 text-center">
        <p className="text-xs text-blue-700 font-medium">
          Demo — sample data loaded by default.{' '}
          <span className="text-blue-500">Portfolio project by{' '}</span>
          <a href="https://xavimarin.net" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800 transition-colors">
            Xavi Marín
          </a>
        </p>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">User Story Generator</h1>
          <p className="text-sm text-gray-600 mt-1">
            Fill in the feature details and generate structured stories — or{' '}
            <button
              onClick={() => setForm(SAMPLE_DATA)}
              data-tour="sample"
              className="text-brand-600 hover:text-brand-800 underline transition-colors"
            >
              load sample data
            </button>
            {' '}to try it instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Form */}
          <div className="lg:col-span-2" data-tour="input">
            <StoryForm
              values={form}
              onChange={setForm}
              onGenerate={handleGenerate}
              loading={loading}
            />

            {/* Jira config button */}
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setShowJiraModal(true)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                  jiraConfig
                    ? 'text-[#0052CC] bg-[#DEEBFF] border-[#4C9AFF]/40 hover:bg-[#B3D4FF]'
                    : 'text-gray-600 bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.004-1.005Z" opacity=".65"/>
                  <path d="M6.016 6.008H17.58a5.22 5.22 0 0 1-5.232 5.215h-2.13V13.28A5.22 5.22 0 0 1 5.012 8.065V7.012a1.005 1.005 0 0 1 1.004-1.004Z" opacity=".4"/>
                  <path d="M11.572 0h11.564a5.218 5.218 0 0 1-5.232 5.215h-2.131v2.057A5.215 5.215 0 0 1 10.568 12.52V1.005A1.005 1.005 0 0 1 11.572 0Z"/>
                </svg>
                {jiraConfig ? `Jira: ${jiraConfig.projectKey} ✓` : 'Connect Jira'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div id="results" className="lg:col-span-3 space-y-4" data-tour="results">
            {stories.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">Stories will appear here</p>
                <p className="text-xs text-gray-400 mt-1">Fill the form and click Generate</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
                <svg className="animate-spin w-7 h-7 text-brand-500 mb-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p className="text-sm text-gray-500">Generating your stories…</p>
              </div>
            )}

            {!loading && stories.length > 0 && (
              <>
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {stories.length} stories
                    <span className="font-normal text-gray-500 ml-1.5">· {form.featureTitle}</span>
                  </p>
                  <div className="flex items-center gap-2" data-tour="export">
                    <button
                      onClick={() => downloadCSV(stories, form.featureTitle)}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2.75 14A1.75 1.75 0 011 12.25v-2.5a.75.75 0 011.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25v-2.5a.75.75 0 011.5 0v2.5A1.75 1.75 0 0113.25 14H2.75z"/>
                        <path d="M7.25 7.689V2a.75.75 0 011.5 0v5.689l1.97-1.97a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 6.78a.75.75 0 011.06-1.06l1.97 1.969z"/>
                      </svg>
                      Export CSV
                    </button>
                    <button
                      onClick={handleReset}
                      className="text-xs font-medium text-gray-400 hover:text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onSendToJira={handleSendToJira}
                    jiraLoading={jiraLoadingId === story.id}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {showJiraModal && (
        <JiraConfigModal
          config={jiraConfig}
          onSave={(cfg) => { setJiraConfig(cfg); setShowJiraModal(false); }}
          onClose={() => setShowJiraModal(false)}
        />
      )}
    </div>
  );
}
