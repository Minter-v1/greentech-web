"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api/client";
import { getEmployee, resignEmployee, updateEmployee } from "@/lib/api/employees";
import type { EmployeeStatus } from "@/lib/api/types";

// MARK: - 사원 상태 변경

export interface StatusActionState {
  ok?: boolean;
  message?: string;
}

function toFailure(error: unknown, fallback: string): StatusActionState {
  if (error instanceof ApiError) return { ok: false, message: error.message };
  return { ok: false, message: fallback };
}

const LABEL: Record<EmployeeStatus, string> = {
  ACTIVE: "재직",
  ON_LEAVE: "휴직",
  RESIGNED: "퇴사",
};

/**
 * 재직 ⇄ 휴직 전환.
 * NOTE: WAS의 update는 전체 덮어쓰기라 현재 상세를 읽어 병합해야 다른 필드가 지워지지 않음
 */
export async function changeStatusAction(
  employeeId: number,
  status: Exclude<EmployeeStatus, "RESIGNED">,
): Promise<StatusActionState> {
  try {
    const current = await getEmployee(employeeId);
    await updateEmployee(employeeId, {
      name: current.name,
      nameEn: current.nameEn,
      birthDate: current.birthDate,
      gender: current.gender,
      email: current.email,
      departmentId: current.departmentId,
      jobPositionId: current.jobPositionId,
      managerId: current.managerId,
      employmentType: current.employmentType,
      status,
    });
  } catch (error) {
    return toFailure(error, "상태 변경에 실패했습니다");
  }

  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
  return { ok: true, message: `${LABEL[status]} 상태로 변경했습니다` };
}

/** 퇴사 처리. 퇴사일과 사유를 받아 RESIGN 이력까지 남김 */
export async function resignEmployeeAction(
  employeeId: number,
  resignDate: string,
  reason?: string,
): Promise<StatusActionState> {
  if (!resignDate) return { ok: false, message: "퇴사일을 입력하세요" };

  try {
    await resignEmployee(employeeId, { resignDate, reason: reason || undefined });
  } catch (error) {
    return toFailure(error, "퇴사 처리에 실패했습니다");
  }

  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
  return { ok: true, message: "퇴사 처리했습니다" };
}
