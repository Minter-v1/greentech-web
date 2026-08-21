import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { createPublicUrl } from "@/lib/http/public-url";

// MARK: - 라우트 가드
// 쿠키 존재 여부만 확인. 토큰 유효성은 WAS가 판정하고 401은 apiFetch가 /logout으로 넘김

const PUBLIC_PATHS = ["/login", "/logout", "/health"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = request.cookies.has(SESSION_COOKIE);
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!authenticated && !isPublic) {
    const loginUrl = createPublicUrl("/login");
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (authenticated && pathname.startsWith("/login")) {
    return NextResponse.redirect(createPublicUrl("/"));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|mp4|webm)$).*)",
  ],
};
