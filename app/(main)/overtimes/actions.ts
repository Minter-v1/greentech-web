"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api/client";
import { createOvertime } from "@/lib/api/overtimes";
import type { OvertimeType } from "@/lib/api/types";

// MARK: - 연장근무 신청

export interface OvertimeFormState {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function createOvertimeAction(
  _prev: OvertimeFormState,
  formData: FormData,
): Promise<OvertimeFormState> {
  const startAt = String(formData.get("startAt") ?? "");
  const endAt = String(formData.get("endAt") ?? "");
  const overtimeType = String(formData.get("overtimeType") ?? "") as OvertimeType;
  const reason = String(formData.get("reason") ?? "").trim();

  if (!startAt || !endAt || !overtimeType) {
    return { ok: false, message: "시작 시각, 종료 시각, 근무 구분은 필수입니다" };
  }
  if (endAt <= startAt) {
    return { ok: false, fieldErrors: { endAt: "종료 시각은 시작 시각보다 늦어야 합니다" } };
  }

  try {
    await createOvertime({
      startAt,
      endAt,
      overtimeType,
      reason: reason || undefined,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message, fieldErrors: error.fieldErrorMap };
    }
    return { ok: false, message: "연장근무 신청에 실패했습니다" };
  }

  revalidatePath("/");
  revalidatePath("/overtimes");
  revalidatePath("/approvals");
  return { ok: true, message: "연장근무를 신청했습니다" };
}
