
import { ChatConfig } from '../types';

export const sendToN8n = async (message: string, config: ChatConfig): Promise<string> => {
  if (!config.webhookUrl) {
    throw new Error('n8n Webhook URL is not configured.');
  }

  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatInput: message,
        sessionId: config.sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n Request failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    // n8n Chat nodes typically return the text in 'output', 'text', or sometimes 'data.text'
    // We try to handle the most common formats.
    const output = data.output || data.text || (data.data && data.data.text) || data[0]?.output;

    if (!output) {
      console.warn('Unexpected n8n response format:', data);
      return typeof data === 'string' ? data : JSON.stringify(data);
    }

    return output;
  } catch (error) {
    console.error('n8n service error:', error);
    throw error;
  }
};
