import type { ReactNode } from "react";

// MARK: - 페이지 헤더

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-lg flex flex-wrap items-end justify-between gap-md">
      <div className="flex flex-col gap-xxs">
        {eyebrow ? (
          <span className="text-caption uppercase text-mute">{eyebrow}</span>
        ) : null}
        <h1 className="text-display-lg">{title}</h1>
        {description ? <p className="text-body-md text-body">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
