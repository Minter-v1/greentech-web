"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CircleAlert, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/field";
import { SelectMenu } from "@/components/ui/select-menu";
import { Spinner } from "@/components/ui/spinner";
import type { JobPositionRes } from "@/lib/api/types";
import {
  createDepartmentAction,
  createPositionAction,
  updatePositionAction,
  type OrgFormState,
} from "./actions";

// MARK: - 부서 직위 등록 다이얼로그

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-xs">
      {pending ? <Spinner size="sm" className="text-on-primary" /> : null}
      {pending ? "등록 중" : label}
    </Button>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-xs rounded-sm bg-error-soft px-sm py-xs text-body-sm text-error-deep">
      <CircleAlert className="size-4 shrink-0" />
      {message}
    </p>
  );
}

/** 성공 시 다이얼로그를 닫고 폼을 비움 */
function useCloseOnSuccess(
  state: OrgFormState,
  onClose: () => void,
  formRef: React.RefObject<HTMLFormElement | null>,
) {
  const handled = useRef<OrgFormState | null>(null);
  useEffect(() => {
    if (!state.ok || handled.current === state) return;
    handled.current = state;
    formRef.current?.reset();
    onClose();
  }, [state, onClose, formRef]);
}

interface DepartmentOption {
  id: number;
  name: string;
  depth: number;
}

export function CreateDepartmentDialog({ departments }: { departments: DepartmentOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<OrgFormState, FormData>(
    createDepartmentAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  useCloseOnSuccess(state, () => setOpen(false), formRef);

  return (
    <>
      <Button size="sm" variant="secondary" className="gap-xxs" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" />
        부서 추가
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="부서 추가"
        description="상위 부서를 지정하면 계층 아래에 등록됩니다"
      >
        <form ref={formRef} action={formAction} className="flex flex-col gap-md">
          <Field label="부서코드" htmlFor="dept-code" error={state.fieldErrors?.code} required>
            <Input id="dept-code" name="code" placeholder="D130" required />
          </Field>
          <Field label="부서명" htmlFor="dept-name" error={state.fieldErrors?.name} required>
            <Input id="dept-name" name="name" placeholder="총무팀" required />
          </Field>
          <Field label="상위 부서" htmlFor="dept-parent">
            <SelectMenu
              name="parentId"
              ariaLabel="상위 부서"
              placeholder="없음 (최상위)"
              options={[
                { value: "", label: "없음 (최상위)" },
                ...departments.map((dept) => ({
                  value: String(dept.id),
                  label: dept.name,
                  depth: dept.depth,
                })),
              ]}
            />
          </Field>
          <Field label="정렬 순서" htmlFor="dept-sort" error={state.fieldErrors?.sortOrder}>
            <Input id="dept-sort" name="sortOrder" type="number" placeholder="10" />
          </Field>

          <FormError message={state.ok ? undefined : state.message} />

          <div className="flex justify-end gap-xs">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            취소
            </Button>
            <SubmitButton label="등록" />
          </div>
        </form>
      </Modal>
    </>
  );
}

export function CreatePositionDialog({ nextLevel }: { nextLevel: number }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<OrgFormState, FormData>(createPositionAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  useCloseOnSuccess(state, () => setOpen(false), formRef);

  return (
    <>
      <Button size="sm" variant="secondary" className="gap-xxs" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" />
        직위 추가
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="직위 추가"
        description="서열이 클수록 상위 직위입니다"
      >
        <form ref={formRef} action={formAction} className="flex flex-col gap-md">
          <Field label="직위코드" htmlFor="pos-code" error={state.fieldErrors?.code} required>
            <Input id="pos-code" name="code" placeholder="P70" required />
          </Field>
          <Field label="직위명" htmlFor="pos-name" error={state.fieldErrors?.name} required>
            <Input id="pos-name" name="name" placeholder="상무" required />
          </Field>
          <Field label="서열" htmlFor="pos-level" error={state.fieldErrors?.levelNo} required>
            <Input
              id="pos-level"
              name="levelNo"
              type="number"
              min={1}
              defaultValue={nextLevel}
              required
            />
          </Field>

          <FormError message={state.ok ? undefined : state.message} />

          <div className="flex justify-end gap-xs">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            취소
            </Button>
            <SubmitButton label="등록" />
          </div>
        </form>
      </Modal>
    </>
  );
}

// MARK: 직위 수정
export function EditPositionDialog({ position }: { position: JobPositionRes }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<OrgFormState, FormData>(
    updatePositionAction.bind(null, position.id),
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  useCloseOnSuccess(state, () => setOpen(false), formRef);

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="gap-xxs"
        aria-label={`${position.name} 수정`}
        onClick={() => setOpen(true)}
      >
        <Pencil className="size-3.5" />
        수정
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="직위 수정"
        description={`직위코드 ${position.code} 는 변경할 수 없습니다`}
      >
        <form ref={formRef} action={formAction} className="flex flex-col gap-md">
          <Field label="직위명" htmlFor={`pos-name-${position.id}`} error={state.fieldErrors?.name} required>
            <Input
              id={`pos-name-${position.id}`}
              name="name"
              defaultValue={position.name}
              required
            />
          </Field>
          <Field
            label="서열"
            htmlFor={`pos-level-${position.id}`}
            error={state.fieldErrors?.levelNo}
            required
          >
            <Input
              id={`pos-level-${position.id}`}
              name="levelNo"
              type="number"
              min={1}
              defaultValue={position.levelNo}
              required
            />
          </Field>
          <label className="flex items-center gap-xs text-body-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={position.active}
              className="size-4 rounded-xs accent-primary"
            />
            사용
          </label>

          <FormError message={state.ok ? undefined : state.message} />

          <div className="flex justify-end gap-xs">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            취소
            </Button>
            <SubmitButton label="저장" />
          </div>
        </form>
      </Modal>
    </>
  );
}
