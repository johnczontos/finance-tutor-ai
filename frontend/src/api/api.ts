// src/api/api.ts
import axios from 'axios';

interface AskResponse {
  answer: string;
  sources: string[];
}

export async function fetchAnswer(query: string): Promise<AskResponse> {
  const response = await axios.post<AskResponse>(
    '/ask',
    { query },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}
