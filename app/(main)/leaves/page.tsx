import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { PageTransition } from "@/components/layout/page-transition";
import { ApprovalStatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState, Stat } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { Table, Td, Th, Thead, Tr } from "@/components/ui/table";
import { orNull } from "@/lib/api/client";
import { getMe, hasRole } from "@/lib/api/auth";
import {
  getMyLeaveBalances,
  listLeaveRequests,
  listLeaveTypes,
  listMyLeaveRequests,
} from "@/lib/api/leaves";
import type { ApprovalStatus } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";
import { LeaveRequestDialog } from "./request-dialog";

export const metadata: Metadata = { title: "휴가 · greentech" };

// MARK: - 휴가 관리

const STATUS_TABS: Array<{ value: ApprovalStatus | ""; label: string }> = [
  { value: "", label: "전체" },
  { value: "REQUESTED", label: "결재 대기" },
  { value: "APPROVED", label: "승인" },
  { value: "REJECTED", label: "반려" },
  { value: "CANCELED", label: "취소" },
];

export default async function LeavesPage({ searchParams }: PageProps<"/leaves">) {
  const params = await searchParams;
  const status = (typeof params.status === "string" ? params.status : "") as ApprovalStatus | "";
  const me = await getMe();
  const canApprove = hasRole(me, "ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER");

  const [requests, balances, leaveTypes] = await Promise.all([
    canApprove
      ? listLeaveRequests({ status: status || undefined, size: 30 })
      : listMyLeaveRequests({ size: 30 }),
    orNull(() => getMyLeaveBalances()),
    listLeaveTypes(),
  ]);

  return (
    <PageTransition>
      <PageHeader
        eyebrow="휴가"
        title={canApprove ? "휴가 관리" : "내 휴가"}
        description={`신청 ${requests.totalElements}건`}
        action={
          <div className="flex items-center gap-xs">
            {canApprove ? <LinkButton href="/approvals">결재 처리</LinkButton> : null}
            <LeaveRequestDialog leaveTypes={leaveTypes} />
          </div>
        }
      />

      {balances && balances.length > 0 ? (
        <div className="mb-lg grid gap-md sm:grid-cols-2 xl:grid-cols-4">
          {balances.map((balance) => (
            <Stat
              key={balance.id}
              label={balance.leaveTypeName}
              value={`${balance.remainingDays}일`}
              hint={`부여 ${balance.grantedDays} · 사용 ${balance.usedDays}`}
            />
          ))}
        </div>
      ) : null}

      <Card>
        <CardHeader title="신청 목록" />
        {canApprove ? (
          <CardBody className="border-b border-hairline py-sm">
            <PillTabs
              label="결재 상태 필터"
              tabs={STATUS_TABS}
              active={status}
              hrefFor={(value) => (value ? `/leaves?status=${value}` : "/leaves")}
            />
          </CardBody>
        ) : null}

        {requests.content.length === 0 ? (
          <CardBody>
            <EmptyState message="조건에 맞는 휴가 신청이 없습니다" />
          </CardBody>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>사원</Th>
                <Th>휴가 종류</Th>
                <Th>기간</Th>
                <Th>일수</Th>
                <Th>사유</Th>
                <Th>상태</Th>
              </tr>
            </Thead>
            <tbody>
              {requests.content.map((request) => (
                <Tr key={request.id}>
                  <Td className="font-medium">{request.employeeName}</Td>
                  <Td className="text-body">
                    {request.leaveTypeName}
                    {request.halfDay ? " (반차)" : ""}
                  </Td>
                  <Td className="text-body">
                    {formatDate(request.startDate)} ~ {formatDate(request.endDate)}
                  </Td>
                  <Td>{request.days}일</Td>
                  <Td className="max-w-[240px] truncate text-body">{request.reason ?? "-"}</Td>
                  <Td>
                    <ApprovalStatusBadge status={request.status} />
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
