import { cache } from "react";
import { apiFetch } from "./client";
import type { LoginReq, LoginRes, MeRes } from "./types";

// MARK: - 인증

export function login(body: LoginReq) {
  return apiFetch<LoginRes>("/api/v1/auth/login", {
    method: "POST",
    body,
    anonymous: true,
  });
}

/** 요청 단위 캐시. 중복 호출돼도 1회만 나감 */
export const getMe = cache(() => apiFetch<MeRes>("/api/v1/auth/me"));

export function hasRole(me: MeRes, ...roles: string[]): boolean {
  return roles.some((role) => me.roles.includes(role));
}
