
export type Sender = 'user' | 'ai' | 'system';

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  isThinking?: boolean;
}
