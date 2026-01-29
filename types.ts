
export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface ChatConfig {
  webhookUrl: string;
  sessionId: string;
}

export interface SmartSuggestion {
  text: string;
}
