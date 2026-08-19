"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api/client";
import { confirmPayrollRun, runPayroll } from "@/lib/api/payrolls";

// MARK: - 급여 정산 처리

export interface PayrollActionState {
  ok?: boolean;
  message?: string;
}

function failure(error: unknown, fallback: string): PayrollActionState {
  if (error instanceof ApiError) return { ok: false, message: error.message };
  return { ok: false, message: fallback };
}

export async function runPayrollAction(
  _prev: PayrollActionState,
  formData: FormData,
): Promise<PayrollActionState> {
  const payYearMonth = String(formData.get("payYearMonth") ?? "").trim();
  const payDate = String(formData.get("payDate") ?? "").trim() || undefined;
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(payYearMonth)) {
    return { ok: false, message: "정산월을 선택하세요" };
  }

  try {
    await runPayroll({ payYearMonth, payDate });
  } catch (error) {
    return failure(error, "급여 정산에 실패했습니다");
  }

  revalidatePath("/");
  revalidatePath("/payrolls");
  return { ok: true, message: "급여 정산을 완료했습니다" };
}

export async function confirmPayrollAction(runId: number): Promise<PayrollActionState> {
  try {
    await confirmPayrollRun(runId);
  } catch (error) {
    return failure(error, "급여 확정에 실패했습니다");
  }

  revalidatePath("/");
  revalidatePath("/payrolls");
  return { ok: true, message: "급여를 확정했습니다" };
}
