import { create } from 'zustand';
import { AnimeReference, Message, PersonaType } from '@/types/conversation';
import { apiRequest } from '@/lib/api/client';
import { useConversationStore } from './useConversationStore';

interface ChatStore {
  messages: Message[];
  conversationId: string | null;
  personaType: PersonaType;
  isLoading: boolean;
  error: string | null;

  setConversation: (conversationId: string, personaType: PersonaType) => void;
  loadHistory: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

interface ApiMessageItem {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  animeReferences: AnimeReference[];
  createdAt: string;
}

interface OrganizedAnime {
  malId: number;
  title: string;
  titleJapanese: string | null;
  imageUrl: string | null;
  score: number | null;
  genres: string[];
  episodes: number | null;
  status: string | null;
  synopsis: string | null;
  synopsisKo: string | null;
  url: string;
  aiReasoning: string;
}

interface ChatApiResponse {
  success: true;
  data: {
    conversationId: string;
    message: string;
    messageType: 'chat' | 'recommendation';
  };
  isOrganized: boolean;
  organizedData?: OrganizedAnime[];
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

  loadHistory: async (conversationId: string) => {
    try {
      const res = await apiRequest<{
        success: true;
        data: { id: string; messages: ApiMessageItem[] };
      }>(`/api/conversations/${conversationId}`);

      const messages: Message[] = res.data.messages.map((m) => ({
        id: m.id,
        conversationId,
        role: m.role === 'system' ? 'assistant' : m.role,
        content: m.content,
        timestamp: new Date(m.createdAt),
        animeReferences: m.animeReferences,
      }));

      set({ messages });
    } catch {
      // 히스토리 로드 실패 시 빈 상태 유지 (에러 표시 불필요)
    }
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
        messageType: res.data.messageType,
        animeReferences: res.isOrganized ? res.organizedData : undefined,
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
