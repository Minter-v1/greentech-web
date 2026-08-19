// MARK: - 폼 컨트롤 스타일

export const CONTROL_BASE = [
  "w-full rounded-sm bg-canvas px-sm text-body-sm text-ink",
  "border border-hairline placeholder:text-mute",
  "transition-interactive outline-none",
  "hover:border-hairline-strong/45",
  "focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink",
  "disabled:cursor-not-allowed disabled:bg-canvas-soft-2 disabled:text-mute disabled:hover:border-hairline",
].join(" ");

export const FLOATING_PANEL =
  "max-h-[min(20rem,calc(100vh-2rem))] overflow-y-auto rounded-sm border border-hairline bg-canvas p-xxs text-ink shadow-level-5";
