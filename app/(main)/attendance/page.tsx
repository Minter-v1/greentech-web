import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { PageTransition } from "@/components/layout/page-transition";
import { AttendanceStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState, Stat } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { Table, Td, Th, Thead, Tr } from "@/components/ui/table";
import { getMyAttendance } from "@/lib/api/attendances";
import { orNull } from "@/lib/api/client";
import { currentYearMonth, formatDate, formatMinutes, formatTime } from "@/lib/utils";
import { CheckButtons } from "./check-buttons";

export const metadata: Metadata = { title: "근태 · greentech" };

// MARK: - 내 근태
// 사원 미연결 계정은 조회 불가하므로 안내 문구로 대체

export default async function AttendancePage({ searchParams }: PageProps<"/attendance"> ) {
  const params = await searchParams;
  const yearMonth =
    typeof params.yearMonth === "string" && params.yearMonth
      ? params.yearMonth
      : currentYearMonth();

  const monthly = await orNull(() => getMyAttendance(yearMonth));

  return (
    <PageTransition>
      <PageHeader
        eyebrow="근태"
        title="내 근태"
        description={`${yearMonth} 출퇴근 기록`}
        action={<CheckButtons />}
      />

      <Card className="mb-lg">
        <CardBody>
          <form className="flex items-end gap-sm">
            <Input
              type="month"
              name="yearMonth"
              defaultValue={yearMonth}
              aria-label="조회월"
              className="w-[180px]"
            />
            <Button type="submit">조회</Button>
          </form>
        </CardBody>
      </Card>

      {!monthly ? (
        <EmptyState message="사원 정보가 연결되지 않은 계정입니다. 개인 근태는 사원 계정으로 조회하세요" />
      ) : (
        <>
          <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="출근" value={`${monthly.workedDays}일`} />
            <Stat label="지각 · 결근" value={`${monthly.lateDays} · ${monthly.absentDays}`} />
            <Stat label="정규 근무" value={formatMinutes(monthly.totalWorkMinutes)} />
            <Stat
              label="연장 · 야간"
              value={formatMinutes(monthly.totalOvertimeMinutes)}
              hint={`야간 ${formatMinutes(monthly.totalNightMinutes)}`}
            />
          </div>

          <Card className="mt-lg">
            <CardHeader title="일별 기록" description={`${monthly.records.length}건`} />
            {monthly.records.length === 0 ? (
              <CardBody>
                <EmptyState message="해당 월의 기록이 없습니다" />
              </CardBody>
            ) : (
              <Table>
                <Thead>
                  <tr>
                    <Th>근무일</Th>
                    <Th>출근</Th>
                    <Th>퇴근</Th>
                    <Th>정규</Th>
                    <Th>연장</Th>
                    <Th>상태</Th>
                    <Th>비고</Th>
                  </tr>
                </Thead>
                <tbody>
                  {monthly.records.map((record) => (
                    <Tr key={record.id}>
                      <Td>{formatDate(record.workDate)}</Td>
                      <Td className="text-caption tabular-nums">{formatTime(record.checkInAt)}</Td>
                      <Td className="text-caption tabular-nums">{formatTime(record.checkOutAt)}</Td>
                      <Td className="text-body">{formatMinutes(record.workMinutes)}</Td>
                      <Td className="text-body">{formatMinutes(record.overtimeMinutes)}</Td>
                      <Td>
                        <AttendanceStatusBadge status={record.status} />
                      </Td>
                      <Td className="text-body">{record.note ?? "-"}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </>
      )}
    </PageTransition>
  );
}
