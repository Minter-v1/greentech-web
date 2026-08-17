import {
  AlarmClock,
  Ban,
  BadgeCheck,
  CalendarOff,
  Check,
  CircleAlert,
  CircleCheck,
  CircleMinus,
  Clock,
  Calculator,
  FileText,
  LogOut,
  PauseCircle,
  Sun,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ApprovalStatus,
  AttendanceStatus,
  EmployeeStatus,
  PayrollRunStatus,
} from "@/lib/api/types";

// MARK: - 상태 배지
// 칩은 뉴트럴 고정, 의미는 아이콘 색으로만 전달

export type Tone = "normal" | "attention" | "critical" | "inactive";

export const ICON_TONE: Record<Tone, string> = {
  normal: "text-ink",
  attention: "text-warning-deep",
  critical: "text-error",
  inactive: "text-mute",
};

const TEXT_TONE: Record<Tone, string> = {
  normal: "text-ink",
  attention: "text-ink",
  critical: "text-error-deep",
  inactive: "text-mute",
};

export function statusTone(tone: Tone): string {
  return TEXT_TONE[tone];
}

interface BadgeProps {
  children: React.ReactNode;
  tone?: Tone;
  icon?: LucideIcon;
  className?: string;
}

export function Badge({ children, tone = "inactive", icon: Icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] rounded-full bg-canvas py-[3px] pl-[7px] pr-[10px]",
        "text-caption font-medium whitespace-nowrap ring-1 ring-inset ring-hairline",
        TEXT_TONE[tone],
        className,
      )}
    >
      {Icon ? (
        <Icon className={cn("size-3 shrink-0", ICON_TONE[tone])} strokeWidth={2.25} aria-hidden />
      ) : null}
      {children}
    </span>
  );
}

// MARK: 도메인별 상태 매핑

export interface StatusMeta {
  label: string;
  tone: Tone;
  icon: LucideIcon;
}

export const EMPLOYEE_STATUS: Record<EmployeeStatus, StatusMeta> = {
  ACTIVE: { label: "재직", tone: "normal", icon: CircleCheck },
  ON_LEAVE: { label: "휴직", tone: "attention", icon: PauseCircle },
  RESIGNED: { label: "퇴사", tone: "inactive", icon: CircleMinus },
};

const APPROVAL_STATUS: Record<ApprovalStatus, StatusMeta> = {
  REQUESTED: { label: "결재 대기", tone: "attention", icon: Clock },
  APPROVED: { label: "승인", tone: "normal", icon: CircleCheck },
  REJECTED: { label: "반려", tone: "critical", icon: XCircle },
  CANCELED: { label: "취소", tone: "inactive", icon: Ban },
};

const ATTENDANCE_STATUS: Record<AttendanceStatus, StatusMeta> = {
  NORMAL: { label: "정상", tone: "normal", icon: Check },
  LATE: { label: "지각", tone: "attention", icon: AlarmClock },
  EARLY_LEAVE: { label: "조퇴", tone: "attention", icon: LogOut },
  ABSENT: { label: "결근", tone: "critical", icon: CircleAlert },
  ON_LEAVE: { label: "휴가", tone: "inactive", icon: Sun },
  HOLIDAY: { label: "휴일", tone: "inactive", icon: CalendarOff },
};

const PAYROLL_STATUS: Record<PayrollRunStatus, StatusMeta> = {
  DRAFT: { label: "작성", tone: "inactive", icon: FileText },
  CALCULATED: { label: "정산 완료", tone: "attention", icon: Calculator },
  CONFIRMED: { label: "확정", tone: "normal", icon: BadgeCheck },
  CANCELED: { label: "취소", tone: "inactive", icon: Ban },
};

function StatusBadge({ meta }: { meta: StatusMeta }) {
  return (
    <Badge tone={meta.tone} icon={meta.icon}>
      {meta.label}
    </Badge>
  );
}

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return <StatusBadge meta={EMPLOYEE_STATUS[status]} />;
}

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  return <StatusBadge meta={APPROVAL_STATUS[status]} />;
}

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  return <StatusBadge meta={ATTENDANCE_STATUS[status]} />;
}

export function PayrollStatusBadge({ status }: { status: PayrollRunStatus }) {
  return <StatusBadge meta={PAYROLL_STATUS[status]} />;
}

// MARK: 사용 여부
export function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge tone="normal" icon={CircleCheck}>
      사용
    </Badge>
  ) : (
    <Badge tone="inactive" icon={CircleMinus}>
      미사용
    </Badge>
  );
}

export const EMPLOYMENT_TYPE_LABEL = {
  FULL_TIME: "정규직",
  CONTRACT: "계약직",
  PART_TIME: "단시간",
  DISPATCH: "파견",
} as const;
