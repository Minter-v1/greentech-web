"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { CONTROL_BASE, FLOATING_PANEL } from "@/components/ui/control-styles";
import { cn } from "@/lib/utils";

// MARK: - 드롭다운
// 패널은 grid-template-rows 로 아코디언처럼 펼쳐짐.
// 테이블의 overflow-x-auto 가 절대 위치를 잘라내므로 fixed 로 띄우고 좌표를 직접 계산

interface DropdownProps {
  label: ReactNode;
  ariaLabel: string;
  children: (close: () => void) => ReactNode;
  className?: string;
  panelClassName?: string;
  triggerClassName?: string;
  disabled?: boolean;
  panelPosition?: "fixed" | "absolute";
  panelRole?: "listbox" | "dialog";
  triggerId?: string;
}

export function Dropdown({
  label,
  ariaLabel,
  children,
  className,
  panelClassName,
  triggerClassName,
  disabled,
  panelPosition = "fixed",
  panelRole = "listbox",
  triggerId,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const place = () => {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;
      const rect = trigger.getBoundingClientRect();
      const content = panel.firstElementChild as HTMLElement | null;
      const panelHeight = Math.min(content?.scrollHeight ?? panel.scrollHeight, window.innerHeight - 16);

      if (panelPosition === "fixed") {
        const spaceBelow = window.innerHeight - rect.bottom - 8;
        const spaceAbove = rect.top - 8;
        const placeAbove = spaceBelow < panelHeight && spaceAbove > spaceBelow;
        const top = placeAbove
          ? Math.max(8, rect.top - panelHeight - 4)
          : Math.min(rect.bottom + 4, window.innerHeight - panelHeight - 8);
        const left = Math.min(Math.max(8, rect.left), window.innerWidth - rect.width - 8);

        panel.style.setProperty("--panel-top", `${top}px`);
        panel.style.setProperty("--panel-left", `${left}px`);
        panel.style.setProperty("--panel-width", `${rect.width}px`);
        return;
      }

      const dialog = trigger.closest("dialog");
      const boundary = dialog?.getBoundingClientRect() ?? {
        top: 0,
        bottom: window.innerHeight,
      };
      const spaceBelow = boundary.bottom - rect.bottom - 4;
      const spaceAbove = rect.top - boundary.top - 4;
      setPlacement(spaceBelow < panelHeight && spaceAbove > spaceBelow ? "top" : "bottom");
    };

    const frame = requestAnimationFrame(place);

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, panelPosition]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        id={triggerId}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup={panelRole}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={ariaLabel}
        onClick={() =>
          setOpen((value) => {
            if (!value) setPlacement("bottom");
            return !value;
          })
        }
        className={cn(
          CONTROL_BASE,
          "flex h-10 items-center gap-xs text-left",
          triggerClassName,
        )}
      >
        {label}
        <ChevronDown
          aria-hidden
          className={cn(
            "ml-auto size-3.5 shrink-0 text-mute transition-transform duration-200 ease-standard",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        ref={panelRef}
        id={panelId}
        aria-hidden={!open}
        className={cn(
          "z-50 grid",
          panelPosition === "fixed"
            ? "fixed top-(--panel-top) left-(--panel-left) w-(--panel-width)"
            : placement === "top"
              ? "absolute bottom-full left-0 mb-xxs w-full"
              : "absolute top-full left-0 mt-xxs w-full",
          "transition-[grid-template-rows,opacity] duration-200 ease-standard",
          open
            ? "visible grid-rows-[1fr] opacity-100"
            : "invisible pointer-events-none grid-rows-[0fr] opacity-0",
          panelClassName,
        )}
      >
        <div className="overflow-hidden rounded-sm">
          {panelRole === "listbox" ? (
            <ul
              role="listbox"
              aria-label={ariaLabel}
              className={cn("flex flex-col", FLOATING_PANEL)}
            >
              {children(() => setOpen(false))}
            </ul>
          ) : (
            <div role="dialog" aria-label={ariaLabel} className={FLOATING_PANEL}>
              {children(() => setOpen(false))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// MARK: 드롭다운 항목
export function DropdownItem({
  selected,
  disabled,
  onSelect,
  children,
}: {
  selected?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        disabled={disabled}
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-xs rounded-xs px-xs py-[6px] text-left",
          "text-body-sm transition-interactive focus-ring",
          "disabled:cursor-not-allowed disabled:opacity-40",
          selected
            ? "bg-canvas-soft-2 font-medium text-ink"
            : "text-body hover:bg-canvas-soft-2 hover:text-ink",
        )}
      >
        {children}
      </button>
    </li>
  );
}
