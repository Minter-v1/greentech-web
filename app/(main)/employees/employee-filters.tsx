"use client";

import type { FormEvent, ReactNode } from "react";
import { useTransition } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { SelectMenu, type SelectOption } from "@/components/ui/select-menu";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

// MARK: - 사원 목록 필터

export function EmployeeFilters({
  keyword,
  departmentId,
  status,
  departments,
  statuses,
  children,
}: {
  keyword: string;
  departmentId: string;
  status: string;
  departments: SelectOption[];
  statuses: SelectOption[];
  /** 갱신 중 흐려질 결과 영역 */
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const replaceParam = (name: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(name, value);
    else params.delete(name);
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.replace((query ? `/employees?${query}` : "/employees") as Route, {
        scroll: false,
      });
    });
  };

  const submitKeyword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    replaceParam("keyword", String(formData.get("keyword") ?? "").trim());
  };

  return (
    <>
      <form
        onSubmit={submitKeyword}
        aria-busy={pending}
        className="flex flex-wrap items-end gap-sm border-b border-hairline p-lg"
      >
        <div className="min-w-[220px] flex-1">
          <Input
            name="keyword"
            defaultValue={keyword}
            placeholder="사번 · 성명 · 이메일 검색"
            aria-label="검색어"
          />
        </div>
        <div className="w-[180px]">
          <SelectMenu
            key={`department-${departmentId}`}
            name="departmentId"
            ariaLabel="부서"
            defaultValue={departmentId}
            placeholder="전체 부서"
            options={departments}
            onValueChange={(value) => replaceParam("departmentId", value)}
          />
        </div>
        <div className="w-[140px]">
          <SelectMenu
            key={`status-${status}`}
            name="status"
            ariaLabel="재직 상태"
            defaultValue={status}
            placeholder="전체 상태"
            options={statuses}
            onValueChange={(value) => replaceParam("status", value)}
          />
        </div>
        <Button type="submit" disabled={pending} className="gap-xxs">
          {pending ? (
            <Spinner size="sm" className="text-on-primary" />
          ) : (
            <Search className="size-4" />
          )}
          {pending ? "검색 중" : "검색"}
        </Button>
      </form>

      {/* 갱신 중에는 목록만 흐려지고 헤더·필터는 그대로 유지 */}
      <div
        aria-busy={pending}
        className={cn(
          "transition-opacity duration-200 ease-standard",
          pending && "pointer-events-none opacity-45",
        )}
      >
        {children}
      </div>
    </>
  );
}
