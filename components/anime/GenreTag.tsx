import { cn } from '@/lib/utils/cn';

interface GenreTagProps {
  genre: string;
  className?: string;
}

export function GenreTag({ genre, className }: GenreTagProps) {
  return (
    <span
      className={cn('inline-block px-2 py-0.5 text-[10px] font-medium rounded transition-all', className)}
      style={{
        background: 'rgba(3,247,181,0.08)',
        border: '1px solid rgba(3,247,181,0.2)',
        color: '#03f7b5',
      }}
    >
      {genre}
    </span>
  );
}
