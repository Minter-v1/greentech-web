"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { setSession } from "@/lib/auth/session";

// MARK: - 로그인 액션

export interface LoginFormState {
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function loginAction(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!username || !password) {
    return { message: "아이디와 비밀번호를 입력하세요" };
  }

  try {
    const session = await login({ username, password });
    await setSession(session);
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message, fieldErrors: error.fieldErrorMap };
    }
    return { message: "인증 서버에 연결할 수 없습니다" };
  }

  // NOTE: 오픈 리다이렉트 차단 - 내부 경로만 허용
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}
