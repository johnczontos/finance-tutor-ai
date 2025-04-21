import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchAnswer(query: string) {
  const response = await axios.post(`${API_BASE}/ask`, { query });
  return response.data;
}

export async function generateKnowledgeCheck(topic: string) {
  const response = await axios.post(`${API_BASE}/generate-quiz`, { topic });
  return response.data;
}