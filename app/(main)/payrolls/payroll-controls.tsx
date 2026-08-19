"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { BadgeCheck, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker, MonthPicker } from "@/components/ui/date-picker";
import { Field, FormAlert } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { currentDate, currentYearMonth } from "@/lib/utils";
import {
  confirmPayrollAction,
  runPayrollAction,
  type PayrollActionState,
} from "./actions";

// MARK: - 급여 정산 컨트롤

function RunSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-xs">
      {pending ? <Spinner size="sm" className="text-on-primary" /> : <Calculator className="size-4" />}
      {pending ? "정산 중" : "정산 실행"}
    </Button>
  );
}

export function RunPayrollDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<PayrollActionState, FormData>(runPayrollAction, {});
  const handled = useRef<PayrollActionState | null>(null);

  useEffect(() => {
    if (!state.ok || handled.current === state) return;
    handled.current = state;
    setOpen(false);
  }, [state]);

  return (
    <>
      <Button className="gap-xs" onClick={() => setOpen(true)}>
        <Calculator className="size-4" />
        급여 정산
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="급여 정산 실행"
        description="재직 사원의 근태와 급여 항목을 기준으로 명세서를 생성합니다"
      >
        <form action={formAction} className="flex flex-col gap-md">
          <Field label="정산월" htmlFor="pay-year-month" required>
            <MonthPicker
              id="pay-year-month"
              name="payYearMonth"
              defaultValue={currentYearMonth()}
              required
            />
          </Field>
          <Field label="지급일" htmlFor="pay-date">
            <DatePicker id="pay-date" name="payDate" defaultValue={currentDate()} />
          </Field>
          {state.ok === false && state.message ? <FormAlert message={state.message} /> : null}
          <div className="flex justify-end gap-xs">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              취소
            </Button>
            <RunSubmitButton />
          </div>
        </form>
      </Modal>
    </>
  );
}

export function ConfirmPayrollButton({ runId }: { runId: number }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const confirm = () => {
    startTransition(async () => {
      const result = await confirmPayrollAction(runId);
      setError(result.ok ? undefined : result.message);
      if (result.ok) setOpen(false);
    });
  };

  return (
    <>
      <Button
        size="sm"
        disabled={pending}
        className="gap-xxs"
        onClick={() => {
          setError(undefined);
          setOpen(true);
        }}
      >
        <BadgeCheck className="size-3.5" />
        급여 확정
      </Button>

      <Modal
        open={open}
        onOpenChange={(next) => {
          if (!pending) setOpen(next);
        }}
        title="급여 확정"
        description="확정 후에는 정산 결과를 변경할 수 없습니다"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={confirm}
              className="min-w-[5.5rem] gap-xs"
            >
              {pending ? <Spinner size="sm" className="text-on-primary" /> : null}
              {pending ? "확정 중" : "확정"}
            </Button>
          </>
        }
      >
        <p className="text-body-sm text-body">
          현재 정산 내역과 명세서를 최종 급여로 확정할까요?
        </p>
        {error ? <FormAlert message={error} /> : null}
      </Modal>
    </>
  );
}
