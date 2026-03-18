import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded', className)}
      style={{ background: 'rgba(255,255,255,0.08)', ...style }}
    />
  );
}

export function ConversationCountSkeleton() {
  return (
    <div className="flex flex-col items-end gap-1">
      {/* 숫자 자리: text-3xl font-bold 높이(h-9)에 맞춤 */}
      <Skeleton
        className="h-9 w-8"
        style={{ background: 'rgba(3,247,181,0.15)' }}
      />
      {/* 라벨 자리 */}
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
