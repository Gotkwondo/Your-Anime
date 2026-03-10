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

// GET /api/conversations 응답 (camelCase)
interface ApiConversationListItem {
  id: string;
  title: string | null;
  personaType: PersonaType;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

// POST /api/conversations 응답 (camelCase, user_id/updatedAt 없음)
interface ApiConversationCreate {
  id: string;
  personaType: PersonaType;
  title: string | null;
  createdAt: string;
}

// GET /api/conversations/:id 응답 (camelCase)
interface ApiConversationDetail {
  id: string;
  title: string | null;
  personaType: PersonaType;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    animeReferences: Array<{ mal_id: number; title: string }>;
    createdAt: string;
  }>;
}

function mapListItem(c: ApiConversationListItem): Conversation {
  return {
    id: c.id,
    userId: '',
    personaType: c.personaType,
    title: c.title ?? 'New Conversation',
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
  };
}

function mapCreateResponse(c: ApiConversationCreate): Conversation {
  return {
    id: c.id,
    userId: '',
    personaType: c.personaType,
    title: c.title ?? 'New Conversation',
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.createdAt),
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
        data: { conversations: ApiConversationListItem[]; total: number; hasMore: boolean };
      }>('/api/conversations');
      set({
        conversations: res.data.conversations.map(mapListItem),
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createConversation: async (personaType: PersonaType) => {
    set({ isLoading: true, error: null });
    const res = await apiRequest<{ success: true; data: ApiConversationCreate }>(
      '/api/conversations',
      { method: 'POST', body: { personaType } },
    );
    const conversation = mapCreateResponse(res.data);

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
        data: ApiConversationDetail;
      }>(`/api/conversations/${conversationId}`);

      const messages: Message[] = res.data.messages.map((m) => ({
        id: m.id,
        conversationId,
        role: m.role === 'system' ? 'assistant' : m.role,
        content: m.content,
        timestamp: new Date(m.createdAt),
        animeReferences: m.animeReferences,
      }));

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
