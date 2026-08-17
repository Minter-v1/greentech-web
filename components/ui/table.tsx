import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// MARK: - 데이터 테이블
// 헤더는 mono 캡션, 본문은 body-sm, 행 구분은 헤어라인

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse text-body-sm", className)} {...props} />
    </div>
  );
}

export function Thead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("bg-canvas-soft", className)} {...props} />;
}

export function Th({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "border-b border-hairline px-sm py-xs text-left text-caption",
        "font-normal uppercase text-mute whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

export function Tr({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-hairline transition-interactive last:border-0 hover:bg-canvas-soft",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-sm py-xs align-middle", className)} {...props} />;
}
