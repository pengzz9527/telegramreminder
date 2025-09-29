export const sendTelegramMessage = async (token: string, chatId: string, text: string): Promise<void> => {
  const targetUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  
  // Using a CORS proxy to work around potential "Failed to fetch" errors
  // that can be caused by browser restrictions, ad-blockers, or sandboxed environments.
  // Public proxies can be unreliable; this is another attempt with a different service.
  const proxyUrl = 'https://corsproxy.io/?';
  const url = proxyUrl + targetUrl;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
    }),
  });

  if (!response.ok) {
    let errorDescription = `Request failed with status ${response.status} (${response.statusText})`;
    try {
      // Try to parse the error response as JSON, which is what Telegram API returns.
      const errorData = await response.json();
      errorDescription = errorData.description || errorDescription;
    } catch (e) {
      // If parsing fails, it might be a text/html error from the proxy itself.
      // In that case, we'll stick with the status text we already have.
      console.error("Could not parse JSON from error response.", e);
    }
    throw new Error(`Telegram API error: ${errorDescription}`);
  }
};