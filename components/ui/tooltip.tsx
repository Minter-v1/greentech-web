"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// MARK: - 툴팁
// CSS 만으로 동작. 접힌 사이드바처럼 라벨이 가려지는 곳에서만 사용

export function Tooltip({
  label,
  hidden,
  children,
  className,
}: {
  label: string;
  hidden?: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (hidden) return <>{children}</>;

  return (
    <span className={cn("group/tooltip relative flex w-full", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-50 -translate-y-1/2",
          "whitespace-nowrap rounded-sm bg-primary px-xs py-xxs text-caption text-on-primary",
          "opacity-0 shadow-level-4 transition-interactive",
          "group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
        )}
      >
        {label}
      </span>
    </span>
  );
}
