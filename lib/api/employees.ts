import { apiFetch } from "./client";
import type {
  CertificateRes,
  EducationRes,
  EmployeeContactRes,
  EmployeeDetailRes,
  EmployeeResignReq,
  EmployeeSearchParams,
  EmployeeSummaryRes,
  EmployeeUpdateReq,
  EmploymentHistoryRes,
  FamilyMemberRes,
  PageResult,
} from "./types";

// MARK: - 사원

export function searchEmployees(params: EmployeeSearchParams = {}) {
  const { page = 0, size = 20, sort, ...filters } = params;
  return apiFetch<PageResult<EmployeeSummaryRes>>("/api/v1/employees", {
    query: { ...filters, page, size, sort },
  });
}

export function getEmployee(id: number) {
  return apiFetch<EmployeeDetailRes>(`/api/v1/employees/${id}`);
}

/** 전체 덮어쓰기. 현재 상세를 병합해 호출할 것 (EmployeeUpdateReq 주석 참고) */
export function updateEmployee(id: number, body: EmployeeUpdateReq) {
  return apiFetch<EmployeeDetailRes>(`/api/v1/employees/${id}`, { method: "PUT", body });
}

/** 상태와 퇴사일을 함께 변경하고 RESIGN 이력을 남김 */
export function resignEmployee(id: number, body: EmployeeResignReq) {
  return apiFetch<EmployeeDetailRes>(`/api/v1/employees/${id}/resign`, {
    method: "PATCH",
    body,
  });
}

export function getEmployeeContact(id: number) {
  return apiFetch<EmployeeContactRes>(`/api/v1/employees/${id}/contact`);
}

export function listEducations(id: number) {
  return apiFetch<EducationRes[]>(`/api/v1/employees/${id}/educations`);
}

export function listCertificates(id: number) {
  return apiFetch<CertificateRes[]>(`/api/v1/employees/${id}/certificates`);
}

export function listFamilyMembers(id: number) {
  return apiFetch<FamilyMemberRes[]>(`/api/v1/employees/${id}/family-members`);
}

export function listEmploymentHistories(id: number) {
  return apiFetch<EmploymentHistoryRes[]>(`/api/v1/employees/${id}/histories`);
}
