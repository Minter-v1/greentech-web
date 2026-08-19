import { apiFetch } from "./client";
import type {
  DepartmentCreateReq,
  DepartmentRes,
  DepartmentTreeRes,
  DepartmentPatchReq,
  JobPositionCreateReq,
  JobPositionPatchReq,
  JobPositionRes,
} from "./types";

// MARK: - 부서

export function listDepartments(activeOnly?: boolean) {
  return apiFetch<DepartmentRes[]>("/api/v1/departments", { query: { activeOnly } });
}

export function getDepartmentTree() {
  return apiFetch<DepartmentTreeRes[]>("/api/v1/departments/tree");
}

export function getDepartment(id: number) {
  return apiFetch<DepartmentRes>(`/api/v1/departments/${id}`);
}

export function createDepartment(body: DepartmentCreateReq) {
  return apiFetch<DepartmentRes>("/api/v1/departments", { method: "POST", body });
}

export function patchDepartment(id: number, body: DepartmentPatchReq) {
  return apiFetch<DepartmentRes>(`/api/v1/departments/${id}`, { method: "PATCH", body });
}

export function deactivateDepartment(id: number) {
  return apiFetch<void>(`/api/v1/departments/${id}`, { method: "DELETE" });
}

// MARK: - 직위

export function listPositions(activeOnly?: boolean) {
  return apiFetch<JobPositionRes[]>("/api/v1/positions", { query: { activeOnly } });
}

export function createPosition(body: JobPositionCreateReq) {
  return apiFetch<JobPositionRes>("/api/v1/positions", { method: "POST", body });
}

export function patchPosition(id: number, body: JobPositionPatchReq) {
  return apiFetch<JobPositionRes>(`/api/v1/positions/${id}`, { method: "PATCH", body });
}

export function deactivatePosition(id: number) {
  return apiFetch<void>(`/api/v1/positions/${id}`, { method: "DELETE" });
}

/** 트리를 깊이가 붙은 평면 목록으로 변환 */
export function flattenDepartmentTree(
  nodes: DepartmentTreeRes[],
  depth = 0,
): Array<{ id: number; name: string; code: string; depth: number }> {
  return nodes.flatMap((node) => [
    { id: node.id, name: node.name, code: node.code, depth },
    ...flattenDepartmentTree(node.children ?? [], depth + 1),
  ]);
}
