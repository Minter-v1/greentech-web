"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CalendarClock, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Field, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { SelectMenu } from "@/components/ui/select-menu";
import { Spinner } from "@/components/ui/spinner";
import { currentDate } from "@/lib/utils";
import { createOvertimeAction, type OvertimeFormState } from "./actions";

// MARK: - 연장근무 신청 다이얼로그

const TYPE_OPTIONS = [
  { value: "EXTENDED", label: "연장근무" },
  { value: "NIGHT", label: "야간근무" },
  { value: "HOLIDAY", label: "휴일근무" },
];

function defaultDateTime(hour: number): string {
  return `${currentDate()}T${String(hour).padStart(2, "0")}:00`;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-xs">
      {pending ? <Spinner size="sm" className="text-on-primary" /> : null}
      {pending ? "신청 중" : "신청"}
    </Button>
  );
}

export function OvertimeRequestDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<OvertimeFormState, FormData>(
    createOvertimeAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const handled = useRef<OvertimeFormState | null>(null);

  useEffect(() => {
    if (!state.ok || handled.current === state) return;
    handled.current = state;
    formRef.current?.reset();
    setOpen(false);
  }, [state]);

  return (
    <>
      <Button className="gap-xs" onClick={() => setOpen(true)}>
        <CalendarClock className="size-4" />
        연장근무 신청
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="연장근무 신청"
        description="승인된 근무만 급여 정산에 반영됩니다"
      >
        <form ref={formRef} action={formAction} className="flex flex-col gap-md">
          <Field label="근무 구분" required>
            <SelectMenu
              name="overtimeType"
              ariaLabel="근무 구분"
              defaultValue="EXTENDED"
              options={TYPE_OPTIONS}
              panelPosition="absolute"
            />
          </Field>
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <Field label="시작 시각" htmlFor="overtime-start" error={state.fieldErrors?.startAt} required>
              <DateTimePicker
                id="overtime-start"
                name="startAt"
                defaultValue={defaultDateTime(18)}
                required
              />
            </Field>
            <Field label="종료 시각" htmlFor="overtime-end" error={state.fieldErrors?.endAt} required>
              <DateTimePicker
                id="overtime-end"
                name="endAt"
                defaultValue={defaultDateTime(20)}
                required
              />
            </Field>
          </div>
          <Field label="사유" htmlFor="overtime-reason">
            <Textarea id="overtime-reason" name="reason" rows={3} maxLength={500} />
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
