"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Camera, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormAlert } from "@/components/ui/field";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import type { AttachmentRes } from "@/lib/api/types";
import {
  deleteEmployeeAttachmentAction,
  saveEmployeeProfilePhotoAction,
  type AttachmentActionState,
} from "./attachment-actions";

// MARK: - 프로필 사진

const PROFILE_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024;

function SaveButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="min-w-[5.5rem] gap-xs">
      {pending ? <Spinner size="sm" className="text-on-primary" /> : null}
      {pending ? "저장 중" : editing ? "변경" : "등록"}
    </Button>
  );
}

export function ProfilePhotoControl({
  employeeId,
  employeeName,
  photo,
  canManage,
}: {
  employeeId: number;
  employeeName: string;
  photo?: AttachmentRes;
  canManage: boolean;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [fileError, setFileError] = useState<string>();
  const [deleteError, setDeleteError] = useState<string>();
  const [deleting, startDeleting] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const handled = useRef<AttachmentActionState | null>(null);
  const [state, formAction] = useActionState<AttachmentActionState, FormData>(
    saveEmployeeProfilePhotoAction.bind(null, employeeId, photo?.id ?? null),
    {},
  );

  useEffect(() => {
    if (!state.ok || handled.current === state) return;
    handled.current = state;
    formRef.current?.reset();
    setEditOpen(false);
    router.refresh();
  }, [router, state]);

  const remove = () => {
    if (!photo) return;
    startDeleting(async () => {
      const result = await deleteEmployeeAttachmentAction(employeeId, photo.id);
      setDeleteError(result.ok ? undefined : result.message);
      if (result.ok) {
        setDeleteOpen(false);
        router.refresh();
      }
    });
  };

  const hasPhoto = Boolean(photo && !imageError);

  return (
    <div className="relative flex aspect-[3/4] h-48 w-36 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-canvas-soft-2 text-mute ring-1 ring-inset ring-hairline sm:h-auto sm:w-auto sm:min-w-[10rem] sm:self-stretch">
      {hasPhoto && photo ? (
        <Image
          unoptimized
          fill
          sizes="(min-width: 640px) 174px, 144px"
          src={`/api/attachments/${photo.id}?inline=1`}
          alt={`${employeeName} 프로필 사진`}
          className="object-cover object-[center_25%]"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex flex-col items-center gap-xs">
          <UserRound className="size-10" strokeWidth={1.5} aria-hidden />
          <span className="text-caption">사진 미등록</span>
        </div>
      )}
      {canManage ? (
        <Button
          size="sm"
          variant="secondary"
          className="absolute bottom-xs right-xs size-8 bg-canvas/90 p-0 shadow-level-2 backdrop-blur-sm"
          aria-label={photo ? "프로필 사진 변경" : "프로필 사진 등록"}
          title={photo ? "프로필 사진 변경" : "프로필 사진 등록"}
          onClick={() => {
            setFileError(undefined);
            setEditOpen(true);
          }}
        >
          <Camera className="size-4" />
        </Button>
      ) : null}

      <Modal
        open={editOpen}
        onOpenChange={setEditOpen}
        title={photo ? "프로필 사진 변경" : "프로필 사진 등록"}
        description="JPG, PNG, WebP 이미지를 등록할 수 있습니다"
      >
        <form ref={formRef} action={formAction} className="flex flex-col gap-md">
          <Field label="프로필 사진" htmlFor={`profile-photo-${employeeId}`} required>
            <FileDropzone
              id={`profile-photo-${employeeId}`}
              name="file"
              required
              maxSize={MAX_PROFILE_PHOTO_SIZE}
              accept="image/jpeg,image/png,image/webp"
              allowedTypes={PROFILE_PHOTO_TYPES}
              helperText="JPG, PNG, WebP · 최대 5MB"
              onError={setFileError}
            />
          </Field>
          {fileError ? <FormAlert message={fileError} /> : null}
          {state.ok === false && state.message ? <FormAlert message={state.message} /> : null}
          <div className="flex items-center justify-between gap-xs">
            {photo ? (
              <Button
                type="button"
                variant="ghost"
                className="gap-xxs"
                onClick={() => {
                  setEditOpen(false);
                  setDeleteError(undefined);
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="size-3.5" />
                현재 사진 삭제
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-xs">
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                취소
              </Button>
              <SaveButton editing={Boolean(photo)} />
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteOpen}
        onOpenChange={(next) => {
          if (!deleting) setDeleteOpen(next);
        }}
        title="프로필 사진 삭제"
        description="삭제 후에는 기본 이미지가 표시됩니다"
        footer={
          <>
            <Button type="button" variant="ghost" disabled={deleting} onClick={() => setDeleteOpen(false)}>
              취소
            </Button>
            <Button type="button" disabled={deleting} onClick={remove} className="min-w-[5.5rem] gap-xs">
              {deleting ? <Spinner size="sm" className="text-on-primary" /> : null}
              {deleting ? "삭제 중" : "삭제"}
            </Button>
          </>
        }
      >
        <p className="text-body-sm text-body">현재 프로필 사진을 삭제할까요?</p>
        {deleteError ? <FormAlert message={deleteError} /> : null}
      </Modal>
    </div>
  );
}
