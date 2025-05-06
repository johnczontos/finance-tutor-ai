const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchAnswerStream(
  query: string,
  detailLevel: 'simple' | 'regular' | 'in-depth',
  onToken: (token: string) => void
): Promise<{ sources: any[]; videos: any[] }> {
  const response = await fetch(`${API_BASE}/ask/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, detailLevel }),
  });

  if (!response.ok || !response.body) {
    throw new Error('Failed to stream response');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  let finalSources: any[] = [];
  let finalVideos: any[] = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Save incomplete line

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const data = line.slice(5).trim();

        // Handle metadata object
        if (data.startsWith('{') && line.includes('"sources"')) {
          const meta = JSON.parse(data);
          finalSources = meta.sources || [];
          finalVideos = meta.videos || [];
        } else {
          onToken(data);
        }
      }
    }
  }

  return { sources: finalSources, videos: finalVideos };
}

export async function generateKnowledgeCheck(topic: string) {
  const response = await fetch(`${API_BASE}/generate-quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) throw new Error('Quiz generation failed');
  return await response.json();
}