import { DashboardHero } from "@/components/dashboard-hero";
import { PageTransition } from "@/components/layout/page-transition";
import { ApprovalStatusBadge } from "@/components/ui/badge";
import { TextLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState, Stat } from "@/components/ui/card";
import { Table, Td, Th, Thead, Tr } from "@/components/ui/table";
import { getMyAttendance } from "@/lib/api/attendances";
import { getMe, hasRole } from "@/lib/api/auth";
import { orNull } from "@/lib/api/client";
import { searchEmployees } from "@/lib/api/employees";
import { getMyLeaveBalances, listLeaveRequests } from "@/lib/api/leaves";
import { listOvertimes } from "@/lib/api/overtimes";
import { listPayrollRuns } from "@/lib/api/payrolls";
import { currentYearMonth, formatDate, formatMinutes } from "@/lib/utils";

// MARK: - 대시보드
// 역할 제한 위젯과 개인 위젯 실패가 대시보드 전체를 막지 않도록 분리

export default async function DashboardPage() {
  const me = await getMe();
  const yearMonth = currentYearMonth();
  const canApprove = hasRole(me, "ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER");
  const canManagePayroll = hasRole(me, "ROLE_ADMIN", "ROLE_HR");

  const [employees, pendingLeaves, pendingOvertimes, payrollRuns, myBalances, myAttendance] =
    await Promise.all([
      orNull(() => searchEmployees({ status: "ACTIVE", size: 1 })),
      canApprove
        ? listLeaveRequests({ status: "REQUESTED", size: 5 })
        : Promise.resolve(null),
      canApprove
        ? listOvertimes({ status: "REQUESTED", size: 5 })
        : Promise.resolve(null),
      canManagePayroll ? listPayrollRuns({ size: 1 }) : Promise.resolve(null),
      orNull(() => getMyLeaveBalances()),
      orNull(() => getMyAttendance(yearMonth)),
    ]);

  const annual = myBalances?.find((b) => b.leaveTypeName === "연차") ?? myBalances?.[0];
  const pendingLeaveCount = pendingLeaves?.totalElements ?? 0;
  const pendingOvertimeCount = pendingOvertimes?.totalElements ?? 0;
  const latestRun = payrollRuns?.content[0];

  return (
    <PageTransition>
      <DashboardHero displayName={me.name ?? me.username} canApprove={canApprove} />

      <div className="mb-md mt-xl flex items-end justify-between gap-md">
        <div>
          <p className="text-caption font-medium tracking-wide text-mute uppercase">{yearMonth}</p>
          <h2 className="mt-xxs text-display-sm">오늘의 업무</h2>
        </div>
        <p className="hidden text-body-sm text-mute sm:block">
          {canApprove ? "처리할 결재와 이번 달 현황" : "이번 달 개인 근무 현황"}
        </p>
      </div>

      <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="재직 인원"
          value={employees ? `${employees.totalElements}명` : "-"}
          hint="ACTIVE 상태 기준"
        />
        <Stat
          label="결재 대기"
          value={canApprove ? `${pendingLeaveCount + pendingOvertimeCount}건` : "-"}
          hint={
            canApprove
              ? `휴가 ${pendingLeaveCount} · 연장 ${pendingOvertimeCount}`
              : "결재 권한 없음"
          }
        />
        <Stat
          label="내 연차 잔여"
          value={annual ? `${annual.remainingDays}일` : "-"}
          hint={annual ? `부여 ${annual.grantedDays} · 사용 ${annual.usedDays}` : "사원 미연결 계정"}
        />
        <Stat
          label="이번 달 근무"
          value={myAttendance ? `${myAttendance.workedDays}일` : "-"}
          hint={
            myAttendance
              ? `연장 ${formatMinutes(myAttendance.totalOvertimeMinutes)}`
              : "사원 미연결 계정"
          }
        />
      </div>

      {canApprove && pendingLeaves && pendingOvertimes ? (
        <div className="mt-lg grid gap-md xl:grid-cols-2">
          <Card>
            <CardHeader
              title="휴가 결재 대기"
              action={
                <TextLink href="/leaves" className="text-body-sm">
                  전체 보기
                </TextLink>
              }
            />
            {pendingLeaves.content.length === 0 ? (
              <CardBody>
                <EmptyState message="대기 중인 휴가 신청이 없습니다" />
              </CardBody>
            ) : (
              <Table>
                <Thead>
                  <tr>
                    <Th>사원</Th>
                    <Th>휴가</Th>
                    <Th>기간</Th>
                    <Th>일수</Th>
                  </tr>
                </Thead>
                <tbody>
                  {pendingLeaves.content.map((leave) => (
                    <Tr key={leave.id}>
                      <Td className="font-medium">{leave.employeeName}</Td>
                      <Td>{leave.leaveTypeName}</Td>
                      <Td className="text-body">
                        {formatDate(leave.startDate)} ~ {formatDate(leave.endDate)}
                      </Td>
                      <Td>{leave.days}일</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          <Card>
            <CardHeader
              title="연장근무 결재 대기"
              action={
                <TextLink href="/overtimes" className="text-body-sm">
                  전체 보기
                </TextLink>
              }
            />
            {pendingOvertimes.content.length === 0 ? (
              <CardBody>
                <EmptyState message="대기 중인 연장근무 신청이 없습니다" />
              </CardBody>
            ) : (
              <Table>
                <Thead>
                  <tr>
                    <Th>사원</Th>
                    <Th>근무일</Th>
                    <Th>시간</Th>
                    <Th>상태</Th>
                  </tr>
                </Thead>
                <tbody>
                  {pendingOvertimes.content.map((overtime) => (
                    <Tr key={overtime.id}>
                      <Td className="font-medium">{overtime.employeeName}</Td>
                      <Td>{formatDate(overtime.workDate)}</Td>
                      <Td>{formatMinutes(overtime.minutes)}</Td>
                      <Td>
                        <ApprovalStatusBadge status={overtime.status} />
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </div>
      ) : null}

      {latestRun ? (
        <Card className="mt-lg">
          <CardHeader
            title="최근 급여 정산"
            description={`${latestRun.payYearMonth} · 대상 ${latestRun.targetCount}명`}
            action={
              <TextLink href="/payrolls" className="text-body-sm">
                급여 관리
              </TextLink>
            }
          />
          <CardBody className="grid gap-md sm:grid-cols-3">
            <div className="flex flex-col gap-xxs">
              <span className="text-caption uppercase text-mute">지급 합계</span>
              <span className="text-display-sm">
                {latestRun.totalGross.toLocaleString("ko-KR")}원
              </span>
            </div>
            <div className="flex flex-col gap-xxs">
              <span className="text-caption uppercase text-mute">공제 합계</span>
              <span className="text-display-sm">
                {latestRun.totalDeduction.toLocaleString("ko-KR")}원
              </span>
            </div>
            <div className="flex flex-col gap-xxs">
              <span className="text-caption uppercase text-mute">실지급</span>
              <span className="text-display-sm">
                {latestRun.totalNet.toLocaleString("ko-KR")}원
              </span>
            </div>
          </CardBody>
        </Card>
      ) : null}
    </PageTransition>
  );
}
