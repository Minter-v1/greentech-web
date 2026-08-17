import { apiFetch } from "./client";
import type {
  ApprovalStatus,
  LeaveBalanceRes,
  LeaveRequestCreateReq,
  LeaveRequestRes,
  LeaveTypeRes,
  PageParams,
  PageResult,
} from "./types";

// MARK: - 휴가

export function listLeaveTypes() {
  return apiFetch<LeaveTypeRes[]>("/api/v1/leaves/types");
}

export function getMyLeaveBalances(year?: number) {
  return apiFetch<LeaveBalanceRes[]>("/api/v1/leaves/balances/me", { query: { year } });
}

export function getEmployeeLeaveBalances(employeeId: number, year?: number) {
  return apiFetch<LeaveBalanceRes[]>(`/api/v1/leaves/balances/employees/${employeeId}`, {
    query: { year },
  });
}

export function listLeaveRequests(params: PageParams & { status?: ApprovalStatus } = {}) {
  const { page = 0, size = 20, sort, status } = params;
  return apiFetch<PageResult<LeaveRequestRes>>("/api/v1/leaves/requests", {
    query: { status, page, size, sort },
  });
}

export function listMyLeaveRequests(params: PageParams = {}) {
  const { page = 0, size = 20, sort } = params;
  return apiFetch<PageResult<LeaveRequestRes>>("/api/v1/leaves/requests/me", {
    query: { page, size, sort },
  });
}

export function createLeaveRequest(body: LeaveRequestCreateReq) {
  return apiFetch<LeaveRequestRes>("/api/v1/leaves/requests", { method: "POST", body });
}

export function approveLeaveRequest(id: number) {
  return apiFetch<LeaveRequestRes>(`/api/v1/leaves/requests/${id}/approve`, { method: "POST" });
}

export function rejectLeaveRequest(id: number, rejectReason: string) {
  return apiFetch<LeaveRequestRes>(`/api/v1/leaves/requests/${id}/reject`, {
    method: "POST",
    body: { rejectReason },
  });
}

export function cancelLeaveRequest(id: number) {
  return apiFetch<LeaveRequestRes>(`/api/v1/leaves/requests/${id}/cancel`, { method: "POST" });
}
