import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { PageTransition } from "@/components/layout/page-transition";
import {
  EMPLOYMENT_TYPE_LABEL,
  EmployeeStatusBadge,
} from "@/components/ui/badge";
import { TextLink } from "@/components/ui/button";
import { Card, CardBody, EmptyState } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Table, Td, Th, Thead, Tr } from "@/components/ui/table";
import { getMe, hasRole } from "@/lib/api/auth";
import { searchEmployees } from "@/lib/api/employees";
import {
  flattenDepartmentTree,
  getDepartmentTree,
  listPositions,
} from "@/lib/api/org";
import type { EmployeeStatus } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";
import { CreateEmployeeDialog } from "./create-dialog";
import { EmployeeFilters } from "./employee-filters";
import { StatusMenu } from "./status-menu";

export const metadata: Metadata = { title: "사원 · greentech" };

// MARK: - 사원 목록
// 검색 조건은 쿼리스트링으로 유지하고 서버에서 WAS로 전달

const STATUS_OPTIONS: Array<{ value: EmployeeStatus | ""; label: string }> = [
  { value: "", label: "전체 상태" },
  { value: "ACTIVE", label: "재직" },
  { value: "ON_LEAVE", label: "휴직" },
  { value: "RESIGNED", label: "퇴사" },
];

function single(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function EmployeesPage({
  searchParams,
}: PageProps<"/employees">) {
  const params = await searchParams;
  const keyword = single(params.keyword);
  const status = single(params.status) as EmployeeStatus | "";
  const departmentId = single(params.departmentId);
  const page = Number(single(params.page) || 0);
  const me = await getMe();
  const canManage = hasRole(me, "ROLE_ADMIN", "ROLE_HR");

  const [result, tree, positions] = await Promise.all([
    searchEmployees({
      keyword: keyword || undefined,
      status: status || undefined,
      departmentId: departmentId ? Number(departmentId) : undefined,
      page,
      size: 20,
      sort: "empNo,asc",
    }),
    getDepartmentTree(),
    listPositions(true),
  ]);

  const departments = flattenDepartmentTree(tree);

  return (
    <PageTransition>
      <PageHeader
        eyebrow="사원"
        title={canManage ? "사원 관리" : "사원 목록"}
        description={`총 ${result.totalElements}명`}
        action={
          canManage ? (
            <CreateEmployeeDialog
              departments={departments.map((dept) => ({
                id: dept.id,
                label: dept.name,
              }))}
              positions={positions.map((position) => ({
                id: position.id,
                label: position.name,
              }))}
              managers={result.content.map((employee) => ({
                id: employee.id,
                label: `${employee.name} (${employee.empNo})`,
              }))}
            />
          ) : undefined
        }
      />

      <Card>
        <EmployeeFilters
          keyword={keyword}
          departmentId={departmentId}
          status={status}
          departments={[
            { value: "", label: "전체 부서" },
            ...departments.map((dept) => ({
              value: String(dept.id),
              label: dept.name,
              depth: dept.depth,
            })),
          ]}
          statuses={STATUS_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        >
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
                    <Td className="text-caption text-body tabular-nums">
                      {employee.empNo}
                    </Td>
                    <Td>
                      {canManage || employee.id === me.employeeId ? (
                        <TextLink
                          href={`/employees/${employee.id}`}
                          className="font-medium text-ink hover:text-link"
                        >
                          {employee.name}
                        </TextLink>
                      ) : (
                        <span className="font-medium">{employee.name}</span>
                      )}
                    </Td>
                    <Td className="text-body">
                      {employee.departmentName ?? "-"}
                    </Td>
                    <Td className="text-body">
                      {employee.positionName ?? "-"}
                    </Td>
                    <Td className="text-body">
                      {EMPLOYMENT_TYPE_LABEL[employee.employmentType]}
                    </Td>
                    <Td className="text-body">
                      {formatDate(employee.hireDate)}
                    </Td>
                    <Td>
                      {canManage ? (
                        <StatusMenu
                          employeeId={employee.id}
                          employeeName={employee.name}
                          status={employee.status}
                        />
                      ) : (
                        <EmployeeStatusBadge status={employee.status} />
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </EmployeeFilters>
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
