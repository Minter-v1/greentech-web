import { getAccessToken } from "@/lib/auth/session";

const BASE_URL = process.env.WAS_BASE_URL ?? "http://localhost:8080";

// MARK: - 인증 첨부파일 다운로드

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = await getAccessToken();
  if (!token) return new Response("인증이 필요합니다", { status: 401 });

  const { id } = await context.params;
  const response = await fetch(`${BASE_URL}/api/v1/attachments/${id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const headers = new Headers();
  for (const name of ["content-type", "content-disposition", "content-length"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }

  if (new URL(request.url).searchParams.get("inline") === "1") {
    const disposition = headers.get("content-disposition");
    headers.set("content-disposition", disposition?.replace(/^attachment/i, "inline") ?? "inline");
  }
  headers.set("cache-control", "private, no-store");
  headers.set("x-content-type-options", "nosniff");

  return new Response(response.body, { status: response.status, headers });
}
