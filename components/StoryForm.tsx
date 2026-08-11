'use client';

import { useState } from 'react';
import type { StoryFormData } from '@/types';
import { SAMPLE_DATA } from '@/lib/storyTemplates';

const PERSONA_SUGGESTIONS = [
  'new registered user', 'returning customer', 'product manager',
  'developer', 'administrator', 'guest user', 'team member', 'account owner',
];

const COMPLEXITY_OPTIONS = [
  { value: 'simple' as const, label: 'Simple', desc: '2 stories' },
  { value: 'moderate' as const, label: 'Moderate', desc: '3 stories' },
  { value: 'complex' as const, label: 'Complex', desc: '5 stories' },
];

interface StoryFormProps {
  values: StoryFormData;
  onChange: (values: StoryFormData) => void;
  onGenerate: () => void;
  loading: boolean;
}

export default function StoryForm({ values, onChange, onGenerate, loading }: StoryFormProps) {
  const [freeText, setFreeText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [showStructured, setShowStructured] = useState(false);

  const handleChange = (field: keyof StoryFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...values, [field]: e.target.value });

  const handleParseWithAI = async () => {
    if (!freeText.trim()) return;
    setParsing(true);
    setParseError('');
    try {
      const res = await fetch('/api/parse-feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: freeText }),
      });
      const data = await res.json();
      if (data.error) {
        setParseError(data.error);
      } else {
        onChange({
          ...values,
          featureTitle: data.featureTitle || '',
          persona: data.persona || '',
          mainGoal: data.mainGoal || '',
          benefit: data.benefit || '',
          context: data.context || '',
        });
        setShowStructured(true);
      }
    } catch {
      setParseError('Network error. Please try again.');
    } finally {
      setParsing(false);
    }
  };

  const isValid = values.featureTitle && values.persona && values.mainGoal && values.benefit;

  const inputClass = "w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Feature details</h2>
          <p className="text-xs text-gray-500 mt-0.5">Describe your feature or fill the fields</p>
        </div>
        <button
          type="button"
          onClick={() => { onChange(SAMPLE_DATA); setShowStructured(true); }}
          className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          ✨ Sample data
        </button>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); if (isValid) onGenerate(); }}
        className="space-y-4"
      >
        {/* ── Free text input ── */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Describe the feature in plain language
          </label>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={3}
            placeholder='e.g. "Users need to be able to reset their password from a link sent to their email"'
            className={inputClass + " resize-none"}
          />

          {parseError && (
            <p className="text-xs text-red-600 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a5 5 0 110 10A5 5 0 018 3zm-.75 2.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 6.5a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
              {parseError}
            </p>
          )}

          <button
            type="button"
            onClick={handleParseWithAI}
            disabled={!freeText.trim() || parsing}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-brand-300 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {parsing ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Parsing with AI…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                </svg>
                Parse with AI → fill fields automatically
              </>
            )}
          </button>
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <button
            type="button"
            onClick={() => setShowStructured((s) => !s)}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors shrink-0"
          >
            {showStructured ? '▲ Hide fields' : '▼ Or fill manually'}
          </button>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* ── Structured fields (collapsible) ── */}
        {showStructured && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Feature title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={values.featureTitle}
                onChange={handleChange('featureTitle')}
                placeholder="e.g. Password Reset Flow"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                User persona <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={values.persona}
                onChange={handleChange('persona')}
                placeholder="e.g. registered user"
                list="persona-suggestions"
                className={inputClass}
              />
              <datalist id="persona-suggestions">
                {PERSONA_SUGGESTIONS.map((p) => <option key={p} value={p} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Main goal — "I want to…" <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={values.mainGoal}
                onChange={handleChange('mainGoal')}
                placeholder="e.g. reset my password from a link sent to my email"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Benefit — "So that…" <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={values.benefit}
                onChange={handleChange('benefit')}
                placeholder="e.g. I can recover access to my account without contacting support"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Additional context <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={values.context}
                onChange={handleChange('context')}
                rows={2}
                placeholder="e.g. link expires after 24h, max 3 attempts"
                className={inputClass + " resize-none"}
              />
            </div>
          </div>
        )}

        {/* Complexity */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Complexity</label>
          <div className="flex gap-2">
            {COMPLEXITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...values, complexity: opt.value })}
                className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  values.complexity === opt.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50 bg-white'
                }`}
              >
                <span className="block">{opt.label}</span>
                <span className="block text-xs font-normal opacity-70 mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full py-3 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Generating…
              </span>
            ) : (
              'Generate user stories →'
            )}
          </button>
          {!isValid && (showStructured || values.featureTitle) && (
            <p className="text-xs text-gray-400 text-center mt-2">
              Fill all required fields or use "Parse with AI" above
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
