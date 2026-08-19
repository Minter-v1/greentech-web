"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// MARK: - 모달
// 네이티브 dialog 사용. 포커스 트랩·Escape·top-layer 를 브라우저가 처리

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        // 백드롭 영역 클릭만 닫음
        if (event.target === ref.current) onOpenChange(false);
      }}
      className={cn(
        "w-[calc(100%-2rem)] max-w-[32rem] rounded-lg bg-canvas p-0 text-ink shadow-level-5",
        "backdrop:bg-ink/35 backdrop:backdrop-blur-[2px]",
        className,
      )}
    >
      <div className="flex flex-col gap-lg p-xl">
        <div className="flex items-start justify-between gap-md">
          <div className="flex flex-col gap-xxs">
            <h2 className="text-display-sm">{title}</h2>
            {description ? <p className="text-body-sm text-mute">{description}</p> : null}
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => onOpenChange(false)}
            className={cn(
              "-mr-xxs -mt-xxs rounded-sm p-xxs text-mute",
              "transition-interactive focus-ring hover:bg-canvas-soft-2 hover:text-ink",
            )}
          >
            <X className="size-4" />
          </button>
        </div>

        {children}

        {footer ? <div className="flex justify-end gap-xs">{footer}</div> : null}
      </div>
    </dialog>
  );
}
