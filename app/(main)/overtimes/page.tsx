import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { PageTransition } from "@/components/layout/page-transition";
import { ApprovalStatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { Table, Td, Th, Thead, Tr } from "@/components/ui/table";
import { getMe, hasRole } from "@/lib/api/auth";
import { listMyOvertimes, listOvertimes } from "@/lib/api/overtimes";
import type { ApprovalStatus } from "@/lib/api/types";
import { formatDate, formatMinutes, formatTime } from "@/lib/utils";
import { OvertimeRequestDialog } from "./request-dialog";

export const metadata: Metadata = { title: "연장근무 · greentech" };

// MARK: - 연장근무 관리

const OVERTIME_TYPE_LABEL = {
  EXTENDED: "연장",
  NIGHT: "야간",
  HOLIDAY: "휴일",
} as const;

const STATUS_TABS: Array<{ value: ApprovalStatus | ""; label: string }> = [
  { value: "", label: "전체" },
  { value: "REQUESTED", label: "결재 대기" },
  { value: "APPROVED", label: "승인" },
  { value: "REJECTED", label: "반려" },
  { value: "CANCELED", label: "취소" },
];

export default async function OvertimesPage({ searchParams }: PageProps<"/overtimes">) {
  const params = await searchParams;
  const status = (typeof params.status === "string" ? params.status : "") as ApprovalStatus | "";
  const me = await getMe();
  const canApprove = hasRole(me, "ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER");

  const requests = canApprove
    ? await listOvertimes({ status: status || undefined, size: 30 })
    : await listMyOvertimes({ size: 30 });

  return (
    <PageTransition>
      <PageHeader
        eyebrow="연장근무"
        title={canApprove ? "연장근무 관리" : "내 연장근무"}
        description={`신청 ${requests.totalElements}건`}
        action={
          <div className="flex items-center gap-xs">
            {canApprove ? <LinkButton href="/approvals">결재 처리</LinkButton> : null}
            <OvertimeRequestDialog />
          </div>
        }
      />

      <Card>
        <CardHeader title="신청 목록" />
        {canApprove ? (
          <CardBody className="border-b border-hairline py-sm">
            <PillTabs
              label="결재 상태 필터"
              tabs={STATUS_TABS}
              active={status}
              hrefFor={(value) => (value ? `/overtimes?status=${value}` : "/overtimes")}
            />
          </CardBody>
        ) : null}

        {requests.content.length === 0 ? (
          <CardBody>
            <EmptyState message="조건에 맞는 연장근무 신청이 없습니다" />
          </CardBody>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>사원</Th>
                <Th>근무일</Th>
                <Th>시간</Th>
                <Th>구분</Th>
                <Th>사유</Th>
                <Th>상태</Th>
              </tr>
            </Thead>
            <tbody>
              {requests.content.map((request) => (
                <Tr key={request.id}>
                  <Td className="font-medium">{request.employeeName}</Td>
                  <Td>{formatDate(request.workDate)}</Td>
                  <Td className="text-body">
                    <span className="text-caption">
                      {formatTime(request.startAt)}~{formatTime(request.endAt)}
                    </span>
                    <span className="ml-xs">{formatMinutes(request.minutes)}</span>
                  </Td>
                  <Td className="text-body">{OVERTIME_TYPE_LABEL[request.overtimeType]}</Td>
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
