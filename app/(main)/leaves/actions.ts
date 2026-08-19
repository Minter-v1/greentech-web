"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api/client";
import { createLeaveRequest } from "@/lib/api/leaves";

// MARK: - 휴가 신청

export interface LeaveFormState {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function createLeaveRequestAction(
  _prev: LeaveFormState,
  formData: FormData,
): Promise<LeaveFormState> {
  const leaveTypeId = Number(formData.get("leaveTypeId"));
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const halfDay = formData.get("halfDay") === "on";
  const reason = String(formData.get("reason") ?? "").trim();

  if (!leaveTypeId || !startDate || !endDate) {
    return { ok: false, message: "휴가 종류와 기간은 필수입니다" };
  }
  if (endDate < startDate) {
    return { ok: false, fieldErrors: { endDate: "종료일이 시작일보다 빠릅니다" } };
  }
  if (halfDay && startDate !== endDate) {
    return { ok: false, fieldErrors: { endDate: "반차는 시작일과 종료일이 같아야 합니다" } };
  }

  try {
    await createLeaveRequest({
      leaveTypeId,
      startDate,
      endDate,
      halfDay,
      reason: reason || undefined,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message, fieldErrors: error.fieldErrorMap };
    }
    return { ok: false, message: "휴가 신청에 실패했습니다" };
  }

  revalidatePath("/leaves");
  return { ok: true, message: "휴가를 신청했습니다" };
}
