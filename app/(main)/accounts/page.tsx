import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { PageTransition } from "@/components/layout/page-transition";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, EmptyState } from "@/components/ui/card";
import { Table, Td, Th, Thead, Tr } from "@/components/ui/table";
import { listAccounts, listRoles } from "@/lib/api/accounts";
import { getMe, hasRole } from "@/lib/api/auth";
import { searchEmployees } from "@/lib/api/employees";
import { formatDate } from "@/lib/utils";
import {
  AccountStatusControl,
  ChangePasswordControl,
  CreateAccountDialog,
  LinkEmployeeControl,
  ResetPasswordControl,
  RolesControl,
} from "./account-controls";

export const metadata: Metadata = { title: "계정 · greentech" };

// MARK: - 계정 관리
// 사원이 연결되지 않은 계정은 근태·휴가 등 개인 API 를 쓸 수 없음

const ROLE_LABEL: Record<string, string> = {
  ROLE_ADMIN: "관리자",
  ROLE_HR: "인사",
  ROLE_MANAGER: "관리",
  ROLE_EMPLOYEE: "사원",
};

export default async function AccountsPage() {
  const me = await getMe();
  if (!hasRole(me, "ROLE_ADMIN")) notFound();

  const [accounts, employees, roles] = await Promise.all([
    listAccounts(),
    searchEmployees({ size: 200, sort: "empNo,asc" }),
    listRoles(),
  ]);

  const linkedEmployeeIds = new Set(accounts.flatMap((account) =>
    account.employeeId ? [account.employeeId] : [],
  ));
  const options = employees.content.map((employee) => ({
    id: employee.id,
    label: `${employee.empNo} ${employee.name}${
      employee.departmentName ? ` (${employee.departmentName})` : ""
    }`,
  }));
  const availableOptions = options.filter((employee) => !linkedEmployeeIds.has(employee.id));

  const unlinked = accounts.filter((account) => !account.employeeId).length;

  return (
    <PageTransition>
      <PageHeader
        eyebrow="계정"
        title="계정 관리"
        description={`총 ${accounts.length}개 · 사원 미연결 ${unlinked}개`}
        action={
          <div className="flex items-center gap-xs">
            <ChangePasswordControl />
            <CreateAccountDialog employees={availableOptions} roles={roles} />
          </div>
        }
      />

      <Card>
        <CardHeader
          title="계정"
          description="계정 발급과 권한 변경은 해당 사용자의 재로그인 후 적용됩니다"
        />
        {accounts.length === 0 ? (
          <CardBody>
            <EmptyState message="계정이 없습니다" />
          </CardBody>
        ) : (
          <Table className="min-w-[1070px] table-fixed">
            <Thead>
              <tr>
                <Th className="w-[140px]">아이디</Th>
                <Th className="w-[170px]">연결된 사원</Th>
                <Th className="w-[150px]">권한</Th>
                <Th className="w-[90px]">상태</Th>
                <Th className="w-[140px]">마지막 로그인</Th>
                <Th className="w-[380px] text-center">관리</Th>
              </tr>
            </Thead>
            <tbody>
              {accounts.map((account) => (
                <Tr key={account.id}>
                  <Td className="truncate font-medium">{account.username}</Td>
                  <Td className="truncate text-body">
                    {account.employeeName ?? (
                      <span className="text-mute">미연결</span>
                    )}
                  </Td>
                  <Td className="truncate text-body">
                    {account.roles.map((role) => ROLE_LABEL[role] ?? role).join(", ")}
                  </Td>
                  <Td>
                    {account.locked ? (
                      <Badge tone="critical">잠김</Badge>
                    ) : account.enabled ? (
                      <Badge tone="normal">활성</Badge>
                    ) : (
                      <Badge tone="inactive">비활성</Badge>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap text-body tabular-nums">
                    {formatDate(account.lastLoginAt)}
                  </Td>
                  <Td>
                    <div className="flex min-h-7 flex-nowrap items-center justify-center gap-xxs">
                      <LinkEmployeeControl
                        userId={account.id}
                        username={account.username}
                        employeeId={account.employeeId}
                        employees={options.filter(
                          (employee) =>
                            !linkedEmployeeIds.has(employee.id) || employee.id === account.employeeId,
                        )}
                      />
                      <RolesControl
                        userId={account.id}
                        username={account.username}
                        assignedRoles={account.roles}
                        roles={roles}
                        disabled={account.id === me.userId}
                      />
                      <ResetPasswordControl
                        userId={account.id}
                        username={account.username}
                        disabled={account.id === me.userId}
                      />
                      <AccountStatusControl
                        userId={account.id}
                        username={account.username}
                        enabled={account.enabled}
                        locked={account.locked}
                        disabled={account.id === me.userId}
                      />
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </PageTransition>
  );
}
import { notFound } from "next/navigation";
