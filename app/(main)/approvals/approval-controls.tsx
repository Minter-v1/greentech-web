"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import {
  approveLeaveAction,
  approveOvertimeAction,
  rejectLeaveAction,
  rejectOvertimeAction,
  type ApprovalActionState,
} from "./actions";

// MARK: - 결재 버튼

function ApproveButton({ onApprove }: { onApprove: () => Promise<ApprovalActionState> }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-col items-end gap-xxs">
      <Button
        size="sm"
        disabled={pending}
        className="gap-xxs"
        onClick={() =>
          startTransition(async () => {
            const result = await onApprove();
            setError(result.ok ? undefined : result.message);
          })
        }
      >
        {pending ? <Spinner size="sm" className="text-on-primary" /> : <Check className="size-3.5" />}
        승인
      </Button>
      {error ? <span className="text-caption text-error">{error}</span> : null}
    </div>
  );
}

function RejectSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-xxs">
      {pending ? <Spinner size="sm" className="text-on-primary" /> : <X className="size-3.5" />}
      {pending ? "처리 중" : "반려"}
    </Button>
  );
}

function LeaveRejectButton({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ApprovalActionState, FormData>(
    rejectLeaveAction.bind(null, id),
    {},
  );
  const handled = useRef<ApprovalActionState | null>(null);

  useEffect(() => {
    if (!state.ok || handled.current === state) return;
    handled.current = state;
    setOpen(false);
  }, [state]);

  return (
    <>
      <Button size="sm" variant="secondary" className="gap-xxs" onClick={() => setOpen(true)}>
        <X className="size-3.5" />
        반려
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="휴가 신청 반려"
        description="신청자에게 전달할 반려 사유를 입력하세요"
      >
        <form action={formAction} className="flex flex-col gap-md">
          <Field label="반려 사유" htmlFor={`leave-reject-${id}`} required>
            <Textarea id={`leave-reject-${id}`} name="reason" rows={4} maxLength={500} required />
          </Field>
          {state.ok === false && state.message ? <FormAlert message={state.message} /> : null}
          <div className="flex justify-end gap-xs">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              취소
            </Button>
            <RejectSubmitButton />
          </div>
        </form>
      </Modal>
    </>
  );
}

function OvertimeRejectButton({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const reject = () => {
    startTransition(async () => {
      const result = await rejectOvertimeAction(id);
      setError(result.ok ? undefined : result.message);
      if (result.ok) setOpen(false);
    });
  };

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        className="gap-xxs"
        onClick={() => {
          setError(undefined);
          setOpen(true);
        }}
      >
        <X className="size-3.5" />
        반려
      </Button>

      <Modal
        open={open}
        onOpenChange={(next) => {
          if (!pending) setOpen(next);
        }}
        title="연장근무 신청 반려"
        description="반려 후 신청 상태가 즉시 변경됩니다"
        footer={
          <>
            <Button type="button" variant="ghost" disabled={pending} onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="button" disabled={pending} onClick={reject} className="min-w-[5.5rem] gap-xs">
              {pending ? <Spinner size="sm" className="text-on-primary" /> : null}
              {pending ? "처리 중" : "반려"}
            </Button>
          </>
        }
      >
        <p className="text-body-sm text-body">이 연장근무 신청을 반려할까요?</p>
        {error ? <FormAlert message={error} /> : null}
      </Modal>
    </>
  );
}

export function LeaveApprovalControls({ id }: { id: number }) {
  return (
    <div className="flex items-start justify-end gap-xxs">
      <ApproveButton onApprove={() => approveLeaveAction(id)} />
      <LeaveRejectButton id={id} />
    </div>
  );
}

export function OvertimeApprovalControls({ id }: { id: number }) {
  return (
    <div className="flex items-start justify-end gap-xxs">
      <ApproveButton onApprove={() => approveOvertimeAction(id)} />
      <OvertimeRejectButton id={id} />
    </div>
  );
}
