import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

// MARK: - 카드
// 단일 드롭섀도 금지. 스택 섀도 + inset 헤어라인

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-md bg-canvas shadow-level-2", className)}
      {...props}
    />
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-md border-b border-hairline px-lg py-md">
      <div className="flex flex-col gap-xxs">
        <h2 className="text-display-sm">{title}</h2>
        {description ? <p className="text-body-sm text-mute">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-lg", className)} {...props} />;
}

// MARK: 지표 타일
interface StatProps {
  label: string;
  value: string;
  hint?: string;
}

export function Stat({ label, value, hint }: StatProps) {
  return (
    <Card className="flex flex-col gap-xxs p-lg">
      <span className="text-caption uppercase text-mute">{label}</span>
      <span className="text-display-md">{value}</span>
      {hint ? <span className="text-body-sm text-body">{hint}</span> : null}
    </Card>
  );
}

// MARK: 빈 상태
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-canvas-soft px-lg py-3xl text-center text-body-md text-mute">
      {message}
    </div>
  );
}
