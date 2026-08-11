export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-md">
            <p className="text-xs font-semibold text-gray-900 mb-1">About this tool</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="text-gray-700 font-medium">Problem:</span> Writing well-structured user stories manually is slow and inconsistent.{' '}
              <span className="text-gray-700 font-medium">Solution:</span> A template engine that generates Classic + Gherkin format from structured inputs, with direct Jira export.{' '}
              <span className="text-gray-700 font-medium">Impact:</span> Reduces story writing time from ~20 min to under 2 min per feature.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1.5">
            <p className="text-xs font-semibold text-gray-900">Xavi Marín — PO Toolkit</p>
            <a
              href="https://xavimarin.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-600 hover:text-brand-800 transition-colors"
            >
              xavimarin.net →
            </a>
            <p className="text-xs text-gray-400">
              No data stored on our servers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
