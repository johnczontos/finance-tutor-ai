export default function ChatWindow() {
    return (
      <div className="mb-24"> {/* pushes chat input out of the way */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">💬</span>
          <h1 className="text-3xl font-bold">FinanceTutor AI</h1>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-300 rounded px-4 py-2 w-fit text-sm">
          🧠 <span>Hi! How may I help you?</span>
        </div>
  
        <button className="mt-4 px-4 py-2 border rounded text-sm hover:bg-gray-100 transition">
          Reset Chat
        </button>
      </div>
    );
  }
  