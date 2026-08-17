import Link from "next/link";
import { cn } from "@/lib/utils";

// MARK: - 필 탭
// 결재 상태 필터처럼 쿼리스트링으로 전환되는 링크 탭

export interface PillTab {
  value: string;
  label: string;
}

interface PillTabsProps {
  tabs: PillTab[];
  active: string;
  /** value → href 변환 */
  hrefFor: (value: string) => string;
  label: string;
}

export function PillTabs({ tabs, active, hrefFor, label }: PillTabsProps) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-xs">
      {tabs.map((tab) => {
        const selected = active === tab.value;
        return (
          <Link
            key={tab.value}
            href={hrefFor(tab.value)}
            aria-current={selected ? "page" : undefined}
            className={cn(
              "rounded-full px-md py-xxs text-body-sm select-none",
              "transition-interactive focus-ring active:scale-[0.97]",
              selected
                ? "bg-primary text-on-primary ring-1 ring-primary"
                : "text-body ring-1 ring-hairline hover:bg-canvas-soft-2 hover:text-ink hover:ring-hairline-strong/40",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
