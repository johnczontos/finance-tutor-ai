import { useState } from 'react';
import { ChatMessage } from '../types/types';

type Props = {
  onSend: (msg: ChatMessage) => void;
  disabled?: boolean;
};

export default function ChatInput({ onSend, disabled}: Props) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    onSend(userMessage);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t bg-white">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a finance question..."
        disabled={disabled}
        className="flex-1 border px-4 py-2 rounded-full text-sm shadow focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={disabled}
        className="bg-blue-600 text-white px-4 py-2 rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        ➤
      </button>
    </form>
  );
}