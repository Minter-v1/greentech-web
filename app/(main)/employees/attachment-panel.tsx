"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Download, FileUp, Trash2 } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState } from "@/components/ui/card";
import { Field, FormAlert } from "@/components/ui/field";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { Modal } from "@/components/ui/modal";
import { SelectMenu } from "@/components/ui/select-menu";
import { Spinner } from "@/components/ui/spinner";
import { Table, Td, Th, Thead, Tr } from "@/components/ui/table";
import type { AttachmentRes } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";
import {
  deleteEmployeeAttachmentAction,
  uploadEmployeeAttachmentAction,
  type AttachmentActionState,
} from "./attachment-actions";

// MARK: - 사원 첨부파일 패널

const CATEGORY_OPTIONS = [
  { value: "CERTIFICATE_SCAN", label: "자격증 사본" },
  { value: "PROOF_DOCUMENT", label: "증빙 서류" },
  { value: "ETC", label: "기타" },
];

const CATEGORY_LABEL = Object.fromEntries(
  [
    { value: "PROFILE_PHOTO", label: "프로필 사진" },
    ...CATEGORY_OPTIONS,
  ].map((option) => [option.value, option.label]),
);

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 ** 2) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 ** 2).toFixed(1)} MB`;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-xs">
      {pending ? <Spinner size="sm" className="text-on-primary" /> : <FileUp className="size-4" />}
      {pending ? "업로드 중" : "업로드"}
    </Button>
  );
}

function UploadDialog({ employeeId }: { employeeId: number }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<AttachmentActionState, FormData>(
    uploadEmployeeAttachmentAction.bind(null, employeeId),
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const handled = useRef<AttachmentActionState | null>(null);
  const [fileError, setFileError] = useState<string>();

  useEffect(() => {
    if (!state.ok || handled.current === state) return;
    handled.current = state;
    formRef.current?.reset();
    setOpen(false);
  }, [state]);

  return (
    <>
      <Button size="sm" variant="secondary" className="gap-xxs" onClick={() => setOpen(true)}>
        <FileUp className="size-3.5" />
        파일 추가
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="첨부파일 업로드"
        description="사원 관련 증빙 파일을 등록합니다"
      >
        <form ref={formRef} action={formAction} className="flex flex-col gap-md">
          <Field label="파일 분류" required>
            <SelectMenu
              name="category"
              ariaLabel="파일 분류"
              defaultValue="PROOF_DOCUMENT"
              options={CATEGORY_OPTIONS}
              panelPosition="absolute"
            />
          </Field>
          <Field label="파일" htmlFor="employee-attachment" required>
            <FileDropzone
              id="employee-attachment"
              name="file"
              required
              onError={setFileError}
            />
          </Field>
          {fileError ? <FormAlert message={fileError} /> : null}
          {state.ok === false && state.message ? <FormAlert message={state.message} /> : null}
          <div className="flex justify-end gap-xs">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              취소
            </Button>
            <SubmitButton />
          </div>
        </form>
      </Modal>
    </>
  );
}

function DeleteButton({ employeeId, attachmentId }: { employeeId: number; attachmentId: number }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const remove = () => {
    startTransition(async () => {
      const result = await deleteEmployeeAttachmentAction(employeeId, attachmentId);
      setError(result.ok ? undefined : result.message);
      if (result.ok) setOpen(false);
    });
  };

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        aria-label="첨부파일 삭제"
        onClick={() => {
          setError(undefined);
          setOpen(true);
        }}
      >
        <Trash2 className="size-3.5" />
      </Button>

      <Modal
        open={open}
        onOpenChange={(next) => {
          if (!pending) setOpen(next);
        }}
        title="첨부파일 삭제"
        description="삭제한 파일은 복구할 수 없습니다"
        footer={
          <>
            <Button type="button" variant="ghost" disabled={pending} onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="button" disabled={pending} onClick={remove} className="min-w-[5.5rem] gap-xs">
              {pending ? <Spinner size="sm" className="text-on-primary" /> : null}
              {pending ? "삭제 중" : "삭제"}
            </Button>
          </>
        }
      >
        <p className="text-body-sm text-body">선택한 첨부파일을 삭제할까요?</p>
        {error ? <FormAlert message={error} /> : null}
      </Modal>
    </>
  );
}

export function AttachmentPanel({
  employeeId,
  attachments,
  canManage,
}: {
  employeeId: number;
  attachments: AttachmentRes[];
  canManage: boolean;
}) {
  return (
    <Card className="mt-lg">
      <CardHeader
        title="첨부파일"
        description="증빙 서류와 사원 관련 파일"
        action={canManage ? <UploadDialog employeeId={employeeId} /> : undefined}
      />
      {attachments.length === 0 ? (
        <CardBody>
          <EmptyState message="등록된 첨부파일이 없습니다" />
        </CardBody>
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>파일명</Th>
              <Th>분류</Th>
              <Th>크기</Th>
              <Th>등록일</Th>
              <Th className="w-28 text-center">작업</Th>
            </tr>
          </Thead>
          <tbody>
            {attachments.map((attachment) => (
              <Tr key={attachment.id}>
                <Td className="font-medium">{attachment.originalName}</Td>
                <Td className="text-body">
                  {CATEGORY_LABEL[attachment.category] ?? attachment.category}
                </Td>
                <Td className="text-body">{formatFileSize(attachment.fileSize)}</Td>
                <Td className="text-body">{formatDate(attachment.createdAt)}</Td>
                <Td>
                  <div className="flex items-center justify-center gap-xxs">
                    <LinkButton
                      href={`/api/attachments/${attachment.id}`}
                      size="sm"
                      className="gap-xxs"
                      prefetch={false}
                    >
                      <Download className="size-3.5" />
                      받기
                    </LinkButton>
                    {canManage ? (
                      <DeleteButton employeeId={employeeId} attachmentId={attachment.id} />
                    ) : null}
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
