export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: {
    url?: string;
    heading?: string;
  }[];
  videos?: {
    url: string;
    title: string;
  }[];
};

export type KnowledgeCheck = {
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
};
