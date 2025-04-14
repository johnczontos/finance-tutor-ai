// src/App.tsx
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

export default function App() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <div className="flex flex-col flex-1 p-8 relative">
        <ChatWindow />
        <div className="absolute bottom-0 left-0 right-0 px-8 py-4 bg-white border-t">
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
