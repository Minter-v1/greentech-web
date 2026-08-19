import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { PageTransition } from "@/components/layout/page-transition";
import { PayrollStatusBadge } from "@/components/ui/badge";
import { TextLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState, Stat } from "@/components/ui/card";
import { Table, Td, Th, Thead, Tr } from "@/components/ui/table";
import { getMe, hasRole } from "@/lib/api/auth";
import { orNull } from "@/lib/api/client";
import { listMyPayslips, listPayrollRuns, listRunPayslips } from "@/lib/api/payrolls";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ConfirmPayrollButton, RunPayrollDialog } from "./payroll-controls";

export const metadata: Metadata = { title: "급여 · greentech" };

// MARK: - 급여

async function MyPayslips() {
  const payslips = await listMyPayslips();

  return (
    <PageTransition>
      <PageHeader
        eyebrow="급여"
        title="내 급여명세서"
        description={`확인 가능한 명세서 ${payslips.length}건`}
      />
      <Card>
        <CardHeader title="급여명세서" />
        {payslips.length === 0 ? (
          <CardBody>
            <EmptyState message="확인 가능한 급여명세서가 없습니다" />
          </CardBody>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>정산월</Th>
                <Th className="text-right">지급</Th>
                <Th className="text-right">공제</Th>
                <Th className="text-right">실지급</Th>
                <Th className="w-20 text-center">상세</Th>
              </tr>
            </Thead>
            <tbody>
              {payslips.map((payslip) => (
                <Tr key={payslip.id}>
                  <Td className="font-medium">{payslip.payYearMonth}</Td>
                  <Td className="text-right text-body">{formatCurrency(payslip.grossPay)}</Td>
                  <Td className="text-right text-body">
                    {formatCurrency(payslip.totalDeduction)}
                  </Td>
                  <Td className="text-right font-medium">{formatCurrency(payslip.netPay)}</Td>
                  <Td className="text-center">
                    <TextLink href={`/payrolls/payslips/${payslip.id}`}>보기</TextLink>
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

async function PayrollManagement({ runId }: { runId?: number }) {
  const runs = await listPayrollRuns({ size: 12 });
  const selectedRun = runs.content.find((run) => run.id === runId) ?? runs.content[0] ?? null;
  const payslips = selectedRun
    ? ((await orNull(() => listRunPayslips(selectedRun.id))) ?? [])
    : [];

  return (
    <PageTransition>
      <PageHeader
        eyebrow="급여"
        title="급여 정산"
        description={selectedRun ? `${selectedRun.payYearMonth} 정산 기준` : "정산 회차를 생성하세요"}
        action={<RunPayrollDialog />}
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
                    <Td><PayrollStatusBadge status={run.status} /></Td>
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
            action={
              selectedRun?.status === "CALCULATED" ? (
                <ConfirmPayrollButton runId={selectedRun.id} />
              ) : undefined
            }
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
                  <Th className="w-16 text-center">상세</Th>
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
                    <Td className="text-center">
                      <TextLink href={`/payrolls/payslips/${payslip.id}`}>보기</TextLink>
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

export default async function PayrollsPage({ searchParams }: PageProps<"/payrolls">) {
  const me = await getMe();
  if (!hasRole(me, "ROLE_ADMIN", "ROLE_HR")) return <MyPayslips />;

  const params = await searchParams;
  const runId = typeof params.runId === "string" ? Number(params.runId) : undefined;
  return <PayrollManagement runId={Number.isInteger(runId) ? runId : undefined} />;
}
