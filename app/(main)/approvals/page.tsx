import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardBody, CardHeader, EmptyState, Stat } from "@/components/ui/card";
import { Table, Td, Th, Thead, Tr } from "@/components/ui/table";
import { getMe, hasRole } from "@/lib/api/auth";
import { listLeaveRequests } from "@/lib/api/leaves";
import { listOvertimes } from "@/lib/api/overtimes";
import { formatDate, formatMinutes, formatTime } from "@/lib/utils";
import { LeaveApprovalControls, OvertimeApprovalControls } from "./approval-controls";

export const metadata: Metadata = { title: "결재 · greentech" };

// MARK: - 통합 결재함

const OVERTIME_TYPE_LABEL = {
  EXTENDED: "연장",
  NIGHT: "야간",
  HOLIDAY: "휴일",
} as const;

export default async function ApprovalsPage() {
  const me = await getMe();
  if (!hasRole(me, "ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER")) notFound();

  const [leaves, overtimes] = await Promise.all([
    listLeaveRequests({ status: "REQUESTED", size: 50, sort: "id,asc" }),
    listOvertimes({ status: "REQUESTED", size: 50, sort: "id,asc" }),
  ]);
  const total = leaves.totalElements + overtimes.totalElements;

  return (
    <PageTransition>
      <PageHeader
        eyebrow="결재"
        title="결재 승인"
        description={`처리할 신청 ${total}건`}
      />

      <div className="mb-lg grid gap-md sm:grid-cols-3">
        <Stat label="전체 대기" value={`${total}건`} />
        <Stat label="휴가" value={`${leaves.totalElements}건`} />
        <Stat label="연장근무" value={`${overtimes.totalElements}건`} />
      </div>

      <div className="grid gap-lg">
        <Card>
          <CardHeader title="휴가 결재" description="신청일 순으로 표시합니다" />
          {leaves.content.length === 0 ? (
            <CardBody>
              <EmptyState message="결재 대기 중인 휴가 신청이 없습니다" />
            </CardBody>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>사원</Th>
                  <Th>휴가</Th>
                  <Th>기간</Th>
                  <Th>사유</Th>
                  <Th className="w-40 text-center">처리</Th>
                </tr>
              </Thead>
              <tbody>
                {leaves.content.map((request) => (
                  <Tr key={request.id}>
                    <Td className="font-medium">{request.employeeName}</Td>
                    <Td className="text-body">
                      {request.leaveTypeName} · {request.days}일{request.halfDay ? " (반차)" : ""}
                    </Td>
                    <Td className="text-body">
                      {formatDate(request.startDate)} ~ {formatDate(request.endDate)}
                    </Td>
                    <Td className="max-w-[240px] truncate text-body">{request.reason ?? "-"}</Td>
                    <Td>
                      <LeaveApprovalControls id={request.id} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="연장근무 결재" description="신청일 순으로 표시합니다" />
          {overtimes.content.length === 0 ? (
            <CardBody>
              <EmptyState message="결재 대기 중인 연장근무 신청이 없습니다" />
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
                  <Th className="w-40 text-center">처리</Th>
                </tr>
              </Thead>
              <tbody>
                {overtimes.content.map((request) => (
                  <Tr key={request.id}>
                    <Td className="font-medium">{request.employeeName}</Td>
                    <Td>{formatDate(request.workDate)}</Td>
                    <Td className="text-body">
                      {formatTime(request.startAt)}~{formatTime(request.endAt)} · {formatMinutes(request.minutes)}
                    </Td>
                    <Td className="text-body">{OVERTIME_TYPE_LABEL[request.overtimeType]}</Td>
                    <Td className="max-w-[220px] truncate text-body">{request.reason ?? "-"}</Td>
                    <Td>
                      <OvertimeApprovalControls id={request.id} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </PageTransition>
  );
}
