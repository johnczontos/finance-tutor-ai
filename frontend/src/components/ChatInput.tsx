// src/components/ChatInput.tsx
export default function ChatInput() {
  return (
    <form className="flex items-center max-w-3xl mx-auto">
      <input
        type="text"
        placeholder="Your message"
        className="flex-1 px-4 py-3 border rounded-full shadow text-sm focus:outline-none focus:ring focus:ring-blue-300"
      />
      <button
        type="submit"
        className="ml-3 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
      >
        ➤
      </button>
    </form>
  );
}
