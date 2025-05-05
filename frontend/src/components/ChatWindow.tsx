// src/components/ChatWindow.tsx
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types/types';

type Props = {
  messages: ChatMessage[];
  loading?: boolean;
};

export default function ChatWindow({ messages, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto p-6">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`max-w-xl px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
            msg.role === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'
          }`}
        >
          {msg.role === 'assistant' ? (
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          ) : (
            msg.content
          )}
        </div>
      ))}

      {loading && (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500" />
          <span>Thinking...</span>
        </div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
