import { useEffect, useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SourcesDisplay from './components/SourcesDisplay';
import YouTubeRecommendations from './components/YouTubeRecommendations';
import ChatInput from './components/ChatInput';
import QuerySuggestions from './components/QuerySuggestions';
import KnowledgeCheck from './components/KnowledgeCheck';
import { ChatMessage, KnowledgeCheck as KnowledgeCheckType } from './types/types';
import { generateKnowledgeCheck } from './api/api';

const API_BASE = import.meta.env.VITE_API_URL || '';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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

  useEffect(() => {
    fetch('/example_queries.json')
      .then(res => res.json())
      .then((data: string[]) => {
        const shuffled = data.sort(() => 0.5 - Math.random());
        setSuggestedQueries(shuffled.slice(0, 4));
      })
      .catch(err => console.error("Failed to load suggestions:", err));
  }, []);

  const addMessage = (msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  };

  const handleSuggestedQuery = async (query: string) => {
    await handleUserMessage({ role: 'user', content: query });
  };

  const handleUserMessage = async (msg: ChatMessage) => {
    addMessage(msg);
    setCurrentQuiz(null);
    setChatLoading(true);

    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: '',
      sources: [],
    };
    setMessages(prev => [...prev, assistantMsg]);

    const url = `${API_BASE}/ask/stream?query=${encodeURIComponent(msg.content)}&detailLevel=${detailLevel}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener('message', (event) => {
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

    eventSource.addEventListener('end', () => {
      setChatLoading(false);
      eventSource.close();
    });

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
      setChatLoading(false);
    };

    if (knowledgeCheckEnabled) {
      try {
        setQuizLoading(true);
        const quizData = await generateKnowledgeCheck(msg.content);
        setCurrentQuiz(quizData);
      } catch {
        // fail silently
      } finally {
        setQuizLoading(false);
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentQuiz(null);
    setYoutubeVideos([]);
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
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 overflow-y-auto pt-2 flex flex-col">
        <ChatWindow messages={messages} loading={chatLoading} />

        {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
          <div className="flex flex-col lg:flex-row justify-center items-start gap-6 px-4">
            {sourcesDisplayEnabled && (
              <div className="flex-1">
                <SourcesDisplay sources={messages[messages.length - 1].sources || []} />
              </div>
            )}
            {youtubeRecommendationsEnabled && youtubeVideos.length > 0 && (
              <div className="flex-1">
                <YouTubeRecommendations videos={youtubeVideos} />
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
          <div className="flex justify-center space-x-4 my-4 transition-opacity duration-500 opacity-100">
            <button onClick={clearChat} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition text-sm">
              Clear Chat
            </button>
            <button onClick={() => downloadChat(messages)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition text-sm">
              Download Chat
            </button>
          </div>
        )}
      </div>

      {suggestedQueries.length > 0 && (
        <QuerySuggestions examples={suggestedQueries} onSelect={handleSuggestedQuery} />
      )}
      <ChatInput onSend={handleUserMessage} disabled={chatLoading} />
    </div>
  );
}

export default App;
