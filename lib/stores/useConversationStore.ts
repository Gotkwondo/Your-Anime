import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Conversation, Message, PersonaType } from '@/types/conversation';

interface ConversationStore {
  conversations: Conversation[];
  currentConversationId: string | null;
  conversationMessages: Record<string, Message[]>;

  createConversation: (personaType: PersonaType) => string;
  loadConversation: (conversationId: string) => void;
  saveMessage: (conversationId: string, message: Message) => void;
  deleteConversation: (conversationId: string) => void;
  getCurrentMessages: () => Message[];
  getCurrentConversation: () => Conversation | null;
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      conversationMessages: {},

      createConversation: (personaType: PersonaType) => {
        const conversationId = `conv-${Date.now()}`;
        const newConversation: Conversation = {
          id: conversationId,
          userId: 'current-user', // Will be replaced with actual user ID
          personaType,
          title: 'New Conversation',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: conversationId,
          conversationMessages: {
            ...state.conversationMessages,
            [conversationId]: [],
          },
        }));

        return conversationId;
      },

      loadConversation: (conversationId: string) => {
        set({ currentConversationId: conversationId });
      },

      saveMessage: (conversationId: string, message: Message) => {
        set((state) => {
          const messages = state.conversationMessages[conversationId] || [];
          const updatedMessages = [...messages, message];

          // Update conversation title with first user message
          const conversations = state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              const firstUserMessage = updatedMessages.find(
                (m) => m.role === 'user'
              );
              return {
                ...conv,
                title:
                  firstUserMessage?.content.slice(0, 50) ||
                  'New Conversation',
                updatedAt: new Date(),
              };
            }
            return conv;
          });

          return {
            conversations,
            conversationMessages: {
              ...state.conversationMessages,
              [conversationId]: updatedMessages,
            },
          };
        });
      },

      deleteConversation: (conversationId: string) => {
        set((state) => {
          const conversations = state.conversations.filter(
            (c) => c.id !== conversationId
          );
          const { [conversationId]: _, ...remainingMessages } =
            state.conversationMessages;

          return {
            conversations,
            conversationMessages: remainingMessages,
            currentConversationId:
              state.currentConversationId === conversationId
                ? null
                : state.currentConversationId,
          };
        });
      },

      getCurrentMessages: () => {
        const { currentConversationId, conversationMessages } = get();
        if (!currentConversationId) return [];
        return conversationMessages[currentConversationId] || [];
      },

      getCurrentConversation: () => {
        const { currentConversationId, conversations } = get();
        if (!currentConversationId) return null;
        return (
          conversations.find((c) => c.id === currentConversationId) || null
        );
      },
    }),
    {
      name: 'conversation-storage',
    }
  )
);
