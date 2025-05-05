// src/components/SourcesDisplay.tsx
import React from 'react';

interface Source {
  heading?: string;
  url?: string;
}

interface SourcesDisplayProps {
  sources: Source[];
}

const SourcesDisplay: React.FC<SourcesDisplayProps> = ({ sources }) => {
  const seen = new Set<string>();
  const uniqueSources = sources.filter((src) => {
    if (!src.url || seen.has(src.url)) return false;
    seen.add(src.url);
    return true;
  });

  if (uniqueSources.length === 0) return null;

  return (
    <div className="mt-4 px-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Sources:</h3>
      <ul className="space-y-2">
        {uniqueSources.map((src, idx) => (
          <li key={idx}>
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-600 hover:underline"
            >
              <span className="text-xl">📄</span>
              <span className="text-sm">
                {src.heading || 'Source document'}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SourcesDisplay;
