import { useState } from 'react';
import { KnowledgeCheck as KnowledgeCheckType } from '../types/types';

type Props = {
    quiz: KnowledgeCheckType;
};

export default function KnowledgeCheck({ quiz }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected) {
      setSubmitted(true);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mt-6">
      <h2 className="text-lg font-bold mb-4">Knowledge Check 🧠</h2>
      <p className="mb-4">{quiz.question}</p>

      <div className="space-y-2 mb-4">
        {quiz.choices.map((choice, idx) => (
          <label key={idx} className="flex items-center space-x-2">
            <input
              type="radio"
              name="knowledge-check"
              value={choice}
              checked={selected === choice}
              onChange={() => setSelected(choice)}
              disabled={submitted}
              className="accent-blue-600"
            />
            <span>{choice}</span>
          </label>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Submit
        </button>
      ) : (
        <div className="mt-4">
          {selected === quiz.correctAnswer ? (
            <p className="text-green-600 font-semibold">✅ Correct!</p>
          ) : (
            <>
              <p className="text-red-600 font-semibold">❌ Incorrect.</p>
              <p className="text-gray-700 mt-2">{quiz.explanation}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
