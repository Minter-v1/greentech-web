import {
  Building2,
  CalendarClock,
  CalendarDays,
  LayoutDashboard,
  Moon,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

// MARK: - 사이드바 내비게이션 정의

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** 해당 권한 보유자만 노출. 미지정 시 전원 노출 */
  roles?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/employees", label: "사원", icon: Users },
  { href: "/organization", label: "조직", icon: Building2 },
  { href: "/attendance", label: "근태", icon: CalendarClock },
  { href: "/leaves", label: "휴가", icon: CalendarDays },
  { href: "/overtimes", label: "연장근무", icon: Moon },
  { href: "/payrolls", label: "급여", icon: Wallet },
];

export function visibleNavItems(roles: string[]): NavItem[] {
  return NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.some((role) => roles.includes(role)),
  );
}
