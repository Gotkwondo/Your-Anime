import { create } from 'zustand';
import { Message, PersonaType } from '@/types/conversation';
import { apiRequest } from '@/lib/api/client';
import { useConversationStore } from './useConversationStore';

interface ChatStore {
  messages: Message[];
  conversationId: string | null;
  personaType: PersonaType;
  isLoading: boolean;
  error: string | null;

  setConversation: (conversationId: string, personaType: PersonaType) => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

interface ChatApiResponse {
  success: true;
  data: {
    message: string;
    conversationId: string;
    recommendations?: Array<{
      malId: number;
      title: string;
      titleJapanese: string | null;
      imageUrl: string | null;
      score: number | null;
      genres: string[];
      episodes: number | null;
      status: string | null;
      synopsis: string | null;
      url: string;
      aiReasoning: string;
    }>;
  };
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  conversationId: null,
  personaType: 'sommelier',
  isLoading: false,
  error: null,

  setConversation: (conversationId: string, personaType: PersonaType) => {
    set({ conversationId, personaType, messages: [], error: null });
  },

  sendMessage: async (content: string) => {
    const { conversationId, messages } = get();
    if (!conversationId) return;

    const userMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversationId,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    set({ messages: [...messages, userMessage], isLoading: true, error: null });

    try {
      const res = await apiRequest<ChatApiResponse>('/api/chat', {
        method: 'POST',
        body: { message: content, conversationId },
      });

      const aiMessage: Message = {
        id: `temp-ai-${Date.now()}`,
        conversationId,
        role: 'assistant',
        content: res.data.message,
        timestamp: new Date(),
        animeReferences: res.data.recommendations,
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        isLoading: false,
      }));

      // useConversationStore에도 메시지 반영
      useConversationStore.getState().appendMessage(conversationId, userMessage);
      useConversationStore.getState().appendMessage(conversationId, aiMessage);
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  clearMessages: () => {
    set({ messages: [], conversationId: null, error: null });
  },
}));
