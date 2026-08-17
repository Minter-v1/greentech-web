import { apiFetch } from "./client";
import type {
  ApprovalStatus,
  OvertimeCreateReq,
  OvertimeRequestRes,
  PageParams,
  PageResult,
} from "./types";

// MARK: - 연장근무

export function listOvertimes(params: PageParams & { status?: ApprovalStatus } = {}) {
  const { page = 0, size = 20, sort, status } = params;
  return apiFetch<PageResult<OvertimeRequestRes>>("/api/v1/overtimes", {
    query: { status, page, size, sort },
  });
}

export function listMyOvertimes(params: PageParams = {}) {
  const { page = 0, size = 20, sort } = params;
  return apiFetch<PageResult<OvertimeRequestRes>>("/api/v1/overtimes/me", {
    query: { page, size, sort },
  });
}

export function createOvertime(body: OvertimeCreateReq) {
  return apiFetch<OvertimeRequestRes>("/api/v1/overtimes", { method: "POST", body });
}

export function approveOvertime(id: number) {
  return apiFetch<OvertimeRequestRes>(`/api/v1/overtimes/${id}/approve`, { method: "POST" });
}

export function rejectOvertime(id: number) {
  return apiFetch<OvertimeRequestRes>(`/api/v1/overtimes/${id}/reject`, { method: "POST" });
}
