import { ViewTransition, type ReactNode } from "react";

// MARK: - 페이지 전환
// 레이아웃은 내비게이션 간 유지되어 enter/exit 가 발화하지 않음. page 단위로 감쌀 것

/** 방향 타입이 없는 전환(Suspense 공개, router.refresh)은 부드러운 페이드로 처리 */
const ENTER = {
  "nav-down": "nav-down",
  "nav-up": "nav-up",
  default: "reveal",
};

const EXIT = {
  "nav-down": "nav-down",
  "nav-up": "nav-up",
  default: "none",
};

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={ENTER} exit={EXIT} default="none">
      {children}
    </ViewTransition>
  );
}
