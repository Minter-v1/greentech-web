import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

// MARK: - 폼 프리미티브
// 링 두께는 고정하고 색만 전이시켜 포커스 시 레이아웃이 튀지 않게 함

const CONTROL_BASE = cn(
  "w-full rounded-sm bg-canvas px-sm text-body-sm text-ink",
  "ring-1 ring-hairline placeholder:text-mute",
  "transition-interactive outline-none",
  "hover:ring-hairline-strong/45",
  "focus:ring-2 focus:ring-ink focus:hover:ring-ink",
  "disabled:cursor-not-allowed disabled:bg-canvas-soft-2 disabled:text-mute disabled:hover:ring-hairline",
);

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(CONTROL_BASE, "h-10", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(CONTROL_BASE, "h-10 cursor-pointer", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(CONTROL_BASE, "py-xs", className)} {...props} />;
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-xxs">
      <label
        htmlFor={htmlFor}
        className="w-fit cursor-pointer text-body-sm font-medium text-ink transition-interactive"
      >
        {label}
      </label>
      {children}
      {error ? <p className="animate-fade-up text-caption text-error">{error}</p> : null}
    </div>
  );
}

export function FormAlert({ message }: { message: string }) {
  return (
    <p className="animate-fade-up rounded-sm bg-error-soft px-sm py-xs text-body-sm text-error-deep">
      {message}
    </p>
  );
}
