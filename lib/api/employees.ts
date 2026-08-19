import { apiFetch } from "./client";
import type {
  CertificateRes,
  CertificateCreateReq,
  CertificatePatchReq,
  EducationCreateReq,
  EducationRes,
  EducationPatchReq,
  EmployeeContactRes,
  EmployeeCreateReq,
  EmployeeDetailRes,
  EmployeeResignReq,
  EmployeeStatusChangeReq,
  EmployeeSearchParams,
  EmployeeSummaryRes,
  EmployeePatchReq,
  EmploymentHistoryRes,
  FamilyMemberRes,
  FamilyMemberCreateReq,
  FamilyMemberPatchReq,
  PageResult,
} from "./types";

// MARK: - 사원

export function searchEmployees(params: EmployeeSearchParams = {}) {
  const { page = 0, size = 20, sort, ...filters } = params;
  return apiFetch<PageResult<EmployeeSummaryRes>>("/api/v1/employees", {
    query: { ...filters, page, size, sort },
  });
}

export function createEmployee(body: EmployeeCreateReq) {
  return apiFetch<EmployeeDetailRes>("/api/v1/employees", { method: "POST", body });
}

export function getEmployee(id: number) {
  return apiFetch<EmployeeDetailRes>(`/api/v1/employees/${id}`);
}

/** 부분 수정. 보낸 키만 반영됨 */
export function patchEmployee(id: number, body: EmployeePatchReq) {
  return apiFetch<EmployeeDetailRes>(`/api/v1/employees/${id}`, { method: "PATCH", body });
}

// MARK: 재직 상태 전이

/** ACTIVE·ON_LEAVE 에서만 가능. 이미 RESIGNED 면 409 */
export function resignEmployee(id: number, body: EmployeeResignReq) {
  return apiFetch<EmployeeDetailRes>(`/api/v1/employees/${id}/resign`, { method: "PATCH", body });
}

/** 퇴사일을 비우고 ACTIVE 로 되돌림. 이미 ACTIVE 면 409 */
export function reinstateEmployee(id: number, body: EmployeeStatusChangeReq) {
  return apiFetch<EmployeeDetailRes>(`/api/v1/employees/${id}/reinstate`, {
    method: "PATCH",
    body,
  });
}

/** ACTIVE 에서만 가능. 그 외 상태면 409 */
export function leaveOfAbsenceEmployee(id: number, body: EmployeeStatusChangeReq) {
  return apiFetch<EmployeeDetailRes>(`/api/v1/employees/${id}/leave-of-absence`, {
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

export function createEducation(id: number, body: EducationCreateReq) {
  return apiFetch<EducationRes>(`/api/v1/employees/${id}/educations`, {
    method: "POST",
    body,
  });
}

export function patchEducation(id: number, body: EducationPatchReq) {
  return apiFetch<EducationRes>(`/api/v1/employees/educations/${id}`, {
    method: "PATCH",
    body,
  });
}

export function listCertificates(id: number) {
  return apiFetch<CertificateRes[]>(`/api/v1/employees/${id}/certificates`);
}

export function createCertificate(id: number, body: CertificateCreateReq) {
  return apiFetch<CertificateRes>(`/api/v1/employees/${id}/certificates`, {
    method: "POST",
    body,
  });
}

export function patchCertificate(id: number, body: CertificatePatchReq) {
  return apiFetch<CertificateRes>(`/api/v1/employees/certificates/${id}`, {
    method: "PATCH",
    body,
  });
}

export function listFamilyMembers(id: number) {
  return apiFetch<FamilyMemberRes[]>(`/api/v1/employees/${id}/family-members`);
}

export function createFamilyMember(id: number, body: FamilyMemberCreateReq) {
  return apiFetch<FamilyMemberRes>(`/api/v1/employees/${id}/family-members`, {
    method: "POST",
    body,
  });
}

export function patchFamilyMember(id: number, body: FamilyMemberPatchReq) {
  return apiFetch<FamilyMemberRes>(`/api/v1/employees/family-members/${id}`, {
    method: "PATCH",
    body,
  });
}

export function listEmploymentHistories(id: number) {
  return apiFetch<EmploymentHistoryRes[]>(`/api/v1/employees/${id}/histories`);
}
