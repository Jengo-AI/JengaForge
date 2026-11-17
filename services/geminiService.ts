/**
 * Chat with Gemini assistant via the server-side proxy endpoint (/api/chat).
 */
export const chatWithGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[] = []
): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 503 && data?.code === 'SERVER_API_KEY_NOT_CONFIGURED') {
        return 'Gemini assistant is currently unavailable until server configuration is complete.';
      }
      if (response.status === 429) {
        return 'Chat rate limit reached. Please wait a moment before asking another question.';
      }
      return data?.error || 'Error connecting to JengaForge AI backend. Please try again.';
    }

    return data?.text || 'I was unable to generate a response. Please try asking again.';
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown network error';
    console.error('Gemini Proxy Error:', errMsg);
    return 'Having trouble connecting to JengaForge AI right now. Please verify the server is running and try again.';
  }
};

/**
 * AI Workflow Suggestion Service
 * Routes requests through /api/workflow/suggest, constrained to repository tools.
 */
export const suggestAIWorkflow = async (prompt: string) => {
  try {
    const response = await fetch('/api/workflow/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt.trim() }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return { status: 'error', message: data?.error || 'Failed to synthesize workflow.' };
    }

    return { status: 'success', data: data.data };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown network error';
    return { status: 'error', message: `Network error: ${errMsg}` };
  }
};
