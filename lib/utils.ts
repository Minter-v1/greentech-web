import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// MARK: - 공용 유틸

/**
 * NOTE: DESIGN.md 타이포 토큰(text-body-sm 등)을 폰트 크기로 등록.
 * 미등록 시 twMerge가 텍스트 색상으로 오분류해 text-on-primary를 삭제함
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xl",
            "display-lg",
            "display-md",
            "display-sm",
            "body-lg",
            "body-md",
            "body-sm",
            "caption",
            "code",
          ],
        },
      ],
      "text-color": [
        {
          text: [
            "ink",
            "body",
            "mute",
            "on-primary",
            "canvas",
            "canvas-soft",
            "canvas-soft-2",
            "hairline",
            "hairline-strong",
            "link",
            "link-deep",
            "error",
            "error-deep",
            "warning",
            "warning-deep",
            "cyan-deep",
            "cyan-ink",
            "violet-deep",
          ],
        },
      ],
    },
  },
});

export function cn(...values: ClassValue[]): string {
  return twMerge(clsx(values));
}

/** 2026-08 형태의 현재 정산월 */
export function currentYearMonth(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** 2026-08-17 형태의 오늘. date input 기본값용 */
export function currentDate(date = new Date()): string {
  return `${currentYearMonth(date)}-${String(date.getDate()).padStart(2, "0")}`;
}

/** 480 → "8시간 0분" */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

export function formatCurrency(amount: number): string {
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}

export function formatDate(value?: string): string {
  if (!value) return "-";
  return value.slice(0, 10).replaceAll("-", ".");
}

/** ISO datetime → "14:32" */
export function formatTime(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
