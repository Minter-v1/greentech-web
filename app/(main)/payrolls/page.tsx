import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { PageTransition } from "@/components/layout/page-transition";
import { PayrollStatusBadge } from "@/components/ui/badge";
import { TextLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState, Stat } from "@/components/ui/card";
import { Table, Td, Th, Thead, Tr } from "@/components/ui/table";
import { orNull } from "@/lib/api/client";
import { listPayrollRuns, listRunPayslips } from "@/lib/api/payrolls";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "급여 · greentech" };

// MARK: - 급여 정산
// 선택된 정산 회차의 명세서 목록을 함께 조회

export default async function PayrollsPage({ searchParams }: PageProps<"/payrolls">) {
  const params = await searchParams;
  const runs = await listPayrollRuns({ size: 12 });

  const requestedRunId = typeof params.runId === "string" ? Number(params.runId) : undefined;
  const selectedRun =
    runs.content.find((run) => run.id === requestedRunId) ?? runs.content[0] ?? null;

  const payslips = selectedRun
    ? ((await orNull(() => listRunPayslips(selectedRun.id))) ?? [])
    : [];

  return (
    <PageTransition>
      <PageHeader
        eyebrow="급여"
        title="급여 정산"
        description={selectedRun ? `${selectedRun.payYearMonth} 정산 기준` : undefined}
      />

      {selectedRun ? (
        <div className="mb-lg grid gap-md sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="대상 인원" value={`${selectedRun.targetCount}명`} />
          <Stat label="지급 합계" value={formatCurrency(selectedRun.totalGross)} />
          <Stat label="공제 합계" value={formatCurrency(selectedRun.totalDeduction)} />
          <Stat
            label="실지급"
            value={formatCurrency(selectedRun.totalNet)}
            hint={selectedRun.payDate ? `지급일 ${formatDate(selectedRun.payDate)}` : undefined}
          />
        </div>
      ) : null}

      <div className="grid gap-md xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader title="정산 회차" description={`총 ${runs.totalElements}건`} />
          {runs.content.length === 0 ? (
            <CardBody>
              <EmptyState message="정산 이력이 없습니다" />
            </CardBody>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>정산월</Th>
                  <Th>인원</Th>
                  <Th>상태</Th>
                </tr>
              </Thead>
              <tbody>
                {runs.content.map((run) => (
                  <Tr
                    key={run.id}
                    className={run.id === selectedRun?.id ? "bg-canvas-soft" : undefined}
                  >
                    <Td>
                      <TextLink
                        href={`/payrolls?runId=${run.id}`}
                        className="font-medium text-ink hover:text-link"
                        aria-current={run.id === selectedRun?.id ? "true" : undefined}
                      >
                        {run.payYearMonth}
                      </TextLink>
                    </Td>
                    <Td className="text-body">{run.targetCount}명</Td>
                    <Td>
                      <PayrollStatusBadge status={run.status} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader
            title="명세서"
            description={selectedRun ? `${selectedRun.payYearMonth} · ${payslips.length}건` : undefined}
          />
          {payslips.length === 0 ? (
            <CardBody>
              <EmptyState message="명세서가 없습니다" />
            </CardBody>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>사번</Th>
                  <Th>성명</Th>
                  <Th>부서</Th>
                  <Th className="text-right">지급</Th>
                  <Th className="text-right">공제</Th>
                  <Th className="text-right">실지급</Th>
                </tr>
              </Thead>
              <tbody>
                {payslips.map((payslip) => (
                  <Tr key={payslip.id}>
                    <Td className="text-caption text-body tabular-nums">{payslip.empNo}</Td>
                    <Td className="font-medium">{payslip.employeeName}</Td>
                    <Td className="text-body">{payslip.departmentName ?? "-"}</Td>
                    <Td className="text-right text-body">{formatCurrency(payslip.grossPay)}</Td>
                    <Td className="text-right text-body">
                      {formatCurrency(payslip.totalDeduction)}
                    </Td>
                    <Td className="text-right font-medium">{formatCurrency(payslip.netPay)}</Td>
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
