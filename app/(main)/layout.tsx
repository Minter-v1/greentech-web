import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/shadcn/sidebar";
import { getMe } from "@/lib/api/auth";

// MARK: - 앱 셸
// 접힘 상태는 shadcn 사이드바가 쿠키로 유지. 콘텐츠 폭은 페이지 컨테이너 상한까지

export default async function MainLayout({ children }: LayoutProps<"/">) {
  const me = await getMe();
  const subtitle =
    [me.departmentName, me.positionName].filter(Boolean).join(" · ") || me.roles.join(", ");

  return (
    <SidebarProvider>
      <AppSidebar roles={me.roles} displayName={me.name ?? me.username} subtitle={subtitle} />

      <SidebarInset className="bg-canvas-soft">
        <header
          className="sticky top-0 z-10 flex h-16 items-center gap-sm border-b border-hairline bg-canvas px-lg"
          style={{ viewTransitionName: "app-header" }}
        >
          <SidebarTrigger className="-ml-1 text-body transition-colors hover:text-ink" />
          <span className="text-caption uppercase text-mute">인사관리시스템</span>
        </header>

        <div className="mx-auto w-full max-w-page flex-1 px-lg py-xl">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
