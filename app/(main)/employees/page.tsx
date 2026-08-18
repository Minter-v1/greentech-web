import type { Metadata } from "next";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PageTransition } from "@/components/layout/page-transition";
import { EMPLOYMENT_TYPE_LABEL } from "@/components/ui/badge";
import { Button, TextLink } from "@/components/ui/button";
import { Card, CardBody, EmptyState } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { Table, Td, Th, Thead, Tr } from "@/components/ui/table";
import { searchEmployees } from "@/lib/api/employees";
import { flattenDepartmentTree, getDepartmentTree } from "@/lib/api/org";
import type { EmployeeStatus } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";
import { StatusMenu } from "./status-menu";

export const metadata: Metadata = { title: "사원 · greentech" };

// MARK: - 사원 목록
// 필터는 GET 폼 → 쿼리스트링 → 서버에서 그대로 WAS로 전달

const STATUS_OPTIONS: Array<{ value: EmployeeStatus | ""; label: string }> = [
  { value: "", label: "전체 상태" },
  { value: "ACTIVE", label: "재직" },
  { value: "ON_LEAVE", label: "휴직" },
  { value: "RESIGNED", label: "퇴사" },
];

function single(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function EmployeesPage({ searchParams }: PageProps<"/employees">) {
  const params = await searchParams;
  const keyword = single(params.keyword);
  const status = single(params.status) as EmployeeStatus | "";
  const departmentId = single(params.departmentId);
  const page = Number(single(params.page) || 0);

  const [result, tree] = await Promise.all([
    searchEmployees({
      keyword: keyword || undefined,
      status: status || undefined,
      departmentId: departmentId ? Number(departmentId) : undefined,
      page,
      size: 20,
      sort: "empNo,asc",
    }),
    getDepartmentTree(),
  ]);

  const departments = flattenDepartmentTree(tree);

  return (
    <PageTransition>
      <PageHeader
        eyebrow="사원"
        title="사원 관리"
        description={`총 ${result.totalElements}명`}
      />

      <Card>
        <CardBody className="border-b border-hairline">
          <form className="flex flex-wrap items-end gap-sm">
            <div className="min-w-[220px] flex-1">
              <Input
                name="keyword"
                defaultValue={keyword}
                placeholder="사번 · 성명 · 이메일 검색"
                aria-label="검색어"
              />
            </div>
            <Select
              name="departmentId"
              defaultValue={departmentId}
              aria-label="부서"
              className="w-[180px]"
            >
              <option value="">전체 부서</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {" ".repeat(dept.depth * 2)}
                  {dept.name}
                </option>
              ))}
            </Select>
            <Select name="status" defaultValue={status} aria-label="재직 상태" className="w-[140px]">
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Button type="submit" className="gap-xxs">
              <Search className="size-4" />
              검색
            </Button>
          </form>
        </CardBody>

        {result.content.length === 0 ? (
          <CardBody>
            <EmptyState message="조건에 맞는 사원이 없습니다" />
          </CardBody>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>사번</Th>
                <Th>성명</Th>
                <Th>부서</Th>
                <Th>직위</Th>
                <Th>고용형태</Th>
                <Th>입사일</Th>
                <Th>상태</Th>
              </tr>
            </Thead>
            <tbody>
              {result.content.map((employee) => (
                <Tr key={employee.id}>
                  <Td className="text-caption text-body tabular-nums">{employee.empNo}</Td>
                  <Td>
                    <TextLink
                      href={`/employees/${employee.id}`}
                      className="font-medium text-ink hover:text-link"
                    >
                      {employee.name}
                    </TextLink>
                  </Td>
                  <Td className="text-body">{employee.departmentName ?? "-"}</Td>
                  <Td className="text-body">{employee.positionName ?? "-"}</Td>
                  <Td className="text-body">{EMPLOYMENT_TYPE_LABEL[employee.employmentType]}</Td>
                  <Td className="text-body">{formatDate(employee.hireDate)}</Td>
                  <Td>
                    <StatusMenu
                      employeeId={employee.id}
                      employeeName={employee.name}
                      status={employee.status}
                    />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        hrefFor={(target) => {
          const sp = new URLSearchParams(
            Object.entries({ keyword, status, departmentId }).filter(
              ([, value]) => value !== "",
            ),
          );
          sp.set("page", String(target));
          return `/employees?${sp.toString()}`;
        }}
      />
    </PageTransition>
  );
}
