import { NextResponse, type NextRequest } from "next/server";
import { clearSession } from "@/lib/auth/session";

// MARK: - 로그아웃
// 명시적 로그아웃과 토큰 만료(apiFetch 401 리다이렉트) 양쪽 진입점

export async function GET(request: NextRequest) {
  await clearSession();

  const loginUrl = new URL("/login", request.url);
  const reason = request.nextUrl.searchParams.get("reason");
  if (reason) loginUrl.searchParams.set("reason", reason);

  return NextResponse.redirect(loginUrl);
}
