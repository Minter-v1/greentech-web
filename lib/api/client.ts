import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/auth/session";
import type { ApiResult, FieldErrorRes } from "./types";

// MARK: - greentech-was REST 클라이언트
// 서버 전용. ApiResult 봉투를 벗겨 data만 반환하고 실패는 ApiError로 승격시킴.

const BASE_URL = process.env.WAS_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors: FieldErrorRes[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** 필드명 → 메시지 맵. 폼 인라인 에러 표시용 */
  get fieldErrorMap(): Record<string, string> {
    return Object.fromEntries(
      this.fieldErrors.flatMap((e) =>
        e.field && e.message ? [[e.field, e.message]] : [],
      ),
    );
  }
}

export type QueryValue = string | number | boolean | (string | number)[] | undefined | null;

interface RequestOptions extends Omit<RequestInit, "body"> {
  query?: Record<string, QueryValue>;
  body?: unknown;
  /** 토큰 미첨부. 로그인 등 공개 엔드포인트용 */
  anonymous?: boolean;
  /** 401 자동 로그아웃 리다이렉트 억제 */
  noRedirect?: boolean;
}

function buildQuery(query?: Record<string, QueryValue>): string {
  if (!query) return "";
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) value.forEach((v) => sp.append(key, String(v)));
    else sp.append(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, body, anonymous, noRedirect, headers, ...init } = options;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (!anonymous) {
    const token = await getAccessToken();
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}${buildQuery(query)}`, {
    ...init,
    headers: requestHeaders,
    body:
      body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    cache: init.cache ?? "no-store",
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as ApiResult<T>) : undefined;

  if (!response.ok || payload?.success === false) {
    if (response.status === 401 && !anonymous && !noRedirect) redirect("/logout?reason=expired");
    throw new ApiError(
      response.status,
      payload?.code ?? "UNKNOWN",
      payload?.message ?? `요청 실패 (${response.status})`,
      payload?.fieldErrors ?? [],
    );
  }

  return payload?.data as T;
}

/**
 * 도메인 호출 실패를 null로 흡수. 대시보드 위젯처럼 부분 실패를 허용하는 조회에 사용
 * NOTE: 401 리다이렉트는 ApiError가 아니므로 그대로 전파됨
 */
export async function orNull<T>(call: () => Promise<T>): Promise<T | null> {
  try {
    return await call();
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}
