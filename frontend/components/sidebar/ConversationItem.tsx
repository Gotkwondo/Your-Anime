import { Conversation } from '@/types/conversation';
import { cn } from '@/lib/utils/cn';
import { formatDistanceToNow } from 'date-fns';

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function ConversationItem({
  conversation,
  isActive = false,
  onClick,
  onDelete,
}: ConversationItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      onDelete();
    }
  };

  return (
    <div
      onClick={onClick}
      className="p-3 rounded-[8px] cursor-pointer transition-all group"
      style={{
        background: isActive ? 'rgba(3,247,181,0.08)' : 'transparent',
        border: isActive ? '1px solid rgba(3,247,181,0.2)' : '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {isActive && (
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#03f7b5' }} />
            )}
            <p
              className="text-sm font-medium truncate"
              style={{ color: isActive ? '#03f7b5' : '#cecfd1' }}
            >
              {conversation.title}
            </p>
          </div>
          <p className="text-xs flex items-center gap-2" style={{ color: '#85868b' }}>
            <span>{conversation.personaType.replace('_', ' ')}</span>
            <span>·</span>
            <span>
              {formatDistanceToNow(new Date(conversation.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="ml-3 opacity-0 group-hover:opacity-100 transition-all w-5 h-5 flex items-center justify-center rounded text-xs"
          style={{ color: '#85868b' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#cecfd1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#85868b'; }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
