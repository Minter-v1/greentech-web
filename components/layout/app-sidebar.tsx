"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/shadcn/sidebar";
import { visibleNavItems } from "./nav-items";

// MARK: - 앱 사이드바
// 아이콘 병기 + 접힘 시 아이콘 전용 모드. 활성 표시는 항목 간을 이동하는 단일 인디케이터

interface AppSidebarProps {
  roles: string[];
  displayName: string;
  subtitle: string;
}

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppSidebar({ roles, displayName, subtitle }: AppSidebarProps) {
  const pathname = usePathname();
  const items = visibleNavItems(roles);

  // 메뉴 순서상 아래로 가면 nav-down, 위로 가면 nav-up
  const currentIndex = items.findIndex((item) => isActive(pathname, item.href));

  const menuRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  // state 로 담으면 렌더 캐스케이드가 생겨 DOM 직접 갱신
  useEffect(() => {
    const indicator = indicatorRef.current;
    const menu = menuRef.current;
    if (!indicator || !menu) return;

    const place = () => {
      const target = itemRefs.current[currentIndex];
      indicator.style.setProperty("--indicator-height", target ? `${target.offsetHeight}px` : "0px");
      if (target) indicator.style.setProperty("--indicator-y", `${target.offsetTop}px`);
    };

    place();

    // 첫 배치는 전이 없이
    const frame = requestAnimationFrame(() => {
      indicator.dataset.ready = "true";
    });

    const observer = new ResizeObserver(place);
    observer.observe(menu);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [currentIndex, items.length]);

  return (
    <Sidebar
      collapsible="icon"
      className="border-hairline"
      style={{ viewTransitionName: "app-sidebar" }}
    >
      <SidebarHeader className="h-16 justify-center border-b border-hairline px-sm">
        <Link
          href="/"
          className="flex items-center gap-xs rounded-sm px-xs py-xxs transition-colors hover:bg-canvas-soft-2"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-primary text-on-primary">
            <Leaf className="size-3.5" />
          </span>
          <span className="truncate text-body-md font-medium tracking-tight transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0">
            greentech
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-caption uppercase text-mute">
            메뉴
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu ref={menuRef} className="relative">
              {/* MARK: 활성 인디케이터 - 항목마다 켜고 끄면 튀므로 하나를 이동시킴 */}
              <span
                ref={indicatorRef}
                aria-hidden
                data-ready="false"
                className={cn(
                  "pointer-events-none absolute inset-x-0 top-0 z-0 rounded-md bg-sidebar-accent",
                  "h-(--indicator-height) translate-y-(--indicator-y) opacity-0",
                  "transition-none data-[ready=true]:opacity-100",
                  "data-[ready=true]:transition-[translate,height,opacity]",
                  "data-[ready=true]:duration-300 data-[ready=true]:ease-emphasized",
                )}
              >
                <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-primary" />
              </span>

              {items.map((item, index) => {
                const active = isActive(pathname, item.href);
                const direction =
                  currentIndex < 0 || index > currentIndex ? "nav-down" : "nav-up";
                return (
                  <SidebarMenuItem
                    key={item.href}
                    ref={(node) => {
                      itemRefs.current[index] = node;
                    }}
                    className="z-1"
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className="transition-colors duration-200 data-[active=true]:bg-transparent"
                    >
                      <Link href={item.href} transitionTypes={[direction]}>
                        <item.icon className="transition-transform duration-200 group-hover/menu-item:scale-110" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-hairline">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex min-w-0 flex-col px-xs py-xxs transition-opacity duration-300 group-data-[collapsible=icon]:hidden">
              <span className="truncate text-body-sm font-medium">{displayName}</span>
              <span className="truncate text-caption text-mute">{subtitle}</span>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="로그아웃">
              <Link href="/logout" prefetch={false}>
                <LogOut />
                <span>로그아웃</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
