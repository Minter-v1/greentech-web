import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PageTransition } from "@/components/layout/page-transition";
import { LinkButton } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState, Stat } from "@/components/ui/card";
import { Table, Td, Th, Thead, Tr } from "@/components/ui/table";
import { ApiError } from "@/lib/api/client";
import { getPayslip } from "@/lib/api/payrolls";
import { formatCurrency, formatMinutes } from "@/lib/utils";

export const metadata: Metadata = { title: "급여명세서 · greentech" };

// MARK: - 급여명세서 상세

export default async function PayslipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payslipId = Number(id);
  if (!Number.isInteger(payslipId)) notFound();

  let payslip;
  try {
    payslip = await getPayslip(payslipId);
  } catch (error) {
    if (error instanceof ApiError) notFound();
    throw error;
  }

  const earnings = payslip.items.filter((item) => item.itemType === "EARNING");
  const deductions = payslip.items.filter((item) => item.itemType === "DEDUCTION");

  return (
    <PageTransition>
      <PageHeader
        eyebrow={payslip.payYearMonth}
        title={`${payslip.employeeName} 급여명세서`}
        description={[payslip.departmentName, payslip.positionName].filter(Boolean).join(" · ")}
        action={<LinkButton href="/payrolls">목록으로</LinkButton>}
      />

      <div className="mb-lg grid gap-md sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="근무일" value={`${payslip.workDays}일`} />
        <Stat label="연장근무" value={formatMinutes(payslip.overtimeMinutes)} />
        <Stat label="지급 합계" value={formatCurrency(payslip.grossPay)} />
        <Stat label="실지급" value={formatCurrency(payslip.netPay)} hint={`공제 ${formatCurrency(payslip.totalDeduction)}`} />
      </div>

      <div className="grid gap-md xl:grid-cols-2">
        <Card>
          <CardHeader title="지급 항목" />
          {earnings.length === 0 ? (
            <CardBody><EmptyState message="지급 항목이 없습니다" /></CardBody>
          ) : (
            <Table>
              <Thead><tr><Th>항목</Th><Th>비고</Th><Th className="text-right">금액</Th></tr></Thead>
              <tbody>
                {earnings.map((item) => (
                  <Tr key={item.itemCode}>
                    <Td className="font-medium">{item.itemName}</Td>
                    <Td className="text-body">{item.note ?? "-"}</Td>
                    <Td className="text-right">{formatCurrency(item.amount)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="공제 항목" />
          {deductions.length === 0 ? (
            <CardBody><EmptyState message="공제 항목이 없습니다" /></CardBody>
          ) : (
            <Table>
              <Thead><tr><Th>항목</Th><Th>비고</Th><Th className="text-right">금액</Th></tr></Thead>
              <tbody>
                {deductions.map((item) => (
                  <Tr key={item.itemCode}>
                    <Td className="font-medium">{item.itemName}</Td>
                    <Td className="text-body">{item.note ?? "-"}</Td>
                    <Td className="text-right">{formatCurrency(item.amount)}</Td>
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
