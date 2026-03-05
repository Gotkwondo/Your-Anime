'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useConversationStore } from '@/lib/stores/useConversationStore';
import { useChatStore } from '@/lib/stores/useChatStore';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { AppHeader, HeaderButton } from '@/components/layout/AppHeader';

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, signOut } = useAuthStore();
  const {
    currentConversationId,
    getCurrentConversation,
    loadConversation,
  } = useConversationStore();
  const { messages, isLoading, error, setConversation, sendMessage } = useChatStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!authLoading && isAuthenticated && !currentConversationId) {
      router.push('/chat/select');
      return;
    }

    if (currentConversationId) {
      const conversation = getCurrentConversation();
      if (conversation) {
        setConversation(currentConversationId, conversation.personaType);
      }
      // 메시지 목록 로드
      void loadConversation(currentConversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, currentConversationId]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
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

      {error && (
        <div className="px-4 py-2 text-sm text-red-400 bg-red-900/20 border-b border-red-900/30">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <ChatInterface
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
