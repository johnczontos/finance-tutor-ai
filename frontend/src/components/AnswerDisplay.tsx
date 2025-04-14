// src/components/AnswerDisplay.tsx
import React from 'react';

interface AnswerDisplayProps {
  answer: string;
  sources: string[];
  error: string;
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answer, sources, error }) => {
  return (
    <div className="mt-6">
      {error && (
        <div className="text-red-600 font-semibold mb-4">{error}</div>
      )}

      {answer && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Answer:</h2>
          <p className="text-gray-800 whitespace-pre-line">{answer}</p>
        </div>
      )}

      {sources.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Sources:</h3>
          <ul className="list-disc list-inside text-gray-600">
            {sources.map((src, idx) => (
              <li key={idx}>{src}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnswerDisplay;