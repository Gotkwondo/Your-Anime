import { Message } from '@/types/conversation';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn('flex w-full mb-4 animate-fade-in', {
        'justify-end': isUser,
        'justify-start': !isUser,
      })}
    >
      <div
        className={cn('max-w-[80%] rounded-[10px] px-4 py-3 transition-all')}
        style={
          isUser
            ? { background: 'rgba(3,247,181,0.15)', color: '#fff' }
            : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#cecfd1' }
        }
      >
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {message.content.split('\n').map((line, i) => {
            // Simple markdown support for bold
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
              <p key={i} className={cn({ 'mb-2': i < message.content.split('\n').length - 1 })}>
                {parts.map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                  }
                  return <span key={j}>{part}</span>;
                })}
              </p>
            );
          })}
        </div>
        <div className="text-xs mt-2" style={{ color: isUser ? 'rgba(255,255,255,0.5)' : '#85868b' }}>
          {format(message.timestamp, 'HH:mm')}
        </div>
      </div>
    </div>
  );
}
