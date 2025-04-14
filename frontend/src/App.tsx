// src/App.tsx
import React, { useState } from 'react';
import ChatInput from './components/ChatInput';
import AnswerDisplay from './components/AnswerDisplay';
import { fetchAnswer } from './api/api';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetchAnswer(query);
      setAnswer(response.answer);
      setSources(response.sources);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Finance Tutor AI</h1>
      <ChatInput
        query={query}
        setQuery={setQuery}
        onSubmit={handleSubmit}
        loading={loading}
      />
      <AnswerDisplay
        answer={answer}
        sources={sources}
        error={error}
      />
    </div>
  );
};

export default App;