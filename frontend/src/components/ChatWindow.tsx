import { ChatMessage } from '../types/types';

type Props = {
  messages: ChatMessage[];
};

export default function ChatWindow({ messages }: Props) {
  return (
    <div className="flex flex-col space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto p-6">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`max-w-xl px-4 py-2 rounded-lg text-sm ${
            msg.role === 'user'
              ? 'bg-blue-100 self-end'
              : 'bg-gray-100 self-start'
          }`}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
}
