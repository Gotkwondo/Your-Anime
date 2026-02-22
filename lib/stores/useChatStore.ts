import { create } from 'zustand';
import { Message, PersonaType } from '@/types/conversation';
import { generateMockAIResponse } from '@/lib/mock/aiResponses';

interface ChatStore {
  messages: Message[];
  conversationId: string;
  personaType: PersonaType;
  isLoading: boolean;

  setPersona: (persona: PersonaType) => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  conversationId: `conv-${Date.now()}`,
  personaType: 'sommelier',
  isLoading: false,

  setPersona: (persona) => {
    set({
      personaType: persona,
      messages: [],
      conversationId: `conv-${Date.now()}`,
    });
  },

  sendMessage: async (content: string) => {
    const { messages, conversationId, personaType } = get();

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    set({ messages: [...messages, userMessage], isLoading: true });

    try {
      // Generate AI response
      const aiContent = await generateMockAIResponse(content, personaType);

      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        conversationId,
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to get AI response:', error);
      set({ isLoading: false });
    }
  },

  clearMessages: () => {
    set({
      messages: [],
      conversationId: `conv-${Date.now()}`,
    });
  },
}));
