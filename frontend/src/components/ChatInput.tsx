import { useState } from 'react';
import { ChatMessage } from '../types/types';

type Props = {
  onSend: (msg: ChatMessage) => void;
};

export default function ChatInput({ onSend }: Props) {
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
        className="flex-1 border px-4 py-2 rounded-full text-sm shadow focus:outline-none"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-full">
        ➤
      </button>
    </form>
  );
}