'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useConversationStore } from '@/lib/stores/useConversationStore';
import { ConversationList } from '@/components/sidebar/ConversationList';
import { PersonaSelector } from '@/components/chat/PersonaSelector';
import { PersonaType } from '@/types/conversation';
import { AppHeader, HeaderButton } from '@/components/layout/AppHeader';

export default function ChatSelectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, signOut } = useAuthStore();
  const {
    conversations,
    currentConversationId,
    createConversation,
    loadConversation,
    deleteConversation,
  } = useConversationStore();

  const [view, setView] = useState<'choice' | 'history' | 'new'>('choice');
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('sommelier');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleSelectConversation = (conversationId: string) => {
    loadConversation(conversationId);
    router.push('/chat');
  };

  const handleCreateNewConversation = () => {
    const conversationId = createConversation(selectedPersona);
    loadConversation(conversationId);
    router.push('/chat');
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#04050e' }}>
      <AppHeader
        subtitle="Start a conversation"
        rightActions={
          <HeaderButton variant="outline" onClick={handleSignOut}>Sign Out</HeaderButton>
        }
      />

      <main className="max-w-5xl mx-auto py-12 px-6">
        {/* Choice View */}
        {view === 'choice' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
            <div
              className="card-dark p-8 cursor-pointer transition-all duration-300 group"
              onClick={() => setView('history')}
            >
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-[8px] flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ background: 'rgba(3,247,181,0.08)', border: '1px solid rgba(3,247,181,0.15)' }}
                  >
                    💬
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-white group-hover:text-[#03f7b5] transition-colors">
                      Continue Conversation
                    </h3>
                    <p className="text-sm text-[#85868b]">
                      Resume from your previous conversations
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-center justify-between pt-4"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="text-xs text-[#85868b]">Total</span>
                  <div className="text-right">
                    <p className="text-3xl font-bold" style={{ color: '#03f7b5' }}>{conversations.length}</p>
                    <p className="text-xs text-[#85868b]">
                      {conversations.length === 1 ? 'conversation' : 'conversations'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="card-dark p-8 cursor-pointer transition-all duration-300 group"
              onClick={() => setView('new')}
            >
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-[8px] flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ background: 'rgba(3,247,181,0.08)', border: '1px solid rgba(3,247,181,0.15)' }}
                  >
                    ✨
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-white group-hover:text-[#03f7b5] transition-colors">
                      New Conversation
                    </h3>
                    <p className="text-sm text-[#85868b]">
                      Start fresh with a new AI persona
                    </p>
                  </div>
                </div>
                <div
                  className="pt-4"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <p className="text-sm text-[#85868b]">
                    Choose your anime expert and begin your journey
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History View */}
        {view === 'history' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Previous Conversations</h2>
              <HeaderButton variant="outline" onClick={() => setView('choice')}>← Back</HeaderButton>
            </div>
            <div className="card-dark p-6">
              <ConversationList
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={handleSelectConversation}
                onDeleteConversation={deleteConversation}
              />
            </div>
          </div>
        )}

        {/* New Conversation View */}
        {view === 'new' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Choose Your AI Persona</h2>
              <HeaderButton variant="outline" onClick={() => setView('choice')}>← Back</HeaderButton>
            </div>
            <PersonaSelector
              selectedPersona={selectedPersona}
              onSelect={setSelectedPersona}
            />
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleCreateNewConversation}
                className="px-7 py-3 rounded-[5px] text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ background: '#03f7b5', color: '#04050e', boxShadow: '0 10px 20px rgba(3,247,181,0.2)' }}
              >
                Start Conversation →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
