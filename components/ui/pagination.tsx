import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// MARK: - 페이지네이션

interface PaginationProps {
  page: number;
  totalPages: number;
  /** 대상 페이지 번호 → href */
  hrefFor: (page: number) => string;
}

const STEP = cn(
  "inline-flex h-8 items-center gap-xxs rounded-sm px-xs text-body-sm text-body",
  "ring-1 ring-hairline transition-interactive focus-ring",
  "hover:bg-canvas-soft-2 hover:text-ink hover:ring-hairline-strong/40 active:scale-[0.97]",
  "aria-disabled:pointer-events-none aria-disabled:opacity-40",
);

export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-md flex items-center justify-center gap-sm" aria-label="페이지 이동">
      <Link
        href={hrefFor(Math.max(0, page - 1))}
        aria-disabled={page === 0}
        aria-label="이전 페이지"
        className={STEP}
      >
        <ChevronLeft className="size-4" />
        이전
      </Link>
      <span className="text-caption text-mute tabular-nums">
        {page + 1} / {totalPages}
      </span>
      <Link
        href={hrefFor(Math.min(totalPages - 1, page + 1))}
        aria-disabled={page >= totalPages - 1}
        aria-label="다음 페이지"
        className={STEP}
      >
        다음
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
