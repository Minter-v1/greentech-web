"use client";

import { useState, useTransition } from "react";
import { CircleAlert } from "lucide-react";
import { EMPLOYEE_STATUS, ICON_TONE, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { Field, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import type { EmployeeStatus } from "@/lib/api/types";
import { cn, currentDate } from "@/lib/utils";
import { changeStatusAction, type StatusActionState } from "./actions";

// MARK: - 재직 상태 변경

const ORDER: EmployeeStatus[] = ["ACTIVE", "ON_LEAVE", "RESIGNED"];

/** 휴직은 재직 상태에서만 진입 가능. 그 외 전이는 WAS 가 409 로 막음 */
function canTransition(from: EmployeeStatus, to: EmployeeStatus): boolean {
  if (from === to) return false;
  if (to === "ON_LEAVE") return from === "ACTIVE";
  return true;
}

const DIALOG_COPY: Record<EmployeeStatus, { title: string; dateLabel: string; hint: string }> = {
  ACTIVE: { title: "복직 처리", dateLabel: "복직일", hint: "퇴사일을 비우고 재직으로 되돌립니다" },
  ON_LEAVE: { title: "휴직 처리", dateLabel: "휴직 시작일", hint: "휴직 발령 이력을 남깁니다" },
  RESIGNED: { title: "퇴사 처리", dateLabel: "퇴사일", hint: "퇴사 발령 이력을 남깁니다" },
};

interface StatusMenuProps {
  employeeId: number;
  employeeName: string;
  status: EmployeeStatus;
}

export function StatusMenu({ employeeId, employeeName, status }: StatusMenuProps) {
  const [target, setTarget] = useState<EmployeeStatus>();
  const [error, setError] = useState<string>();
  const current = EMPLOYEE_STATUS[status];

  return (
    <>
      <div className="w-[132px]">
        <Dropdown
          ariaLabel={`${employeeName} 재직 상태`}
          label={
            <>
              <current.icon
                className={cn("size-3.5 shrink-0", ICON_TONE[current.tone])}
                strokeWidth={2.25}
                aria-hidden
              />
              <span className={cn("truncate", statusTone(current.tone))}>{current.label}</span>
            </>
          }
        >
          {(close) =>
            ORDER.map((value) => {
              const meta = EMPLOYEE_STATUS[value];
              const selected = value === status;
              return (
                <DropdownItem
                  key={value}
                  selected={selected}
                  disabled={!canTransition(status, value) && !selected}
                  onSelect={() => {
                    close();
                    setError(undefined);
                    setTarget(value);
                  }}
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
                </DropdownItem>
              );
            })
          }
        </Dropdown>

        {error ? (
          <p className="mt-xxs inline-flex items-start gap-xxs text-caption text-error-deep">
            <CircleAlert className="mt-[2px] size-3 shrink-0" />
            {error}
          </p>
        ) : null}
      </div>

      <StatusChangeModal
        employeeId={employeeId}
        employeeName={employeeName}
        target={target}
        onClose={() => setTarget(undefined)}
        onFailure={setError}
      />
    </>
  );
}

// MARK: 상태 전이 모달
function StatusChangeModal({
  employeeId,
  employeeName,
  target,
  onClose,
  onFailure,
}: {
  employeeId: number;
  employeeName: string;
  target?: EmployeeStatus;
  onClose: () => void;
  onFailure: (message?: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [effectiveDate, setEffectiveDate] = useState(currentDate());
  const [reason, setReason] = useState("");

  if (!target) return null;
  const copy = DIALOG_COPY[target];

  const close = () => {
    setError(undefined);
    setReason("");
    setEffectiveDate(currentDate());
    onClose();
  };

  const submit = () => {
    startTransition(async () => {
      const result: StatusActionState = await changeStatusAction(
        employeeId,
        target,
        effectiveDate,
        reason,
      );
      if (result.ok) {
        onFailure(undefined);
        close();
        return;
      }
      setError(result.message);
    });
  };

  return (
    <Modal
      open
      onOpenChange={(next) => (next ? undefined : close())}
      title={copy.title}
      description={`${employeeName} 사원. ${copy.hint}`}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={close}>
            취소
          </Button>
          <Button type="button" disabled={pending} onClick={submit} className="gap-xs">
            {pending ? <Spinner size="sm" className="text-on-primary" /> : null}
            {copy.title}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-md">
        <Field label={copy.dateLabel} htmlFor="status-date" required>
          <DatePicker
            id="status-date"
            value={effectiveDate}
            onValueChange={setEffectiveDate}
            required
          />
        </Field>
        <Field label="사유" htmlFor="status-reason">
          <Textarea
            id="status-reason"
            rows={3}
            maxLength={500}
            placeholder="발령 이력에 남을 사유"
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
    </Modal>
  );
}
