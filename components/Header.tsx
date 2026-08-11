'use client';

import { useSearchParams } from 'next/navigation';

interface HeaderProps {
  showBackToHome?: boolean;
}

export default function Header({ showBackToHome = false }: HeaderProps) {
  // When loaded inside the AI PO Xavi Marín Suite (?embed=1), the suite's
  // own top bar already shows the tool name and a way back — so this
  // tool's header would just be a duplicate and is skipped.
  const searchParams = useSearchParams();
  if (searchParams.get('embed') === '1') return null;

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo + name */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3ZM2 8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8ZM3 12a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2H3Z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 leading-none">
              User Story Generator
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              by{' '}
              <a
                href="https://xavimarin.net"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-600 transition-colors"
              >
                Xavi Marín
              </a>
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {showBackToHome ? (
            <>
              <a
                href="https://ai-po-xavi-marin-suite.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
              >
                ← AI PO Suite
              </a>
              <a
                href="/"
                className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
              >
                ← Home
              </a>
            </>
          ) : (
            <>
              <a
                href="https://xavimarin.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors hidden sm:block"
              >
                xavimarin.net
              </a>
              <a
                href="/demo"
                className="text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg px-3.5 py-1.5 transition-colors"
              >
                Try Demo
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
