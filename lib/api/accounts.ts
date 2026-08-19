import { apiFetch } from "./client";
import type {
  AccountCreateReq,
  AccountEmployeeLinkReq,
  AccountPasswordResetReq,
  AccountRes,
  AccountRolesUpdateReq,
  AccountStatusUpdateReq,
  PasswordChangeReq,
  RoleRes,
} from "./types";

// MARK: - 계정

export function listAccounts() {
  return apiFetch<AccountRes[]>("/api/v1/accounts");
}

export function listRoles() {
  return apiFetch<RoleRes[]>("/api/v1/accounts/roles");
}

export function createAccount(body: AccountCreateReq) {
  return apiFetch<AccountRes>("/api/v1/accounts", { method: "POST", body });
}

/** 연결 후 재로그인해야 토큰에 empId 가 실림 */
export function linkAccountEmployee(userId: number, body: AccountEmployeeLinkReq) {
  return apiFetch<AccountRes>(`/api/v1/accounts/${userId}/employee`, {
    method: "PATCH",
    body,
  });
}

export function updateAccountRoles(userId: number, body: AccountRolesUpdateReq) {
  return apiFetch<AccountRes>(`/api/v1/accounts/${userId}/roles`, {
    method: "PATCH",
    body,
  });
}

export function updateAccountStatus(userId: number, body: AccountStatusUpdateReq) {
  return apiFetch<AccountRes>(`/api/v1/accounts/${userId}/status`, {
    method: "PATCH",
    body,
  });
}

export function resetAccountPassword(userId: number, body: AccountPasswordResetReq) {
  return apiFetch<void>(`/api/v1/accounts/${userId}/password`, {
    method: "PATCH",
    body,
  });
}

export function changeMyPassword(body: PasswordChangeReq) {
  return apiFetch<void>("/api/v1/accounts/me/password", { method: "PATCH", body });
}
