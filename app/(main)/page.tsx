import { PageHeader } from "@/components/layout/page-header";
import { PageTransition } from "@/components/layout/page-transition";
import { ApprovalStatusBadge } from "@/components/ui/badge";
import { TextLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState, Stat } from "@/components/ui/card";
import { Table, Td, Th, Thead, Tr } from "@/components/ui/table";
import { getMyAttendance } from "@/lib/api/attendances";
import { getMe } from "@/lib/api/auth";
import { orNull } from "@/lib/api/client";
import { searchEmployees } from "@/lib/api/employees";
import { getMyLeaveBalances, listLeaveRequests } from "@/lib/api/leaves";
import { listOvertimes } from "@/lib/api/overtimes";
import { listPayrollRuns } from "@/lib/api/payrolls";
import { currentYearMonth, formatDate, formatMinutes } from "@/lib/utils";

// MARK: - 대시보드
// 사원 미연결 계정(관리자)도 열람 가능하도록 개인 위젯은 부분 실패 허용

export default async function DashboardPage() {
  const me = await getMe();
  const yearMonth = currentYearMonth();

  const [employees, pendingLeaves, pendingOvertimes, payrollRuns, myBalances, myAttendance] =
    await Promise.all([
      orNull(() => searchEmployees({ status: "ACTIVE", size: 1 })),
      listLeaveRequests({ status: "REQUESTED", size: 5 }),
      listOvertimes({ status: "REQUESTED", size: 5 }),
      listPayrollRuns({ size: 1 }),
      orNull(() => getMyLeaveBalances()),
      orNull(() => getMyAttendance(yearMonth)),
    ]);

  const annual = myBalances?.find((b) => b.leaveTypeName === "연차") ?? myBalances?.[0];
  const latestRun = payrollRuns.content[0];

  return (
    <PageTransition>
      <PageHeader
        eyebrow={yearMonth}
        title={`안녕하세요, ${me.name ?? me.username}님`}
        description="오늘 처리할 결재와 이번 달 현황입니다."
      />

      <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="재직 인원"
          value={employees ? `${employees.totalElements}명` : "-"}
          hint="ACTIVE 상태 기준"
        />
        <Stat
          label="결재 대기"
          value={`${pendingLeaves.totalElements + pendingOvertimes.totalElements}건`}
          hint={`휴가 ${pendingLeaves.totalElements} · 연장 ${pendingOvertimes.totalElements}`}
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
