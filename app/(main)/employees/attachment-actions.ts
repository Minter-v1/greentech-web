"use server";

import { revalidatePath } from "next/cache";
import { deleteAttachment, uploadAttachment } from "@/lib/api/attachments";
import { ApiError } from "@/lib/api/client";
import type { AttachmentCategory } from "@/lib/api/types";

// MARK: - 사원 첨부파일

export interface AttachmentActionState {
  ok?: boolean;
  message?: string;
}

const PROFILE_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024;

function failure(error: unknown, fallback: string): AttachmentActionState {
  if (error instanceof ApiError) return { ok: false, message: error.message };
  return { ok: false, message: fallback };
}

export async function uploadEmployeeAttachmentAction(
  employeeId: number,
  _prev: AttachmentActionState,
  formData: FormData,
): Promise<AttachmentActionState> {
  const file = formData.get("file");
  const category = String(formData.get("category") ?? "") as AttachmentCategory;

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "파일을 선택하세요" };
  }
  if (!category) return { ok: false, message: "파일 분류를 선택하세요" };

  try {
    await uploadAttachment("EMPLOYEE", employeeId, category, file);
  } catch (error) {
    return failure(error, "파일 업로드에 실패했습니다");
  }

  revalidatePath(`/employees/${employeeId}`);
  return { ok: true, message: "파일을 업로드했습니다" };
}

export async function saveEmployeeProfilePhotoAction(
  employeeId: number,
  currentAttachmentId: number | null,
  _prev: AttachmentActionState,
  formData: FormData,
): Promise<AttachmentActionState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "프로필 사진을 선택하세요" };
  }
  if (!PROFILE_PHOTO_TYPES.includes(file.type)) {
    return { ok: false, message: "JPG, PNG, WebP 이미지만 업로드할 수 있습니다" };
  }
  if (file.size > MAX_PROFILE_PHOTO_SIZE) {
    return { ok: false, message: "프로필 사진은 5MB 이하만 업로드할 수 있습니다" };
  }

  try {
    const created = await uploadAttachment("EMPLOYEE", employeeId, "PROFILE_PHOTO", file);
    if (currentAttachmentId) {
      try {
        await deleteAttachment(currentAttachmentId);
      } catch (error) {
        await deleteAttachment(created.id).catch(() => undefined);
        return failure(error, "기존 프로필 사진 교체에 실패했습니다");
      }
    }
  } catch (error) {
    return failure(error, "프로필 사진 업로드에 실패했습니다");
  }

  revalidatePath(`/employees/${employeeId}`);
  return { ok: true, message: currentAttachmentId ? "프로필 사진을 변경했습니다" : "프로필 사진을 등록했습니다" };
}

export async function deleteEmployeeAttachmentAction(
  employeeId: number,
  attachmentId: number,
): Promise<AttachmentActionState> {
  try {
    await deleteAttachment(attachmentId);
  } catch (error) {
    return failure(error, "파일 삭제에 실패했습니다");
  }

  revalidatePath(`/employees/${employeeId}`);
  return { ok: true, message: "파일을 삭제했습니다" };
}
