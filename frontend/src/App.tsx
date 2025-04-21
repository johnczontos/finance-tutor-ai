import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { ChatMessage } from './types/types';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [knowledgeCheckEnabled, setKnowledgeCheckEnabled] = useState(false);

  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        knowledgeCheckEnabled={knowledgeCheckEnabled}
        onToggleKnowledgeCheck={() => setKnowledgeCheckEnabled(prev => !prev)}
      />
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 overflow-y-auto pt-2">
        <ChatWindow messages={messages} />
      </div>
      <ChatInput onSend={addMessage} onResponse={addMessage} />
    </div>
  );
}

export default App;
