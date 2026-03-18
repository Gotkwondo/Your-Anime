'use client';

import { useState } from 'react';
import { Message, AnimeReference } from '@/types/conversation';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';
import { AnimeRecommendationCard } from './AnimeRecommendationCard';
import { AnimeDetailModal } from './AnimeDetailModal';

interface MessageBubbleProps {
  message: Message;
}

/** JSON/session_data 코드 블록을 제거한 순수 텍스트를 반환합니다. */
function stripCodeBlocks(content: string): string {
  return content
    // session_data는 항상 응답 끝에 위치 — 이후 모든 내용 제거
    .replace(/```\s*session_data[\s\S]*/g, '')
    // json 블록 제거 (닫히는 ``` 까지)
    .replace(/```\s*json[\s\S]*?```/g, '')
    // 잘린 응답으로 닫히지 않은 json 블록 제거 (MAX_TOKENS 초과 시)
    .replace(/```\s*json[\s\S]*/g, '')
    // 기타 코드 블록 제거
    .replace(/```[\s\S]*?```/g, '')
    .trim();
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [selectedAnime, setSelectedAnime] = useState<AnimeReference | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const cleanContent = stripCodeBlocks(message.content);
  const lines = cleanContent.split('\n');

  return (
    <>
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
              : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: '#cecfd1',
                }
          }
        >
          {/* Message text */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {lines.map((line, i) => {
              const parts = line.split(/(\*\*.*?\*\*)/g);
              return (
                <p key={i} className={cn({ 'mb-2': i < lines.length - 1 })}>
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

          {/* Anime recommendation accordion */}
          {!isUser &&
            message.animeReferences &&
            message.animeReferences.length > 0 && (
              <div className="mt-3 -mx-1">
                <p
                  className="text-xs font-semibold px-1 mb-2"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  추천 애니메이션
                </p>
                <div className="flex flex-col gap-1">
                  {message.animeReferences.map((anime, i) => {
                    const isOpen = openIndex === i;
                    return (
                      <div
                        key={anime.malId}
                        className="rounded-xl overflow-hidden transition-all duration-200"
                        style={{
                          border: isOpen
                            ? '1px solid rgba(3,247,181,0.4)'
                            : '1px solid rgba(255,255,255,0.08)',
                          background: 'rgba(255,255,255,0.04)',
                        }}
                      >
                        {/* 아코디언 헤더 */}
                        <button
                          type="button"
                          onClick={() => setOpenIndex(isOpen ? null : i)}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-left focus:outline-none"
                          aria-expanded={isOpen}
                        >
                          <span
                            className="text-sm font-semibold truncate pr-2"
                            style={{ color: isOpen ? '#03f7b5' : '#fff' }}
                          >
                            {anime.title}
                          </span>
                          <ChevronIcon isOpen={isOpen} />
                        </button>

                        {/* 아코디언 바디 */}
                        {isOpen && (
                          <div
                            className="px-3 pb-3 pt-0"
                            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                          >
                            <AnimeRecommendationCard
                              anime={anime}
                              onSelect={setSelectedAnime}
                              variant="full"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Timestamp */}
          <div
            className="text-xs mt-2"
            style={{ color: isUser ? 'rgba(255,255,255,0.5)' : '#85868b' }}
          >
            {format(message.timestamp, 'HH:mm')}
          </div>
        </div>
      </div>

      {/* Detail Modal — rendered outside bubble to avoid stacking context issues */}
      <AnimeDetailModal
        anime={selectedAnime}
        onClose={() => setSelectedAnime(null)}
      />
    </>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="flex-shrink-0 transition-transform duration-200"
      style={{
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        color: isOpen ? '#03f7b5' : 'rgba(255,255,255,0.4)',
      }}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
