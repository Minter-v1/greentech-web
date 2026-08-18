"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api/client";
import { createDepartment, createPosition } from "@/lib/api/org";

// MARK: - 조직 등록 액션

export interface OrgFormState {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

function toOptionalNumber(value: FormDataEntryValue | null): number | undefined {
  const text = String(value ?? "").trim();
  return text === "" ? undefined : Number(text);
}

function toFailure(error: unknown, fallback: string): OrgFormState {
  if (error instanceof ApiError) {
    return { ok: false, message: error.message, fieldErrors: error.fieldErrorMap };
  }
  return { ok: false, message: fallback };
}

export async function createDepartmentAction(
  _prev: OrgFormState,
  formData: FormData,
): Promise<OrgFormState> {
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!code || !name) {
    return { ok: false, message: "부서코드와 부서명은 필수입니다" };
  }

  try {
    await createDepartment({
      code,
      name,
      parentId: toOptionalNumber(formData.get("parentId")),
      sortOrder: toOptionalNumber(formData.get("sortOrder")),
    });
  } catch (error) {
    return toFailure(error, "부서 등록에 실패했습니다");
  }

  revalidatePath("/organization");
  return { ok: true, message: `${name} 부서를 등록했습니다` };
}

export async function createPositionAction(
  _prev: OrgFormState,
  formData: FormData,
): Promise<OrgFormState> {
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const levelNo = toOptionalNumber(formData.get("levelNo"));

  if (!code || !name || levelNo === undefined) {
    return { ok: false, message: "직위코드, 직위명, 서열은 필수입니다" };
  }

  try {
    await createPosition({ code, name, levelNo });
  } catch (error) {
    return toFailure(error, "직위 등록에 실패했습니다");
  }

  revalidatePath("/organization");
  return { ok: true, message: `${name} 직위를 등록했습니다` };
}
