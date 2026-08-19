"use server";

import { revalidatePath } from "next/cache";
import {
  changeMyPassword,
  createAccount,
  linkAccountEmployee,
  resetAccountPassword,
  updateAccountRoles,
  updateAccountStatus,
} from "@/lib/api/accounts";
import { ApiError } from "@/lib/api/client";

// MARK: - 계정 관리

export interface AccountActionState {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

function toFailure(error: unknown, fallback: string): AccountActionState {
  if (error instanceof ApiError) {
    return { ok: false, message: error.message, fieldErrors: error.fieldErrorMap };
  }
  return { ok: false, message: fallback };
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function createAccountAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const username = text(formData, "username");
  const temporaryPassword = String(formData.get("temporaryPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const employeeId = text(formData, "employeeId");
  const roleCodes = formData.getAll("roleCodes").map(String);

  if (!username || !temporaryPassword || roleCodes.length === 0) {
    return { ok: false, message: "아이디, 임시 비밀번호, 권한은 필수입니다" };
  }
  if (temporaryPassword.length < 10) {
    return { ok: false, fieldErrors: { temporaryPassword: "10자 이상이어야 합니다" } };
  }
  if (temporaryPassword !== confirmPassword) {
    return { ok: false, fieldErrors: { confirmPassword: "임시 비밀번호가 일치하지 않습니다" } };
  }

  try {
    await createAccount({
      username,
      temporaryPassword,
      employeeId: employeeId ? Number(employeeId) : undefined,
      roleCodes,
    });
  } catch (error) {
    return toFailure(error, "계정 발급에 실패했습니다");
  }

  revalidatePath("/accounts");
  return { ok: true, message: `${username} 계정을 발급했습니다` };
}

export async function linkEmployeeAction(
  userId: number,
  employeeId: number | null,
): Promise<AccountActionState> {
  try {
    await linkAccountEmployee(userId, { employeeId });
  } catch (error) {
    return toFailure(error, "사원 연결에 실패했습니다");
  }

  revalidatePath("/accounts");
  return {
    ok: true,
    message: employeeId
      ? "연결했습니다. 해당 계정은 재로그인해야 근태 기능을 쓸 수 있습니다"
      : "연결을 해제했습니다",
  };
}

export async function updateRolesAction(
  userId: number,
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const roleCodes = formData.getAll("roleCodes").map(String);
  if (roleCodes.length === 0) return { ok: false, message: "권한을 하나 이상 선택하세요" };

  try {
    await updateAccountRoles(userId, { roleCodes });
  } catch (error) {
    return toFailure(error, "권한 변경에 실패했습니다");
  }

  revalidatePath("/accounts");
  return { ok: true, message: "권한을 변경했습니다. 해당 사용자는 재로그인해야 합니다" };
}

export async function updateStatusAction(
  userId: number,
  enabled: boolean,
  locked: boolean,
): Promise<AccountActionState> {
  try {
    await updateAccountStatus(userId, { enabled, locked });
  } catch (error) {
    return toFailure(error, "계정 상태 변경에 실패했습니다");
  }

  revalidatePath("/accounts");
  return { ok: true, message: "계정 상태를 변경했습니다" };
}

export async function resetPasswordAction(
  userId: number,
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const temporaryPassword = String(formData.get("temporaryPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (temporaryPassword.length < 10) {
    return { ok: false, fieldErrors: { temporaryPassword: "10자 이상이어야 합니다" } };
  }
  if (temporaryPassword !== confirmPassword) {
    return { ok: false, fieldErrors: { confirmPassword: "임시 비밀번호가 일치하지 않습니다" } };
  }

  try {
    await resetAccountPassword(userId, { temporaryPassword });
  } catch (error) {
    return toFailure(error, "임시 비밀번호 설정에 실패했습니다");
  }

  revalidatePath("/accounts");
  return { ok: true, message: "임시 비밀번호를 설정하고 잠금을 해제했습니다" };
}

export async function changePasswordAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword) {
    return { ok: false, message: "현재 비밀번호와 새 비밀번호를 입력하세요" };
  }
  if (newPassword.length < 10) {
    return { ok: false, fieldErrors: { newPassword: "10자 이상이어야 합니다" } };
  }
  if (newPassword !== confirmPassword) {
    return { ok: false, fieldErrors: { confirmPassword: "새 비밀번호가 일치하지 않습니다" } };
  }

  try {
    await changeMyPassword({ currentPassword, newPassword });
  } catch (error) {
    return toFailure(error, "비밀번호 변경에 실패했습니다");
  }

  return { ok: true, message: "비밀번호를 변경했습니다" };
}
