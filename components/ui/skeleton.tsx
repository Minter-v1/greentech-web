import { cn } from "@/lib/utils";

// MARK: - 펄스 캐스케이드 스켈레톤

const CASCADE_STEP_MS = 90;

interface SkeletonProps extends React.ComponentProps<"div"> {
  /** 캐스케이드 순번. 지연 = index × 90ms */
  index?: number;
}

export function Skeleton({ className, index = 0, style, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse-cascade rounded-sm bg-hairline", className)}
      style={{ animationDelay: `${index * CASCADE_STEP_MS}ms`, ...style }}
      {...props}
    />
  );
}

// MARK: 지표 타일 스켈레톤
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col gap-xs rounded-md bg-canvas p-lg shadow-level-2">
          <Skeleton index={index} className="h-3 w-20" />
          <Skeleton index={index + 1} className="h-7 w-28" />
          <Skeleton index={index + 2} className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

// MARK: 테이블 스켈레톤
export function SkeletonTable({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-md bg-canvas shadow-level-2">
      <div className="flex gap-md border-b border-hairline bg-canvas-soft px-sm py-xs">
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={index} index={index} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex gap-md border-b border-hairline px-sm py-sm last:border-0">
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton key={column} index={row + column} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// MARK: 카드 스켈레톤
export function SkeletonCard({ lines = 4 }: { lines?: number }) {
  return (
    <div className="rounded-md bg-canvas shadow-level-2">
      <div className="border-b border-hairline px-lg py-md">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="flex flex-col gap-sm p-lg">
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton key={index} index={index} className="h-4" style={{ width: `${92 - index * 11}%` }} />
        ))}
      </div>
    </div>
  );
}

// MARK: 페이지 헤더 스켈레톤
export function SkeletonPageHeader() {
  return (
    <div className="mb-lg flex flex-col gap-xs">
      <Skeleton className="h-3 w-16" />
      <Skeleton index={1} className="h-9 w-64" />
      <Skeleton index={2} className="h-4 w-40" />
    </div>
  );
}
