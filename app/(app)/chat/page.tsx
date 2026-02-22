'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useConversationStore } from '@/lib/stores/useConversationStore';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Message } from '@/types/conversation';
import { AppHeader, HeaderButton } from '@/components/layout/AppHeader';
import { generateMockAIResponse } from '@/lib/mock/aiResponses';

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, signOut } = useAuthStore();
  const {
    currentConversationId,
    getCurrentMessages,
    getCurrentConversation,
    saveMessage,
  } = useConversationStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // If no conversation is selected, redirect to select page
    if (!authLoading && isAuthenticated && !currentConversationId) {
      router.push('/chat/select');
      return;
    }

    // Load current conversation messages
    if (currentConversationId) {
      setMessages(getCurrentMessages());
    }
  }, [isAuthenticated, authLoading, currentConversationId, router, getCurrentMessages]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleSendMessage = async (content: string) => {
    if (!currentConversationId) return;

    const conversation = getCurrentConversation();
    if (!conversation) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: currentConversationId,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    saveMessage(currentConversationId, userMessage);
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Generate AI response
      const aiContent = await generateMockAIResponse(
        content,
        conversation.personaType
      );

      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        conversationId: currentConversationId,
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      };

      saveMessage(currentConversationId, aiMessage);
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    router.push('/chat/select');
  };

  if (authLoading || !isAuthenticated || !currentConversationId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const conversation = getCurrentConversation();

  return (
    <div className="flex flex-col h-screen" style={{ background: '#04050e' }}>
      <AppHeader
        subtitle={
          conversation
            ? `${conversation.personaType.replace('_', ' ')} · ${conversation.title}`
            : undefined
        }
        rightActions={
          <div className="flex gap-2">
            <HeaderButton variant="outline" onClick={handleNewChat}>← All Chats</HeaderButton>
            <HeaderButton variant="outline" onClick={handleSignOut}>Sign Out</HeaderButton>
          </div>
        }
      />

      <div className="flex-1 overflow-hidden">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
