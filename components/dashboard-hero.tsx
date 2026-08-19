import { ArrowRight, Leaf } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

// MARK: - 대시보드 히어로

export function DashboardHero({
  displayName,
  canApprove,
}: {
  displayName: string;
  canApprove: boolean;
}) {
  const primaryHref = canApprove ? "/approvals" : "/attendance";
  const primaryLabel = canApprove ? "결재함 확인" : "내 근태 확인";

  return (
    <section className="relative isolate min-h-[320px] overflow-hidden rounded-xl bg-ink text-on-primary shadow-level-4">
      <video
        className="absolute inset-0 -z-20 size-full object-cover"
        src="/greentech_hrms_hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-ink via-ink/72 to-ink/10" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink/40 via-transparent to-ink/8" />

      <div className="flex min-h-[320px] flex-col justify-between gap-xl p-lg sm:p-xl lg:p-2xl">
        <div className="flex items-center gap-xs text-caption font-medium tracking-[0.14em] text-on-primary/70 uppercase">
          <span className="flex size-7 items-center justify-center rounded-full bg-on-primary/10 ring-1 ring-inset ring-on-primary/15 backdrop-blur-sm">
            <Leaf className="size-3.5" aria-hidden />
          </span>
          Greentech Workplace
        </div>

        <div className="max-w-[680px]">
          <p className="mb-xs text-body-sm text-on-primary/70">안녕하세요, {displayName}님</p>
          <h1 className="max-w-[480px] text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.12] font-medium tracking-[-0.03em] text-balance">
            함께 만드는
            <br />
            그린테크의 오늘
          </h1>
          <p className="mt-sm max-w-[420px] text-body-sm leading-6 text-on-primary/72 sm:text-body-md">
            사람과 업무의 흐름을 한곳에서 확인하세요.
          </p>
          <div className="mt-md flex flex-wrap gap-xs">
            <LinkButton
              href={primaryHref}
              className="gap-xs bg-on-primary text-ink ring-0 hover:bg-on-primary/90"
            >
              {primaryLabel}
              <ArrowRight className="size-4" aria-hidden />
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
