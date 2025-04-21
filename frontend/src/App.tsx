import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import KnowledgeCheck from './components/KnowledgeCheck';
import { ChatMessage, KnowledgeCheck as KnowledgeCheckType } from './types/types';
import { fetchAnswer, generateKnowledgeCheck } from './api/api';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [knowledgeCheckEnabled, setKnowledgeCheckEnabled] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<KnowledgeCheckType | null>(null);

  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleUserMessage = async (msg: ChatMessage) => {
    addMessage(msg);

    // 🧹 Clear any previous quiz when a new question is asked
    setCurrentQuiz(null);

    try {
      const result = await fetchAnswer(msg.content);
      const assistantMsg: ChatMessage = { role: 'assistant', content: result.answer };
      addMessage(assistantMsg);

      if (knowledgeCheckEnabled) {
        const quizData = await generateKnowledgeCheck(msg.content);
        setCurrentQuiz(quizData);
      }
    } catch (err) {
      addMessage({ role: 'assistant', content: '⚠️ Something went wrong.' });
    }
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
        {currentQuiz && <KnowledgeCheck quiz={currentQuiz} />}
      </div>
      <ChatInput onSend={(msg) => handleUserMessage(msg)} onResponse={() => {}} />
    </div>
  );
}

export default App;
