import { Conversation } from '@/types/conversation';
import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-center">
        <div className="space-y-3">
          <div className="text-5xl">💬</div>
          <p className="text-lg font-medium">No conversations yet</p>
          <p className="text-sm text-muted-foreground">
            Start a new conversation to begin your anime discovery journey
          </p>
        </div>
      </div>
    );
  }

  // Group conversations by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groupedConversations = {
    today: conversations.filter((c) => new Date(c.updatedAt) >= today),
    yesterday: conversations.filter(
      (c) => new Date(c.updatedAt) >= yesterday && new Date(c.updatedAt) < today
    ),
    thisWeek: conversations.filter(
      (c) => new Date(c.updatedAt) >= lastWeek && new Date(c.updatedAt) < yesterday
    ),
    older: conversations.filter((c) => new Date(c.updatedAt) < lastWeek),
  };

  return (
    <div className="space-y-6">
      {groupedConversations.today.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-2">
            Today
          </h3>
          <div className="space-y-1">
            {groupedConversations.today.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === currentConversationId}
                onClick={() => onSelectConversation(conv.id)}
                onDelete={() => onDeleteConversation(conv.id)}
              />
            ))}
          </div>
        </div>
      )}

      {groupedConversations.yesterday.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-2">
            Yesterday
          </h3>
          <div className="space-y-1">
            {groupedConversations.yesterday.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === currentConversationId}
                onClick={() => onSelectConversation(conv.id)}
                onDelete={() => onDeleteConversation(conv.id)}
              />
            ))}
          </div>
        </div>
      )}

      {groupedConversations.thisWeek.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-2">
            This Week
          </h3>
          <div className="space-y-1">
            {groupedConversations.thisWeek.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === currentConversationId}
                onClick={() => onSelectConversation(conv.id)}
                onDelete={() => onDeleteConversation(conv.id)}
              />
            ))}
          </div>
        </div>
      )}

      {groupedConversations.older.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-2">
            Older
          </h3>
          <div className="space-y-1">
            {groupedConversations.older.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === currentConversationId}
                onClick={() => onSelectConversation(conv.id)}
                onDelete={() => onDeleteConversation(conv.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
