import { cn } from "@/lib/utils";

// MARK: - 커스텀 스피너

const SIZE = {
  sm: "size-4",
  md: "size-6",
  lg: "size-10",
} as const;

interface SpinnerProps {
  size?: keyof typeof SIZE;
  className?: string;
  label?: string;
}

export function Spinner({ size = "md", className, label = "불러오는 중" }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn("inline-flex", className)}>
      <svg
        viewBox="0 0 32 32"
        className={cn("animate-spinner-sweep", SIZE[size])}
        fill="none"
        aria-hidden
      >
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="3" className="text-hairline" />
        <path
          d="M16 3a13 13 0 0 1 13 13"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-ink"
        />
      </svg>
    </span>
  );
}

/** 인라인 진행 표시 */
export function InlineSpinner({ children }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-xs text-body-sm text-body">
      <Spinner size="sm" />
      {children}
    </span>
  );
}

/** 전체 영역 로딩. 라우트 loading.tsx 폴백에 사용 */
export function PageSpinner({ message = "불러오는 중" }: { message?: string }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-sm">
      <Spinner size="lg" />
      <span className="text-caption uppercase text-mute">{message}</span>
    </div>
  );
}
