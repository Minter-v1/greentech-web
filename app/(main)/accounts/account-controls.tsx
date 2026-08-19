"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  CircleAlert,
  CircleCheck,
  KeyRound,
  Link2,
  LockOpen,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { SelectMenu } from "@/components/ui/select-menu";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import type { RoleRes } from "@/lib/api/types";
import {
  changePasswordAction,
  createAccountAction,
  linkEmployeeAction,
  resetPasswordAction,
  updateRolesAction,
  updateStatusAction,
  type AccountActionState,
} from "./actions";

// MARK: - 계정 조작

export interface EmployeeOption {
  id: number;
  label: string;
}

function Alert({ state }: { state: AccountActionState }) {
  if (!state.message) return null;
  const ok = state.ok === true;
  return (
    <p
      className={
        ok
          ? "flex items-center gap-xs rounded-sm bg-canvas-soft-2 px-sm py-xs text-body-sm text-ink"
          : "flex items-center gap-xs rounded-sm bg-error-soft px-sm py-xs text-body-sm text-error-deep"
      }
    >
      {ok ? (
        <CircleCheck className="size-4 shrink-0" />
      ) : (
        <CircleAlert className="size-4 shrink-0" />
      )}
      {state.message}
    </p>
  );
}

function useCloseOnSuccess(
  state: AccountActionState,
  close: () => void,
  formRef?: React.RefObject<HTMLFormElement | null>,
) {
  const handled = useRef<AccountActionState | null>(null);
  useEffect(() => {
    if (!state.ok || handled.current === state) return;
    handled.current = state;
    formRef?.current?.reset();
    close();
  }, [state, close, formRef]);
}

function ActionSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-xs">
      {pending ? <Spinner size="sm" className="text-on-primary" /> : null}
      {pending ? "처리 중" : label}
    </Button>
  );
}

function RoleCheckboxes({ roles, defaults }: { roles: RoleRes[]; defaults?: string[] }) {
  return (
    <div className="grid gap-xs sm:grid-cols-2">
      {roles.map((role) => (
        <label
          key={role.code}
          className="flex cursor-pointer items-start gap-xs rounded-sm bg-canvas-soft px-sm py-xs"
        >
          <input
            type="checkbox"
            name="roleCodes"
            value={role.code}
            defaultChecked={defaults?.includes(role.code)}
            className="mt-[2px] size-4 rounded-xs accent-primary"
          />
          <span className="flex flex-col">
            <span className="text-body-sm font-medium">{role.name}</span>
            <span className="text-caption text-mute">{role.description}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

// MARK: 계정 발급
export function CreateAccountDialog({
  employees,
  roles,
}: {
  employees: EmployeeOption[];
  roles: RoleRes[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<AccountActionState, FormData>(
    createAccountAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const close = () => setOpen(false);
  useCloseOnSuccess(state, close, formRef);

  return (
    <>
      <Button className="min-w-[8.5rem] gap-xs" onClick={() => setOpen(true)}>
        <UserPlus className="size-4" />
        계정 발급
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="계정 발급"
        description="임시 비밀번호와 업무 역할을 지정합니다. 권한 변경은 재로그인 후 적용됩니다"
      >
        <form ref={formRef} action={formAction} className="flex flex-col gap-md">
          <Field label="아이디" htmlFor="account-username" required>
            <Input
              id="account-username"
              name="username"
              minLength={4}
              maxLength={50}
              pattern="[A-Za-z0-9._-]+"
              autoComplete="off"
              required
            />
          </Field>
          <Field
            label="임시 비밀번호"
            htmlFor="account-temporary-password"
            error={state.fieldErrors?.temporaryPassword}
            required
          >
            <Input
              id="account-temporary-password"
              name="temporaryPassword"
              type="password"
              minLength={10}
              autoComplete="new-password"
              required
            />
          </Field>
          <Field
            label="임시 비밀번호 확인"
            htmlFor="account-temporary-password-confirm"
            error={state.fieldErrors?.confirmPassword}
            required
          >
            <Input
              id="account-temporary-password-confirm"
              name="confirmPassword"
              type="password"
              minLength={10}
              autoComplete="new-password"
              required
            />
          </Field>
          <Field label="연결 사원">
            <SelectMenu
              name="employeeId"
              ariaLabel="연결할 사원"
              placeholder="연결 안 함"
              panelPosition="absolute"
              options={[
                { value: "", label: "연결 안 함" },
                ...employees.map((employee) => ({
                  value: String(employee.id),
                  label: employee.label,
                })),
              ]}
            />
          </Field>
          <Field label="권한" required>
            <RoleCheckboxes roles={roles} defaults={["ROLE_EMPLOYEE"]} />
          </Field>
          {state.message ? <Alert state={state} /> : null}
          <div className="flex justify-end gap-xs">
            <Button type="button" variant="ghost" onClick={close}>취소</Button>
            <ActionSubmitButton label="발급" />
          </div>
        </form>
      </Modal>
    </>
  );
}

// MARK: 권한 변경
export function RolesControl({
  userId,
  username,
  assignedRoles,
  roles,
  disabled,
}: {
  userId: number;
  username: string;
  assignedRoles: string[];
  roles: RoleRes[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<AccountActionState, FormData>(
    updateRolesAction.bind(null, userId),
    {},
  );
  const close = () => setOpen(false);
  useCloseOnSuccess(state, close);

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        disabled={disabled}
        className="shrink-0 gap-xxs"
        onClick={() => setOpen(true)}
      >
        <ShieldCheck className="size-3.5" />
        권한
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="계정 권한 변경"
        description={`${username} 계정의 업무 권한을 선택하세요`}
      >
        <form action={formAction} className="flex flex-col gap-md">
          <Field label="권한" required>
            <RoleCheckboxes roles={roles} defaults={assignedRoles} />
          </Field>
          {state.message ? <Alert state={state} /> : null}
          <div className="flex justify-end gap-xs">
            <Button type="button" variant="ghost" onClick={close}>취소</Button>
            <ActionSubmitButton label="저장" />
          </div>
        </form>
      </Modal>
    </>
  );
}

// MARK: 상태 변경
export function AccountStatusControl({
  userId,
  username,
  enabled,
  locked,
  disabled,
}: {
  userId: number;
  username: string;
  enabled: boolean;
  locked: boolean;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<AccountActionState>({});
  const [target, setTarget] = useState<"enable" | "disable" | "unlock">();

  const openConfirm = (next: "enable" | "disable" | "unlock") => {
    setState({});
    setTarget(next);
  };

  const update = () => {
    if (!target) return;
    const nextEnabled = target === "enable" ? true : target === "disable" ? false : enabled;
    const nextLocked = target === "unlock" ? false : locked;

    startTransition(async () => {
      const result = await updateStatusAction(userId, nextEnabled, nextLocked);
      setState(result);
      if (result.ok) setTarget(undefined);
    });
  };

  const copy = target
    ? {
        enable: {
          title: "계정 활성화",
          description: `${username} 계정을 활성화할까요?`,
          action: "활성화",
        },
        disable: {
          title: "계정 비활성화",
          description: `${username} 계정을 비활성화할까요?`,
          action: "비활성화",
        },
        unlock: {
          title: "계정 잠금 해제",
          description: `${username} 계정의 잠금을 해제할까요?`,
          action: "잠금 해제",
        },
      }[target]
    : undefined;

  return (
    <>
      <div className="flex min-w-[5rem] justify-end gap-xxs">
        {locked ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={disabled || pending}
            className="shrink-0 gap-xxs"
            onClick={() => openConfirm("unlock")}
          >
            <LockOpen className="size-3.5" />
            잠금 해제
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="secondary"
          disabled={disabled || pending}
          className="shrink-0 gap-xxs"
          onClick={() => openConfirm(enabled ? "disable" : "enable")}
        >
          {enabled ? <UserX className="size-3.5" /> : <UserCheck className="size-3.5" />}
          {enabled ? "비활성" : "활성"}
        </Button>
      </div>

      <Modal
        open={Boolean(target)}
        onOpenChange={(next) => {
          if (!next && !pending) setTarget(undefined);
        }}
        title={copy?.title ?? "계정 상태 변경"}
        description={copy?.description}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => setTarget(undefined)}
            >
              취소
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={update}
              className="min-w-[5.5rem] gap-xs"
            >
              {pending ? <Spinner size="sm" className="text-on-primary" /> : null}
              {copy?.action ?? "변경"}
            </Button>
          </>
        }
      >
        <p className="text-body-sm text-body">
          상태 변경은 해당 사용자의 다음 로그인부터 완전히 반영됩니다.
        </p>
        {state.ok === false && state.message ? <Alert state={state} /> : null}
      </Modal>
    </>
  );
}

// MARK: 임시 비밀번호
export function ResetPasswordControl({
  userId,
  username,
  disabled,
}: {
  userId: number;
  username: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<AccountActionState, FormData>(
    resetPasswordAction.bind(null, userId),
    {},
  );
  const close = () => setOpen(false);
  useCloseOnSuccess(state, close);

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        disabled={disabled}
        className="shrink-0 gap-xxs"
        onClick={() => setOpen(true)}
      >
        <KeyRound className="size-3.5" />
        임시 비밀번호
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="임시 비밀번호 설정"
        description={`${username} 계정의 비밀번호를 재설정하고 잠금을 해제합니다`}
      >
        <form action={formAction} className="flex flex-col gap-md">
          <Field
            label="임시 비밀번호"
            htmlFor={`reset-password-${userId}`}
            error={state.fieldErrors?.temporaryPassword}
            required
          >
            <Input
              id={`reset-password-${userId}`}
              name="temporaryPassword"
              type="password"
              minLength={10}
              autoComplete="new-password"
              required
            />
          </Field>
          <Field
            label="임시 비밀번호 확인"
            htmlFor={`reset-password-confirm-${userId}`}
            error={state.fieldErrors?.confirmPassword}
            required
          >
            <Input
              id={`reset-password-confirm-${userId}`}
              name="confirmPassword"
              type="password"
              minLength={10}
              autoComplete="new-password"
              required
            />
          </Field>
          {state.message ? <Alert state={state} /> : null}
          <div className="flex justify-end gap-xs">
            <Button type="button" variant="ghost" onClick={close}>취소</Button>
            <ActionSubmitButton label="설정" />
          </div>
        </form>
      </Modal>
    </>
  );
}

// MARK: 사원 연결
export function LinkEmployeeControl({
  userId,
  username,
  employeeId,
  employees,
}: {
  userId: number;
  username: string;
  employeeId?: number;
  employees: EmployeeOption[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<AccountActionState>({});
  const [selected, setSelected] = useState(employeeId ? String(employeeId) : "");

  const submit = () => {
    startTransition(async () => {
      const result = await linkEmployeeAction(userId, selected ? Number(selected) : null);
      setState(result);
      if (result.ok) setOpen(false);
    });
  };

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        className="shrink-0 gap-xxs"
        onClick={() => setOpen(true)}
      >
        <Link2 className="size-3.5" />
        {employeeId ? "변경" : "연결"}
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="사원 연결"
        description={`${username} 계정에 연결할 사원을 선택하세요. 연결 후 해당 계정은 재로그인해야 근태·휴가 기능을 쓸 수 있습니다`}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="button" disabled={pending} onClick={submit} className="gap-xs">
              {pending ? <Spinner size="sm" className="text-on-primary" /> : null}
              저장
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-md">
          <Field label="사원" htmlFor={`link-${userId}`}>
            <SelectMenu
              name={`link-${userId}`}
              ariaLabel="연결할 사원"
              defaultValue={selected}
              placeholder="연결 해제"
              onValueChange={setSelected}
              options={[
                { value: "", label: "연결 해제" },
                ...employees.map((employee) => ({
                  value: String(employee.id),
                  label: employee.label,
                })),
              ]}
            />
          </Field>

          {state.ok ? null : <Alert state={state} />}
        </div>
      </Modal>
    </>
  );
}

// MARK: 비밀번호 변경
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-xs">
      {pending ? <Spinner size="sm" className="text-on-primary" /> : null}
      변경
    </Button>
  );
}

export function ChangePasswordControl() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<AccountActionState, FormData>(
    changePasswordAction,
    {},
  );

  return (
    <>
      <Button
        variant="secondary"
        className="min-w-[8.5rem] gap-xs"
        onClick={() => setOpen(true)}
      >
        <KeyRound className="size-4" />
        비밀번호 변경
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="비밀번호 변경"
        description="본인 계정의 비밀번호를 변경합니다. 10자 이상"
      >
        <form action={formAction} className="flex flex-col gap-md">
          <Field label="현재 비밀번호" htmlFor="current-password" required>
            <Input
              id="current-password"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>
          <Field
            label="새 비밀번호"
            htmlFor="new-password"
            error={state.fieldErrors?.newPassword}
            required
          >
            <Input
              id="new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
            />
          </Field>
          <Field
            label="새 비밀번호 확인"
            htmlFor="confirm-password"
            error={state.fieldErrors?.confirmPassword}
            required
          >
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
            />
          </Field>

          <Alert state={state} />

          <div className="flex justify-end gap-xs">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              닫기
            </Button>
            <SubmitButton />
          </div>
        </form>
      </Modal>
    </>
  );
}
