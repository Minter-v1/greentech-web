"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { loginAction, type LoginFormState } from "./actions";

// MARK: - 로그인 폼

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="mt-xs w-full gap-xs">
      {pending ? (
        <>
          <Spinner size="sm" className="text-on-primary" />
          확인 중
        </>
      ) : (
        "로그인"
      )}
    </Button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [errorOpen, setErrorOpen] = useState(false);
  const [state, formAction] = useActionState<LoginFormState, FormData>(
    async (previous, formData) => {
      const result = await loginAction(previous, formData);
      if (result.message) setErrorOpen(true);
      return result;
    },
    {},
  );

  return (
    <>
      <form action={formAction} className="flex flex-col gap-md">
        <input type="hidden" name="next" value={next} />

        <Field label="아이디" htmlFor="username" error={state.fieldErrors?.username}>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            autoFocus
            placeholder="아이디를 입력해주세요"
            required
          />
        </Field>

        <Field label="비밀번호" htmlFor="password" error={state.fieldErrors?.password}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호를 입력해주세요"
            required
          />
        </Field>

        <SubmitButton />
      </form>

      <Modal
        open={errorOpen}
        onOpenChange={setErrorOpen}
        title="로그인에 실패했습니다"
        description="아이디와 비밀번호를 다시 확인해주세요"
        footer={
          <Button type="button" onClick={() => setErrorOpen(false)}>
            확인
          </Button>
        }
      >
        <p className="text-body-sm text-error-deep">{state.message}</p>
      </Modal>
    </>
  );
}
