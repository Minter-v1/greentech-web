"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
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
  const [state, formAction] = useActionState<LoginFormState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-md">
      <input type="hidden" name="next" value={next} />

      <Field label="아이디" htmlFor="username" error={state.fieldErrors?.username}>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          autoFocus
          placeholder="아이디를 입력해주세요"
        />
      </Field>

      <Field label="비밀번호" htmlFor="password" error={state.fieldErrors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호를 입력해주세요"
        />
      </Field>

      {state.message ? (
        <p className="flex items-center gap-xs rounded-sm bg-error-soft px-sm py-xs text-body-sm text-error-deep">
          <CircleAlert className="size-4 shrink-0" />
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
