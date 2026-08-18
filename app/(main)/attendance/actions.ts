"use server";

import { revalidatePath } from "next/cache";
import { checkIn, checkOut } from "@/lib/api/attendances";
import { ApiError } from "@/lib/api/client";

// MARK: - 출퇴근 액션

export interface CheckState {
  message?: string;
  ok?: boolean;
}

export async function checkInAction(): Promise<CheckState> {
  try {
    await checkIn();
    revalidatePath("/attendance");
    return { ok: true, message: "출근 처리되었습니다" };
  } catch (error) {
    return { ok: false, message: error instanceof ApiError ? error.message : "출근 처리 실패" };
  }
}

export async function checkOutAction(): Promise<CheckState> {
  try {
    await checkOut();
    revalidatePath("/attendance");
    return { ok: true, message: "퇴근 처리되었습니다" };
  } catch (error) {
    return { ok: false, message: error instanceof ApiError ? error.message : "퇴근 처리 실패" };
  }
}
