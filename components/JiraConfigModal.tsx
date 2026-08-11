'use client';

import { useState } from 'react';
import type { JiraConfig } from '@/types';

interface JiraConfigModalProps {
  config: JiraConfig | null;
  onSave: (config: JiraConfig) => void;
  onClose: () => void;
}

export default function JiraConfigModal({ config, onSave, onClose }: JiraConfigModalProps) {
  const [form, setForm] = useState<JiraConfig>(config ?? {
    domain: '', email: '', apiToken: '', projectKey: '',
  });
  const [showToken, setShowToken] = useState(false);

  const handleChange = (field: keyof JiraConfig) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isValid = form.domain && form.email && form.apiToken && form.projectKey;

  const inputClass = "w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0052CC] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.004-1.005Z" opacity=".65"/>
                <path d="M6.016 6.008H17.58a5.22 5.22 0 0 1-5.232 5.215h-2.13V13.28A5.22 5.22 0 0 1 5.012 8.065V7.012a1.005 1.005 0 0 1 1.004-1.004Z" opacity=".4"/>
                <path d="M11.572 0h11.564a5.218 5.218 0 0 1-5.232 5.215h-2.131v2.057A5.215 5.215 0 0 1 10.568 12.52V1.005A1.005 1.005 0 0 1 11.572 0Z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Jira configuration</h2>
              <p className="text-xs text-gray-500">Credentials stay in memory — never stored</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Jira domain <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <span className="px-3 py-2.5 text-xs text-gray-500 bg-gray-50 border-r border-gray-200 shrink-0">
                https://
              </span>
              <input
                type="text"
                value={form.domain}
                onChange={handleChange('domain')}
                placeholder="your-company.atlassian.net"
                className="flex-1 px-3 py-2.5 text-sm bg-white text-gray-900 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Account email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="you@company.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              API token <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={form.apiToken}
                onChange={handleChange('apiToken')}
                placeholder="Paste your Atlassian API token"
                className={inputClass + " pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowToken((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  {showToken
                    ? <path d="M.143 2.31a.75.75 0 011.047-.167l14.5 10.5a.75.75 0 11-.88 1.214l-2.248-1.628C11.346 12.769 9.792 13 8 13c-3.29 0-6.056-1.739-7.676-4.34-.38-.617-.38-1.704 0-2.321.17-.275.37-.537.587-.786L.31 3.357A.75.75 0 01.143 2.31zm3.49 4.872A7.95 7.95 0 003 8c1.37 2.089 3.539 3.5 5 3.5 1.047 0 2.104-.272 3.07-.737L9.3 9.999A3 3 0 015.643 7.182l-2.01-2.01zM8 3c1.161 0 2.275.28 3.26.778l-1.462-1.059A10.59 10.59 0 008 2.5c-3.29 0-6.056 1.739-7.676 4.34-.38.617-.38 1.704 0 2.321.17.275.37.537.587.786l1.25 1.25C2.736 10.426 2 9.26 2 8c0-2.761 2.686-5 6-5z"/>
                    : <path d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6a2 2 0 100 4 2 2 0 000-4z"/>
                  }
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Get your token at{' '}
              <a
                href="https://id.atlassian.com/manage-profile/security/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-800 hover:underline"
              >
                id.atlassian.com → API tokens
              </a>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Project key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.projectKey}
              onChange={(e) => setForm((p) => ({ ...p, projectKey: e.target.value.toUpperCase() }))}
              placeholder="PROJ"
              className={inputClass + " uppercase"}
            />
          </div>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3">
            <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a6.998 6.998 0 100 14A6.998 6.998 0 008 1zm0 2.5a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 3.5zm0 8a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
            <p className="text-xs text-amber-700">
              Credentials are sent to a server-side proxy and never stored. They only live in memory for this session.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => isValid && onSave(form)}
            disabled={!isValid}
            className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            Save & connect
          </button>
        </div>
      </div>
    </div>
  );
}
