'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimeReference } from '@/types/conversation';

interface AnimeDetailModalProps {
  anime: AnimeReference | null;
  onClose: () => void;
}

export function AnimeDetailModal({ anime, onClose }: AnimeDetailModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (anime) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [anime, handleKeyDown]);

  return (
    <AnimatePresence>
      {anime && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(4,5,14,0.85)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="anime-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl pointer-events-auto"
              style={{
                background: '#0d0e1a',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalContent anime={anime} onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ModalContent({
  anime,
  onClose,
}: {
  anime: AnimeReference;
  onClose: () => void;
}) {
  const displayScore = anime.score != null ? anime.score.toFixed(1) : 'N/A';
  const synopsis =
    (anime.synopsisKo && anime.synopsisKo.trim()) ||
    (anime.synopsis && anime.synopsis.trim()) ||
    '줄거리 정보가 없습니다.';

  return (
    <>
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="모달 닫기"
        className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#03f7b5]"
        style={{
          background: 'rgba(255,255,255,0.08)',
          color: '#cecfd1',
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background =
            'rgba(255,255,255,0.15)')
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background =
            'rgba(255,255,255,0.08)')
        }
      >
        <CloseIcon />
      </button>

      {/* Hero: Image + Title */}
      <div className="flex gap-4 p-5 pb-0">
        <AnimeImage imageUrl={anime.imageUrl} title={anime.title} />

        {/* Title block */}
        <div className="flex-1 min-w-0 pt-1">
          <h2
            id="anime-modal-title"
            className="text-base font-bold leading-snug"
            style={{ color: '#fff' }}
          >
            {anime.title}
          </h2>
          {anime.titleJapanese && (
            <p className="text-xs mt-0.5 truncate" style={{ color: '#85868b' }}>
              {anime.titleJapanese}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
            <MetaBadge icon={<StarIcon />} value={displayScore} accent />
            {anime.episodes != null && (
              <MetaBadge label="에피소드" value={String(anime.episodes)} />
            )}
            {anime.status && <MetaBadge label="상태" value={anime.status} />}
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {anime.genres.map((genre) => (
                <span
                  key={genre}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(3,247,181,0.1)',
                    color: '#03f7b5',
                    border: '1px solid rgba(3,247,181,0.25)',
                  }}
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* AI Reasoning */}
        {anime.aiReasoning && (
          <div
            className="rounded-xl p-3"
            style={{
              background: 'rgba(3,247,181,0.06)',
              border: '1px solid rgba(3,247,181,0.2)',
            }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: '#03f7b5' }}>
              AI 추천 이유
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#cecfd1' }}>
              {anime.aiReasoning}
            </p>
          </div>
        )}

        {/* Synopsis */}
        <div>
          <p
            className="text-xs font-semibold mb-1.5"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            줄거리
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#cecfd1' }}>
            {synopsis}
          </p>
        </div>

        {/* MAL Link */}
        {anime.url && (
          <a
            href={anime.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#03f7b5]"
            style={{
              background: 'rgba(3,247,181,0.12)',
              color: '#03f7b5',
              border: '1px solid rgba(3,247,181,0.3)',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                'rgba(3,247,181,0.2)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                'rgba(3,247,181,0.12)')
            }
          >
            <ExternalLinkIcon />
            MyAnimeList에서 보기
          </a>
        )}
      </div>
    </>
  );
}

function AnimeImage({
  imageUrl,
  title,
}: {
  imageUrl?: string | null;
  title: string;
}) {
  if (!imageUrl) {
    return (
      <div
        className="flex-shrink-0 w-24 h-36 rounded-lg flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.05)' }}
        aria-hidden="true"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          <path
            d="M3 15l5-5 4 4 3-3 6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-24 h-36 rounded-lg overflow-hidden">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function MetaBadge({
  label,
  value,
  icon,
  accent = false,
}: {
  label?: string;
  value: string;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {icon}
      {label && (
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {label}
        </span>
      )}
      <span
        className="text-xs font-semibold"
        style={{ color: accent ? '#03f7b5' : '#cecfd1' }}
      >
        {value}
      </span>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#03f7b5" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
