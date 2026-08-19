"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api/client";
import { approveLeaveRequest, rejectLeaveRequest } from "@/lib/api/leaves";
import { approveOvertime, rejectOvertime } from "@/lib/api/overtimes";

// MARK: - 결재 처리

export interface ApprovalActionState {
  ok?: boolean;
  message?: string;
}

function failure(error: unknown): ApprovalActionState {
  if (error instanceof ApiError) return { ok: false, message: error.message };
  return { ok: false, message: "결재 처리에 실패했습니다" };
}

function revalidate() {
  revalidatePath("/");
  revalidatePath("/approvals");
  revalidatePath("/leaves");
  revalidatePath("/overtimes");
}

export async function approveLeaveAction(id: number): Promise<ApprovalActionState> {
  try {
    await approveLeaveRequest(id);
  } catch (error) {
    return failure(error);
  }
  revalidate();
  return { ok: true };
}

export async function rejectLeaveAction(
  id: number,
  _prev: ApprovalActionState,
  formData: FormData,
): Promise<ApprovalActionState> {
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { ok: false, message: "반려 사유를 입력하세요" };

  try {
    await rejectLeaveRequest(id, reason);
  } catch (error) {
    return failure(error);
  }
  revalidate();
  return { ok: true };
}

export async function approveOvertimeAction(id: number): Promise<ApprovalActionState> {
  try {
    await approveOvertime(id);
  } catch (error) {
    return failure(error);
  }
  revalidate();
  return { ok: true };
}

export async function rejectOvertimeAction(id: number): Promise<ApprovalActionState> {
  try {
    await rejectOvertime(id);
  } catch (error) {
    return failure(error);
  }
  revalidate();
  return { ok: true };
}
