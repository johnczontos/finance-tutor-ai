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
  const [detailLevel, setDetailLevel] = useState<'simple' | 'regular' | 'in-depth'>('regular');
  const [currentQuiz, setCurrentQuiz] = useState<KnowledgeCheckType | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleUserMessage = async (msg: ChatMessage) => {
    addMessage(msg);
    setCurrentQuiz(null);
    setChatLoading(true);
  
    try {
      const result = await fetchAnswer(msg.content, detailLevel);
      const assistantMsg: ChatMessage = { role: 'assistant', content: result.answer };
      addMessage(assistantMsg);
  
      if (knowledgeCheckEnabled) {
        setQuizLoading(true);
        const quizData = await generateKnowledgeCheck(msg.content);
        setCurrentQuiz(quizData);
        setQuizLoading(false);
      }
    } catch (err) {
      addMessage({ role: 'assistant', content: '⚠️ Something went wrong.' });
      setQuizLoading(false);
    } finally {
      setChatLoading(false);
    }
  };
  

  const clearChat = () => {
    setMessages([]);
    setCurrentQuiz(null);
  };

  const downloadChat = (messages: ChatMessage[]) => {
    const text = messages.map(msg => `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_history.txt';
    a.click();
    URL.revokeObjectURL(url);
  };  

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        knowledgeCheckEnabled={knowledgeCheckEnabled}
        onToggleKnowledgeCheck={() => setKnowledgeCheckEnabled(prev => !prev)}
        detailLevel={detailLevel}
        onChangeDetailLevel={setDetailLevel}
      />
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 overflow-y-auto pt-2 flex flex-col">
        <ChatWindow messages={messages} loading={chatLoading} />
        <div className="transition-opacity duration-500" style={{ opacity: quizLoading ? 0.5 : 1 }}>
          {currentQuiz && <KnowledgeCheck quiz={currentQuiz} />}
        </div>
        {quizLoading && (
          <div className="flex justify-center items-center mt-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex justify-center space-x-4 my-4 transition-opacity duration-500 opacity-100">
            {/* Clear Chat Button */}
            <button
              onClick={clearChat}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition text-sm"
            >
              Clear Chat
            </button>

            {/* Download Chat Button */}
            <button
              onClick={() => downloadChat(messages)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition text-sm"
            >
              Download Chat
            </button>
          </div>
        )}
      </div>

      <ChatInput onSend={(msg) => handleUserMessage(msg)} onResponse={() => {}} />
    </div>
  );
}

export default App;
