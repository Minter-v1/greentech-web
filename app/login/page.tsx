import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { LoginForm } from "./login-form";
import { HyperspeedBackdrop } from "./hyperspeed-backdrop";

export const metadata: Metadata = { title: "로그인 · greentech" };

const REASON_MESSAGE: Record<string, string> = {
  expired: "세션이 만료되었습니다. 다시 로그인하세요",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/";
  const reason = typeof params.reason === "string" ? params.reason : undefined;

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* MARK: 좌측 - Hyperspeed 배너 */}
      <section className="relative hidden overflow-hidden bg-[#050505] lg:block">
        {/* WebGL 로드 전 노출되는 정적 폴백. 지평선 글로우로 검은 화면 플래시 방지 */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(52% 34% at 36% 52%, rgba(121,40,202,0.35) 0%, transparent 70%)," +
              "radial-gradient(52% 34% at 64% 52%, rgba(0,124,240,0.35) 0%, transparent 70%)," +
              "#050505",
          }}
        />

        <HyperspeedBackdrop />

        {/* 주행 조명 위 카피 가독성 확보용 스크림 */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/45 to-transparent"
        />

        <div className="relative flex h-full flex-col justify-between p-4xl text-on-primary">
          <span className="text-caption uppercase tracking-wide opacity-70">
            greentech
          </span>
          <div className="flex flex-col gap-sm">
            <h2 className="text-display-lg">사람과 시간을 한곳에서</h2>
            <p className="max-w-[380px] text-body-md opacity-70">
              사원 정보부터 근태·휴가·급여까지, <br /> 인사 업무의 모든 흐름을 하나의 화면에서
              관리합니다
            </p>
          </div>
          <span className="text-caption opacity-50" />
        </div>
      </section>

      {/* MARK: 우측 - 로그인 폼 */}
      <section className="flex items-center justify-center bg-canvas px-md py-4xl">
        <div className="w-full max-w-[360px] animate-fade-up">
          <div className="mb-xl flex flex-col gap-xs">
            <span className="text-caption uppercase text-mute lg:hidden">greentech</span>
            <h1 className="text-display-lg">인사관리시스템</h1>
            <p className="text-body-md text-body">사내 계정으로 로그인하세요</p>
          </div>

          {reason ? (
            <p className="mb-md flex items-center gap-xs rounded-sm bg-warning-soft px-sm py-xs text-body-sm text-warning-deep">
              <TriangleAlert className="size-4 shrink-0" />
              {REASON_MESSAGE[reason] ?? "다시 로그인하세요"}
            </p>
          ) : null}

          <LoginForm next={next} />
        </div>
      </section>
    </div>
  );
}
