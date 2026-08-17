import { apiFetch } from "./client";
import type {
  PageParams,
  PageResult,
  PayrollRunRes,
  PayslipRes,
  PayslipSummaryRes,
} from "./types";

// MARK: - 급여

export function listPayrollRuns(params: PageParams = {}) {
  const { page = 0, size = 20, sort } = params;
  return apiFetch<PageResult<PayrollRunRes>>("/api/v1/payrolls/runs", {
    query: { page, size, sort },
  });
}

export function getPayrollRun(runId: number) {
  return apiFetch<PayrollRunRes>(`/api/v1/payrolls/runs/${runId}`);
}

export function listRunPayslips(runId: number) {
  return apiFetch<PayslipSummaryRes[]>(`/api/v1/payrolls/runs/${runId}/payslips`);
}

export function listMyPayslips() {
  return apiFetch<PayslipSummaryRes[]>("/api/v1/payrolls/payslips/me");
}

export function getPayslip(payslipId: number) {
  return apiFetch<PayslipRes>(`/api/v1/payrolls/payslips/${payslipId}`);
}

export function runPayroll(body: { payYearMonth: string; payDate?: string }) {
  return apiFetch<PayrollRunRes>("/api/v1/payrolls/runs", { method: "POST", body });
}

export function confirmPayrollRun(runId: number) {
  return apiFetch<PayrollRunRes>(`/api/v1/payrolls/runs/${runId}/confirm`, { method: "POST" });
}
