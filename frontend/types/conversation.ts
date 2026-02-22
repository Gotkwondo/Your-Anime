// Conversation types based on PRD Section 2.3 - F1, F3, F4
export type PersonaType = 'sommelier' | 'cafe_owner' | 'otaku_friend';

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  embedding?: number[]; // 1536-dim vector (future)
}

export interface Conversation {
  id: string;
  userId: string;
  personaType: PersonaType;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationListItem {
  id: string;
  title: string;
  personaType: PersonaType;
  lastMessage: string;
  lastMessageAt: Date;
  messageCount: number;
}

export interface Persona {
  id: PersonaType;
  name: string;
  description: string;
  tone: string;
  exampleMessage: string;
}
