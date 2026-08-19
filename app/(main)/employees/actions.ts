"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api/client";
import {
  createCertificate,
  createEducation,
  createEmployee,
  createFamilyMember,
  patchCertificate,
  patchEducation,
  patchEmployee,
  patchFamilyMember,
  leaveOfAbsenceEmployee,
  reinstateEmployee,
  resignEmployee,
} from "@/lib/api/employees";
import type {
  Degree,
  EmployeeStatus,
  EmploymentType,
  FamilyRelation,
  Gender,
} from "@/lib/api/types";

// MARK: - 사원 재직 상태 전이

export interface StatusActionState {
  ok?: boolean;
  message?: string;
}

function toFailure(error: unknown, fallback: string): StatusActionState {
  if (error instanceof ApiError) return { ok: false, message: error.message };
  return { ok: false, message: fallback };
}

function revalidate(employeeId: number) {
  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
}

export async function changeStatusAction(
  employeeId: number,
  next: EmployeeStatus,
  effectiveDate: string,
  reason?: string,
): Promise<StatusActionState> {
  if (!effectiveDate) return { ok: false, message: "적용일을 입력하세요" };

  const trimmed = reason?.trim() || undefined;

  try {
    switch (next) {
      case "RESIGNED":
        await resignEmployee(employeeId, { resignDate: effectiveDate, reason: trimmed });
        break;
      case "ACTIVE":
        await reinstateEmployee(employeeId, { effectiveDate, reason: trimmed });
        break;
      case "ON_LEAVE":
        await leaveOfAbsenceEmployee(employeeId, { effectiveDate, reason: trimmed });
        break;
    }
  } catch (error) {
    return toFailure(error, "상태 변경에 실패했습니다");
  }

  revalidate(employeeId);
  return { ok: true };
}

// MARK: - 사원 등록

export interface CreateEmployeeState {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

function text(formData: FormData, key: string): string | undefined {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? undefined : value;
}

function num(formData: FormData, key: string): number | undefined {
  const value = text(formData, key);
  return value === undefined ? undefined : Number(value);
}

export async function createEmployeeAction(
  _prev: CreateEmployeeState,
  formData: FormData,
): Promise<CreateEmployeeState> {
  const empNo = text(formData, "empNo");
  const name = text(formData, "name");
  const hireDate = text(formData, "hireDate");
  const employmentType = text(formData, "employmentType") as EmploymentType | undefined;

  if (!empNo || !name || !hireDate || !employmentType) {
    return { ok: false, message: "사번, 성명, 입사일, 고용형태는 필수입니다" };
  }

  const residentNo = text(formData, "residentNo");
  if (residentNo && !/^\d{6}-\d{7}$/.test(residentNo)) {
    return { ok: false, fieldErrors: { residentNo: "000000-0000000 형식으로 입력하세요" } };
  }

  try {
    await createEmployee({
      empNo,
      name,
      hireDate,
      employmentType,
      nameEn: text(formData, "nameEn"),
      residentNo,
      birthDate: text(formData, "birthDate"),
      gender: text(formData, "gender") as Gender | undefined,
      email: text(formData, "email"),
      departmentId: num(formData, "departmentId"),
      jobPositionId: num(formData, "jobPositionId"),
      managerId: num(formData, "managerId"),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message, fieldErrors: error.fieldErrorMap };
    }
    return { ok: false, message: "사원 등록에 실패했습니다" };
  }

  revalidatePath("/employees");
  return { ok: true, message: `${name} 사원을 등록했습니다` };
}

// MARK: - 사원 정보 수정

export async function patchEmployeeAction(
  employeeId: number,
  _prev: CreateEmployeeState,
  formData: FormData,
): Promise<CreateEmployeeState> {
  const name = text(formData, "name");
  if (!name) return { ok: false, message: "성명은 필수입니다" };

  try {
    await patchEmployee(employeeId, {
      name,
      nameEn: text(formData, "nameEn") ?? null,
      email: text(formData, "email") ?? null,
      birthDate: text(formData, "birthDate") ?? null,
      gender: (text(formData, "gender") as Gender | undefined) ?? null,
      departmentId: num(formData, "departmentId") ?? null,
      jobPositionId: num(formData, "jobPositionId") ?? null,
      managerId: num(formData, "managerId") ?? null,
      employmentType: text(formData, "employmentType") as EmploymentType | undefined,
      reason: text(formData, "reason"),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message, fieldErrors: error.fieldErrorMap };
    }
    return { ok: false, message: "사원 정보 수정에 실패했습니다" };
  }

  revalidate(employeeId);
  return { ok: true, message: "수정했습니다" };
}

// MARK: - 사원 부속정보 수정

export interface DetailItemActionState {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

function detailFailure(error: unknown, fallback: string): DetailItemActionState {
  if (error instanceof ApiError) {
    return { ok: false, message: error.message, fieldErrors: error.fieldErrorMap };
  }
  return { ok: false, message: fallback };
}

export async function createEducationAction(
  employeeId: number,
  _prev: DetailItemActionState,
  formData: FormData,
): Promise<DetailItemActionState> {
  const schoolName = text(formData, "schoolName");
  const degree = text(formData, "degree") as Degree | undefined;
  if (!schoolName || !degree) return { ok: false, message: "학교명과 학위는 필수입니다" };

  try {
    await createEducation(employeeId, {
      schoolName,
      degree,
      major: text(formData, "major"),
      admissionDate: text(formData, "admissionDate"),
      graduationDate: text(formData, "graduationDate"),
      graduated: formData.has("graduated"),
    });
  } catch (error) {
    return detailFailure(error, "학력 등록에 실패했습니다");
  }

  revalidate(employeeId);
  return { ok: true, message: "학력을 등록했습니다" };
}

export async function createCertificateAction(
  employeeId: number,
  _prev: DetailItemActionState,
  formData: FormData,
): Promise<DetailItemActionState> {
  const name = text(formData, "name");
  if (!name) return { ok: false, message: "자격증명은 필수입니다" };

  try {
    await createCertificate(employeeId, {
      name,
      issuer: text(formData, "issuer"),
      licenseNo: text(formData, "licenseNo"),
      acquiredDate: text(formData, "acquiredDate"),
      expiryDate: text(formData, "expiryDate"),
    });
  } catch (error) {
    return detailFailure(error, "자격증 등록에 실패했습니다");
  }

  revalidate(employeeId);
  return { ok: true, message: "자격증을 등록했습니다" };
}

export async function createFamilyMemberAction(
  employeeId: number,
  _prev: DetailItemActionState,
  formData: FormData,
): Promise<DetailItemActionState> {
  const name = text(formData, "name");
  const relation = text(formData, "relation") as FamilyRelation | undefined;
  if (!name || !relation) return { ok: false, message: "성명과 관계는 필수입니다" };

  try {
    await createFamilyMember(employeeId, {
      name,
      relation,
      birthDate: text(formData, "birthDate"),
      dependent: formData.has("dependent"),
      cohabiting: formData.has("cohabiting"),
    });
  } catch (error) {
    return detailFailure(error, "가족사항 등록에 실패했습니다");
  }

  revalidate(employeeId);
  return { ok: true, message: "가족사항을 등록했습니다" };
}

export async function patchEducationAction(
  employeeId: number,
  educationId: number,
  _prev: DetailItemActionState,
  formData: FormData,
): Promise<DetailItemActionState> {
  const schoolName = text(formData, "schoolName");
  const degree = text(formData, "degree") as Degree | undefined;
  if (!schoolName || !degree) return { ok: false, message: "학교명과 학위는 필수입니다" };

  try {
    await patchEducation(educationId, {
      schoolName,
      degree,
      major: text(formData, "major") ?? null,
      admissionDate: text(formData, "admissionDate") ?? null,
      graduationDate: text(formData, "graduationDate") ?? null,
      graduated: formData.has("graduated"),
    });
  } catch (error) {
    return detailFailure(error, "학력 수정에 실패했습니다");
  }

  revalidate(employeeId);
  return { ok: true, message: "학력을 수정했습니다" };
}

export async function patchCertificateAction(
  employeeId: number,
  certificateId: number,
  _prev: DetailItemActionState,
  formData: FormData,
): Promise<DetailItemActionState> {
  const name = text(formData, "name");
  if (!name) return { ok: false, message: "자격증명은 필수입니다" };

  try {
    await patchCertificate(certificateId, {
      name,
      issuer: text(formData, "issuer") ?? null,
      licenseNo: text(formData, "licenseNo") ?? null,
      acquiredDate: text(formData, "acquiredDate") ?? null,
      expiryDate: text(formData, "expiryDate") ?? null,
    });
  } catch (error) {
    return detailFailure(error, "자격증 수정에 실패했습니다");
  }

  revalidate(employeeId);
  return { ok: true, message: "자격증을 수정했습니다" };
}

export async function patchFamilyMemberAction(
  employeeId: number,
  familyMemberId: number,
  _prev: DetailItemActionState,
  formData: FormData,
): Promise<DetailItemActionState> {
  const name = text(formData, "name");
  const relation = text(formData, "relation") as FamilyRelation | undefined;
  if (!name || !relation) return { ok: false, message: "성명과 관계는 필수입니다" };

  try {
    await patchFamilyMember(familyMemberId, {
      name,
      relation,
      birthDate: text(formData, "birthDate") ?? null,
      dependent: formData.has("dependent"),
      cohabiting: formData.has("cohabiting"),
    });
  } catch (error) {
    return detailFailure(error, "가족사항 수정에 실패했습니다");
  }

  revalidate(employeeId);
  return { ok: true, message: "가족사항을 수정했습니다" };
}
