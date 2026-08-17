import type { ComponentProps } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// MARK: - 버튼
// 인앱 스케일 고정. 마케팅 pill 미사용

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const VARIANT: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-ink/85 active:bg-ink",
  secondary:
    "bg-canvas text-ink ring-1 ring-hairline hover:bg-canvas-soft-2 hover:ring-hairline-strong/40 active:bg-canvas-soft",
  ghost: "bg-transparent text-body hover:bg-canvas-soft-2 hover:text-ink active:bg-canvas-soft",
};

const SIZE: Record<Size, string> = {
  sm: "h-7 px-xs text-caption",
  md: "h-10 px-sm text-body-sm",
};

function classes(variant: Variant, size: Size, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-xxs rounded-sm font-medium select-none",
    "transition-interactive focus-ring active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-40",
    VARIANT[variant],
    SIZE[size],
    className,
  );
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} className={classes(variant, size, className)} {...props} />;
}

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
}

export function LinkButton({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: LinkButtonProps) {
  return <Link className={classes(variant, size, className)} {...props} />;
}

// MARK: 텍스트 링크
export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "rounded-xs text-link underline-soft transition-interactive focus-ring",
        "hover:text-link-deep",
        className,
      )}
      {...props}
    />
  );
}
