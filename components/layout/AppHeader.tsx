'use client';

import Link from 'next/link';

interface AppHeaderProps {
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightActions?: React.ReactNode;
}

export function AppHeader({ subtitle, leftAction, rightActions }: AppHeaderProps) {
  return (
    <header
      className="sticky top-0 z-10 h-14 flex items-center"
      style={{
        background: 'rgba(4,5,14,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="max-w-[1146px] mx-auto w-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {leftAction}
          <div>
            <Link href="/">
              <span className="text-base font-bold text-white hover:text-[#03f7b5] transition-colors">
                AnimeSommelier
              </span>
            </Link>
            {subtitle && (
              <p className="text-xs text-[#85868b] mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rightActions}
        </div>
      </div>
    </header>
  );
}

/* Reusable header button */
export function HeaderButton({
  onClick,
  children,
  variant = 'ghost',
}: {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'ghost' | 'outline' | 'primary';
}) {
  const styles = {
    ghost: {
      background: 'transparent',
      border: 'none',
      color: '#cecfd1',
    },
    outline: {
      background: 'transparent',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#cecfd1',
    },
    primary: {
      background: '#03f7b5',
      border: 'none',
      color: '#04050e',
    },
  };

  return (
    <button
      onClick={onClick}
      className="text-xs font-semibold px-4 py-2 rounded-[5px] transition-all hover:opacity-80 active:scale-95"
      style={styles[variant]}
    >
      {children}
    </button>
  );
}
