import { useState } from 'react';
import { ChatMessage } from '../types/types';
import { fetchAnswer } from '../api/api';

type Props = {
  onSend: (msg: ChatMessage) => void;
  onResponse: (msg: ChatMessage) => void;
};

export default function ChatInput({ onSend, onResponse }: Props) {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    onSend(userMessage);
    setInput('');

    try {
      const result = await fetchAnswer(trimmed);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: result.answer,
      };
      onResponse(assistantMessage);
    } catch (err) {
      onResponse({ role: 'assistant', content: '⚠️ Something went wrong.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t bg-white">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a finance question..."
        className="flex-1 border px-4 py-2 rounded-full text-sm shadow focus:outline-none"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-full">
        ➤
      </button>
    </form>
  );
}
