export type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
  };

export type KnowledgeCheck = {
    question: string;
    choices: string[];
    correctAnswer: string;
    explanation: string;
};
