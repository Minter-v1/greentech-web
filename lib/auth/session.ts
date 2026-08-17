import { cookies } from "next/headers";
import type { LoginRes } from "@/lib/api/types";

// MARK: - 세션 토큰 저장소
// WAS가 발급한 accessToken을 httpOnly 쿠키에 보관. 클라이언트 JS에서 접근 불가.

export const SESSION_COOKIE = "gt_session";

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export async function setSession(login: LoginRes): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, login.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: login.expiresIn,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
