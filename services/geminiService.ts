export const chatWithGemini = async (message: string, history: { role: string; parts: { text: string }[] }[] = []) => {
  try {
    // Check for user-provided API key from localStorage (BYOK)
    const apiKey = localStorage.getItem('USER_GEMINI_API_KEY') || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['x-gemini-api-key'] = apiKey;
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        history,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && data?.code === 'MISSING_API_KEY') {
        return "API Key is missing. Please go to your Profile Settings to add your Gemini API Key (BYOK), or configure GEMINI_API_KEY on the server.";
      }
      if (response.status === 403 || data?.code === 'INVALID_API_KEY') {
        return "Your Gemini API key appears to be invalid or unauthorized. Please check your Profile Settings.";
      }
      if (response.status === 429) {
        return "Chat rate limit reached. Please wait a moment before asking another question.";
      }
      return data?.error || "Error connecting to JengaForge AI backend. Please try again.";
    }

    return data?.text || "I was unable to generate a response. Please try asking again.";
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown network error";
    console.error("Gemini Proxy Error:", errMsg);
    return "Network error connecting to JengaForge AI. Please ensure the server is running.";
  }
};

