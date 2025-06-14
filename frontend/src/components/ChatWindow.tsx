// src/components/ChatWindow.tsx
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { ChatMessage } from '../types/types';

type Props = {
  messages: ChatMessage[];
  loading?: boolean;
};

export default function ChatWindow({ messages, loading }: Props) {

  return (
    <div className="flex flex-col space-y-4 h-[calc(100vh-160px)] overflow-y-auto p-6">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`max-w-xl px-4 py-2 rounded-lg ${
            msg.role === 'user' ? 'bg-blue-100 self-end text-sm' : 'bg-gray-100 self-start prose prose-sm'
          }`}
        >
          {msg.role === 'assistant' ? (
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {msg.content}
            </ReactMarkdown>
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
    </div>
  );
}
