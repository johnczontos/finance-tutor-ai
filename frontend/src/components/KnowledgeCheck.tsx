import { useState } from 'react';
import { KnowledgeCheck as KnowledgeCheckType } from '../types/types';

type Props = {
    quiz: KnowledgeCheckType;
};

export default function KnowledgeCheck({ quiz }: Props) {
    const [selected, setSelected] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
  
    const handleSubmit = () => {
      if (!selected) return;
  
      if (selected === quiz.correctAnswer) {
        setIsCorrect(true);
      } else {
        setIsCorrect(false);
      }
      setSubmitted(true);
    };
  
    const handleRetry = () => {
      setSelected(null);
      setSubmitted(false);
      setIsCorrect(false);
    };
  
    return (
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mt-6 relative overflow-hidden">
        {isCorrect && (
          <div className="absolute top-0 left-0 w-full bg-green-500 text-white text-center py-2 font-bold animate-pulse">
            🎉 Good job!
          </div>
        )}
        
        <h2 className="text-lg font-bold mb-4 pt-8">Knowledge Check 🧠</h2>
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
                disabled={submitted && isCorrect} // Only lock inputs after correct
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
        ) : isCorrect ? (
          <p className="text-green-600 font-semibold mt-4">✅ Correct!</p>
        ) : (
          <div className="flex flex-col mt-4">
            <p className="text-red-600 font-semibold mb-2">❌ Incorrect. Please try again!</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }