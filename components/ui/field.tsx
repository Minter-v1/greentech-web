import type { ComponentProps, ReactNode } from "react";
import { CONTROL_BASE } from "@/components/ui/control-styles";
import { cn } from "@/lib/utils";

// MARK: - 폼 프리미티브
// 실제 보더는 항상 유지하고 포커스 링만 바깥에 추가

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(CONTROL_BASE, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(CONTROL_BASE, "py-xs", className)} {...props} />;
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, required = false, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-xxs">
      <label
        htmlFor={htmlFor}
        className="w-fit cursor-pointer text-body-sm font-medium text-ink transition-interactive"
      >
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-xxs text-error">
              *
            </span>
            <span className="sr-only">필수</span>
          </>
        ) : null}
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
