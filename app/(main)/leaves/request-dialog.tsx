"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CalendarPlus, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, Textarea } from "@/components/ui/field";
import { SelectMenu } from "@/components/ui/select-menu";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import type { LeaveTypeRes } from "@/lib/api/types";
import { currentDate } from "@/lib/utils";
import { createLeaveRequestAction, type LeaveFormState } from "./actions";

// MARK: - 휴가 신청 다이얼로그

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-xs">
      {pending ? <Spinner size="sm" className="text-on-primary" /> : null}
      {pending ? "신청 중" : "신청"}
    </Button>
  );
}

export function LeaveRequestDialog({ leaveTypes }: { leaveTypes: LeaveTypeRes[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<LeaveFormState, FormData>(
    createLeaveRequestAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const handled = useRef<LeaveFormState | null>(null);

  useEffect(() => {
    if (!state.ok || handled.current === state) return;
    handled.current = state;
    formRef.current?.reset();
    setOpen(false);
  }, [state]);

  return (
    <>
      <Button className="gap-xs" onClick={() => setOpen(true)}>
        <CalendarPlus className="size-4" />
        휴가 신청
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="휴가 신청"
        description="신청일수는 근무일 기준으로 자동 계산됩니다"
      >
        <form ref={formRef} action={formAction} className="flex flex-col gap-md">
          <Field label="휴가 종류" htmlFor="leave-type" error={state.fieldErrors?.leaveTypeId} required>
            <SelectMenu
              name="leaveTypeId"
              ariaLabel="휴가 종류"
              panelPosition="absolute"
              options={leaveTypes.map((type) => ({
                value: String(type.id),
                label: `${type.name}${type.paid ? " (유급)" : " (무급)"}`,
              }))}
            />
          </Field>

          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <Field label="시작일" htmlFor="leave-start" error={state.fieldErrors?.startDate} required>
              <DatePicker id="leave-start" name="startDate" defaultValue={currentDate()} required />
            </Field>
            <Field label="종료일" htmlFor="leave-end" error={state.fieldErrors?.endDate} required>
              <DatePicker id="leave-end" name="endDate" defaultValue={currentDate()} required />
            </Field>
          </div>

          <label className="flex items-center gap-xs text-body-sm">
            <input type="checkbox" name="halfDay" className="size-4 rounded-xs accent-primary" />
            반차 (시작일과 종료일이 같아야 함)
          </label>

          <Field label="사유" htmlFor="leave-reason">
            <Textarea id="leave-reason" name="reason" rows={3} maxLength={500} />
          </Field>

          {state.ok === false && state.message ? (
            <p className="flex items-center gap-xs rounded-sm bg-error-soft px-sm py-xs text-body-sm text-error-deep">
              <CircleAlert className="size-4 shrink-0" />
              {state.message}
            </p>
          ) : null}

          <div className="flex justify-end gap-xs">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              취소
            </Button>
            <SubmitButton />
          </div>
        </form>
      </Modal>
    </>
  );
}
