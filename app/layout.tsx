import type { Metadata } from 'next';
import './globals.css';
import TourProvider from '@/components/tour/TourProvider';
import { getTourFor } from '@/lib/tour';

export const metadata: Metadata = {
  title: 'User Story Generator — by Xavi Marín',
  description:
    'Generate well-structured user stories in Classic and Gherkin format from a simple feature description. Export to CSV or push directly to Jira. Part of the PO Toolkit by Xavi Marín.',
  authors: [{ name: 'Xavi Marín', url: 'https://xavimarin.net' }],
  metadataBase: new URL('https://user-stories.xavimarin.net'),
  openGraph: {
    title: 'User Story Generator — by Xavi Marín',
    description: 'Generate user stories in Classic and Gherkin format. Export to CSV or Jira.',
    type: 'website',
    url: 'https://user-stories.xavimarin.net',
  },
};

const STEPS = getTourFor('user-stories-generator');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-gray-50 text-gray-900 min-h-screen antialiased">
        <TourProvider steps={STEPS}>{children}</TourProvider>
      </body>
    </html>
  );
}
