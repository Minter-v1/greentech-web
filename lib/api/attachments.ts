import { apiFetch } from "./client";
import type { AttachmentCategory, AttachmentOwnerType, AttachmentRes } from "./types";

// MARK: - 첨부파일

export function listAttachments(ownerType: AttachmentOwnerType, ownerId: number) {
  return apiFetch<AttachmentRes[]>("/api/v1/attachments", { query: { ownerType, ownerId } });
}

export function uploadAttachment(
  ownerType: AttachmentOwnerType,
  ownerId: number,
  category: AttachmentCategory,
  file: File,
) {
  const body = new FormData();
  body.append("file", file);
  return apiFetch<AttachmentRes>("/api/v1/attachments", {
    method: "POST",
    query: { ownerType, ownerId, category },
    body,
  });
}

export function deleteAttachment(id: number) {
  return apiFetch<void>(`/api/v1/attachments/${id}`, { method: "DELETE" });
}
