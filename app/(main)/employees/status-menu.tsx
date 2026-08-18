"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { ChevronDown, CircleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { EMPLOYEE_STATUS, ICON_TONE, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { EmployeeStatus } from "@/lib/api/types";
import { cn, currentDate } from "@/lib/utils";
import { changeStatusAction, resignEmployeeAction, type StatusActionState } from "./actions";

// MARK: - 재직 상태 변경
// 폼 컨트롤과 같은 바 형태. 패널은 grid-template-rows 로 아코디언처럼 펼쳐짐

const ORDER: EmployeeStatus[] = ["ACTIVE", "ON_LEAVE", "RESIGNED"];

interface StatusMenuProps {
  employeeId: number;
  employeeName: string;
  status: EmployeeStatus;
}

export function StatusMenu({ employeeId, employeeName, status }: StatusMenuProps) {
  const [open, setOpen] = useState(false);
  const [resignOpen, setResignOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const current = EMPLOYEE_STATUS[status];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const select = (next: EmployeeStatus) => {
    setOpen(false);
    setError(undefined);
    if (next === status) return;

    if (next === "RESIGNED") {
      setResignOpen(true);
      return;
    }

    startTransition(async () => {
      const result = await changeStatusAction(employeeId, next);
      if (!result.ok) setError(result.message);
    });
  };

  return (
    <>
      <div ref={rootRef} className="relative w-[132px]">
        <button
          type="button"
          disabled={pending}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${employeeName} 재직 상태`}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            "flex h-8 w-full items-center gap-xs rounded-sm bg-canvas px-xs text-body-sm",
            "ring-1 ring-hairline transition-interactive outline-none",
            "hover:ring-hairline-strong/45",
            "focus-visible:ring-2 focus-visible:ring-ink",
            "disabled:cursor-not-allowed disabled:bg-canvas-soft-2",
            statusTone(current.tone),
          )}
        >
          {pending ? (
            <Spinner size="sm" className="[&_svg]:size-3.5" />
          ) : (
            <current.icon
              className={cn("size-3.5 shrink-0", ICON_TONE[current.tone])}
              strokeWidth={2.25}
              aria-hidden
            />
          )}
          <span className="truncate">{current.label}</span>
          <ChevronDown
            aria-hidden
            className={cn(
              "ml-auto size-3.5 shrink-0 text-mute transition-transform duration-200 ease-standard",
              open && "rotate-180",
            )}
          />
        </button>

        <div
          id={panelId}
          className={cn(
            "absolute inset-x-0 top-[calc(100%+4px)] z-20 grid",
            "transition-[grid-template-rows,opacity] duration-200 ease-standard",
            open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <ul
              role="listbox"
              aria-label="재직 상태"
              className="flex flex-col rounded-sm bg-canvas p-[3px] shadow-level-5"
            >
              {ORDER.map((value) => {
                const meta = EMPLOYEE_STATUS[value];
                const selected = value === status;
                return (
                  <li key={value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      tabIndex={open ? 0 : -1}
                      onClick={() => select(value)}
                      className={cn(
                        "flex w-full items-center gap-xs rounded-xs px-xs py-[6px] text-left",
                        "text-body-sm transition-interactive focus-ring",
                        selected
                          ? "bg-canvas-soft-2 font-medium text-ink"
                          : "text-body hover:bg-canvas-soft-2 hover:text-ink",
                      )}
                    >
                      <meta.icon
                        className={cn("size-3.5 shrink-0", ICON_TONE[meta.tone])}
                        strokeWidth={2.25}
                        aria-hidden
                      />
                      {meta.label}
                      {selected ? (
                        <span className="ml-auto text-caption text-mute">현재</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {error ? (
          <span className="absolute inset-x-0 top-[calc(100%+4px)] z-10 inline-flex items-start gap-xxs text-caption text-error-deep">
            <CircleAlert className="mt-[2px] size-3 shrink-0" />
            {error}
          </span>
        ) : null}
      </div>

      <ResignDialog
        open={resignOpen}
        onOpenChange={setResignOpen}
        employeeId={employeeId}
        employeeName={employeeName}
        onFailure={setError}
      />
    </>
  );
}

// MARK: 퇴사 처리 다이얼로그
function ResignDialog({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  onFailure,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  employeeName: string;
  onFailure: (message?: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [resignDate, setResignDate] = useState(currentDate());
  const [reason, setReason] = useState("");

  const submit = () => {
    startTransition(async () => {
      const result: StatusActionState = await resignEmployeeAction(employeeId, resignDate, reason);
      if (result.ok) {
        onFailure(undefined);
        onOpenChange(false);
        setReason("");
        setError(undefined);
        return;
      }
      setError(result.message);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>퇴사 처리</DialogTitle>
          <DialogDescription>
            {employeeName} 사원의 재직 상태를 퇴사로 변경하고 발령 이력을 남깁니다
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-md">
          <Field label="퇴사일" htmlFor="resign-date">
            <Input
              id="resign-date"
              type="date"
              value={resignDate}
              onChange={(event) => setResignDate(event.target.value)}
            />
          </Field>
          <Field label="퇴사 사유" htmlFor="resign-reason">
            <Textarea
              id="resign-reason"
              rows={3}
              maxLength={500}
              placeholder="개인 사정"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </Field>

          {error ? (
            <p className="flex items-center gap-xs rounded-sm bg-error-soft px-sm py-xs text-body-sm text-error-deep">
              <CircleAlert className="size-4 shrink-0" />
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button type="button" disabled={pending} onClick={submit} className="gap-xs">
            {pending ? <Spinner size="sm" className="text-on-primary" /> : null}
            퇴사 처리
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
