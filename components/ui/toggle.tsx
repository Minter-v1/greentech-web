"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";

// MARK: - 사용 여부 토글

export function Toggle({
  checked,
  label,
  onToggle,
  disabled,
}: {
  checked: boolean;
  label: string;
  onToggle: (next: boolean) => Promise<unknown>;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled || pending}
      onClick={() => startTransition(async () => void (await onToggle(!checked)))}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full",
        "transition-interactive focus-ring disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-hairline",
      )}
    >
      <span
        className={cn(
          "absolute size-4 rounded-full bg-canvas shadow-level-1",
          "transition-[translate] duration-200 ease-emphasized",
          checked ? "translate-x-[18px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}
