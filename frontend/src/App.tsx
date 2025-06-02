import { useEffect, useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SourcesDisplay from './components/SourcesDisplay';
import YouTubeRecommendations from './components/YouTubeRecommendations';
import AccordionSection from './components/AccordionSection';
import ChatInput from './components/ChatInput';
import QuerySuggestions from './components/QuerySuggestions';
import KnowledgeCheck from './components/KnowledgeCheck';
import { ChatMessage, KnowledgeCheck as KnowledgeCheckType } from './types/types';
import { generateKnowledgeCheck } from './api/api';
import 'katex/dist/katex.min.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "👋 Hi! How can I help you today?",
      sources: [],
    },
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [knowledgeCheckEnabled, setKnowledgeCheckEnabled] = useState(false);
  const [sourcesDisplayEnabled, setSourcesDisplayEnabled] = useState(true);
  const [youtubeRecommendationsEnabled, setYouTubeRecommendationsEnabled] = useState(true);
  const [youtubeVideos, setYoutubeVideos] = useState<{ url: string; title: string }[]>([]);
  const [detailLevel, setDetailLevel] = useState<'simple' | 'regular' | 'in-depth'>('regular');
  const [currentQuiz, setCurrentQuiz] = useState<KnowledgeCheckType | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const loadSuggestions = () => {
    fetch('/example_queries.json')
      .then((res) => res.json())
      .then((data: string[]) => {
        const shuffled = data.sort(() => 0.5 - Math.random());
        setSuggestedQueries(shuffled.slice(0, 4));
      })
      .catch((err) => console.error("Failed to load suggestions:", err));
  };
  
  useEffect(() => {
    if (showSuggestions) loadSuggestions();
  }, [showSuggestions]);

  const addMessage = (msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  };

  const handleSuggestedQuery = async (query: string) => {
    await handleUserMessage({ role: 'user', content: query });
  };

  const handleUserMessage = async (msg: ChatMessage) => {
    addMessage(msg);
    setCurrentQuiz(null);
    setShowSuggestions(false);
    setChatLoading(true);
  
    let fullResponse = '';
  
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: '',
      sources: [],
    };
    setMessages(prev => [...prev, assistantMsg]);
  
    const url = `${API_BASE}/ask/stream?query=${encodeURIComponent(msg.content)}&detailLevel=${detailLevel}`;
    const eventSource = new EventSource(url);
  
    eventSource.addEventListener('message', (event) => {
      fullResponse += event.data;
      setMessages(prev =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { ...m, content: m.content + event.data }
            : m
        )
      );
    });
  
    eventSource.addEventListener('metadata', (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setMessages(prev =>
          prev.map((m, i) =>
            i === prev.length - 1
              ? { ...m, sources: parsed.sources || [] }
              : m
          )
        );
        setYoutubeVideos(parsed.videos || []);
      } catch (err) {
        console.error("Failed to parse metadata:", err);
      }
    });
  
    eventSource.addEventListener('end', async () => {
      eventSource.close();
      setChatLoading(false);
  
      if (knowledgeCheckEnabled) {
        try {
          setQuizLoading(true);
          const quizData = await generateKnowledgeCheck(fullResponse);
          setCurrentQuiz(quizData);
        } catch {
          // fail silently
        } finally {
          setQuizLoading(false);
        }
      }
    });
  
    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
      setChatLoading(false);
    };
  };
  

  const clearChat = () => {
    setMessages([]);
    setCurrentQuiz(null);
    setYoutubeVideos([]);
    setShowSuggestions(true);
    loadSuggestions();
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
        sourcesDisplayEnabled={sourcesDisplayEnabled}
        onToggleSourcesDisplay={() => setSourcesDisplayEnabled(prev => !prev)}
        youtubeRecommendationsEnabled={youtubeRecommendationsEnabled}
        onToggleYouTubeRecommendations={() => setYouTubeRecommendationsEnabled(prev => !prev)}
      />
  
      {/* Sticky header */}
      <div className="sticky top-0 z-40">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </div>
  
      {/* Main content area (non-scrollable) */}
      <div className="flex-1 pt-[64px] pb-[96px] flex flex-col overflow-hidden">
        {/* ChatWindow now controls its own scrolling */}
        <ChatWindow messages={messages} loading={chatLoading} />
  
        {/* Optional metadata after chat */}
        {!chatLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].role === 'assistant' && (
            <div className="flex flex-col lg:flex-row justify-center items-start gap-6 px-4">
              {sourcesDisplayEnabled && (
                <div className="flex-1">
                  <AccordionSection title="Sources">
                    <SourcesDisplay sources={messages[messages.length - 1].sources || []} />
                  </AccordionSection>
                </div>
              )}
              {youtubeRecommendationsEnabled && youtubeVideos.length > 0 && (
                <div className="flex-1">
                  <AccordionSection title="Related Videos">
                    <YouTubeRecommendations videos={youtubeVideos} />
                  </AccordionSection>
                </div>
              )}
            </div>
        )}
  
        <div className="transition-opacity duration-500" style={{ opacity: quizLoading ? 0.5 : 1 }}>
          {currentQuiz && <KnowledgeCheck quiz={currentQuiz} />}
        </div>
  
        {quizLoading && (
          <div className="flex justify-center items-center mt-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}
  
        {messages.length > 0 && (
          <div className="flex justify-center space-x-4 my-4 px-4">
            <button
              onClick={clearChat}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition text-sm"
            >
              Clear Chat
            </button>
            <button
              onClick={() => downloadChat(messages)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition text-sm"
            >
              Download Chat
            </button>
          </div>
        )}
      </div>
  
      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md">
        {showSuggestions && suggestedQueries.length > 0 && (
          <QuerySuggestions examples={suggestedQueries} onSelect={handleSuggestedQuery} />
        )}
        <ChatInput onSend={handleUserMessage} disabled={chatLoading} />
      </div>
    </div>
  );  
}

export default App;
