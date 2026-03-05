import { create } from 'zustand';
import { Conversation, Message, PersonaType } from '@/types/conversation';
import { apiRequest } from '@/lib/api/client';

interface ConversationStore {
  conversations: Conversation[];
  currentConversationId: string | null;
  conversationMessages: Record<string, Message[]>;
  isLoading: boolean;
  error: string | null;

  fetchConversations: () => Promise<void>;
  createConversation: (personaType: PersonaType) => Promise<string>;
  loadConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  appendMessage: (conversationId: string, message: Message) => void;
  getCurrentMessages: () => Message[];
  getCurrentConversation: () => Conversation | null;
  setCurrentConversationId: (id: string | null) => void;
}

interface ApiConversation {
  id: string;
  user_id: string;
  persona_type: PersonaType;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  anime_references: Array<{ mal_id: number; title: string; reasoning: string }>;
}

function mapApiConversation(c: ApiConversation): Conversation {
  return {
    id: c.id,
    userId: c.user_id,
    personaType: c.persona_type,
    title: c.title ?? 'New Conversation',
    createdAt: new Date(c.created_at),
    updatedAt: new Date(c.updated_at),
  };
}

function mapApiMessage(m: ApiMessage): Message {
  return {
    id: m.id,
    conversationId: m.conversation_id,
    role: m.role === 'system' ? 'assistant' : m.role,
    content: m.content,
    timestamp: new Date(m.created_at),
    animeReferences: m.anime_references,
  };
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  conversationMessages: {},
  isLoading: false,
  error: null,

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiRequest<{
        success: true;
        data: { conversations: ApiConversation[] };
      }>('/api/conversations');
      set({
        conversations: res.data.conversations.map(mapApiConversation),
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createConversation: async (personaType: PersonaType) => {
    set({ isLoading: true, error: null });
    const res = await apiRequest<{ success: true; data: ApiConversation }>(
      '/api/conversations',
      { method: 'POST', body: { personaType } },
    );
    const conversation = mapApiConversation(res.data);

    set((state) => ({
      conversations: [conversation, ...state.conversations],
      currentConversationId: conversation.id,
      conversationMessages: { ...state.conversationMessages, [conversation.id]: [] },
      isLoading: false,
    }));

    return conversation.id;
  },

  loadConversation: async (conversationId: string) => {
    set({ currentConversationId: conversationId, isLoading: true, error: null });
    try {
      const res = await apiRequest<{
        success: true;
        data: { conversation: ApiConversation; messages: ApiMessage[] };
      }>(`/api/conversations/${conversationId}`);

      const messages = res.data.messages.map(mapApiMessage);
      set((state) => ({
        conversationMessages: { ...state.conversationMessages, [conversationId]: messages },
        isLoading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  deleteConversation: async (conversationId: string) => {
    await apiRequest(`/api/conversations/${conversationId}`, { method: 'DELETE' });

    set((state) => {
      const { [conversationId]: _, ...remainingMessages } = state.conversationMessages;
      return {
        conversations: state.conversations.filter((c) => c.id !== conversationId),
        conversationMessages: remainingMessages,
        currentConversationId:
          state.currentConversationId === conversationId ? null : state.currentConversationId,
      };
    });
  },

  appendMessage: (conversationId: string, message: Message) => {
    set((state) => {
      const messages = state.conversationMessages[conversationId] ?? [];
      return {
        conversationMessages: {
          ...state.conversationMessages,
          [conversationId]: [...messages, message],
        },
      };
    });
  },

  getCurrentMessages: () => {
    const { currentConversationId, conversationMessages } = get();
    if (!currentConversationId) return [];
    return conversationMessages[currentConversationId] ?? [];
  },

  getCurrentConversation: () => {
    const { currentConversationId, conversations } = get();
    if (!currentConversationId) return null;
    return conversations.find((c) => c.id === currentConversationId) ?? null;
  },

  setCurrentConversationId: (id: string | null) => {
    set({ currentConversationId: id });
  },
}));
