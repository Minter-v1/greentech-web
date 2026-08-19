"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { CircleAlert, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { SelectMenu } from "@/components/ui/select-menu";
import { Spinner } from "@/components/ui/spinner";
import type { CertificateRes, EducationRes, FamilyMemberRes } from "@/lib/api/types";
import {
  createCertificateAction,
  createEducationAction,
  createFamilyMemberAction,
  patchCertificateAction,
  patchEducationAction,
  patchFamilyMemberAction,
  type DetailItemActionState,
} from "./actions";

// MARK: - 사원 부속정보 수정 다이얼로그

const DEGREE_OPTIONS = [
  { value: "HIGH_SCHOOL", label: "고졸" },
  { value: "ASSOCIATE", label: "전문학사" },
  { value: "BACHELOR", label: "학사" },
  { value: "MASTER", label: "석사" },
  { value: "DOCTOR", label: "박사" },
];

const RELATION_OPTIONS = [
  { value: "SPOUSE", label: "배우자" },
  { value: "CHILD", label: "자녀" },
  { value: "PARENT", label: "부모" },
  { value: "SIBLING", label: "형제자매" },
  { value: "OTHER", label: "기타" },
];

type EditAction = (
  state: DetailItemActionState,
  formData: FormData,
) => Promise<DetailItemActionState>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-xs">
      {pending ? <Spinner size="sm" className="text-on-primary" /> : null}
      저장
    </Button>
  );
}

function CheckboxField({ name, label, defaultChecked }: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex h-10 cursor-pointer items-center gap-xs text-body-sm font-medium">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 accent-primary"
      />
      {label}
    </label>
  );
}

function EditDialog({
  action,
  label,
  title,
  description,
  recordKey,
  create = false,
  children,
}: {
  action: EditAction;
  label: string;
  title: string;
  description: string;
  recordKey: string;
  create?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(action, {});
  const handled = useRef<DetailItemActionState | null>(null);

  useEffect(() => {
    if (!state.ok || handled.current === state) return;
    handled.current = state;
    setOpen(false);
    router.refresh();
  }, [router, state]);

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        aria-label={label}
        title={label}
        onClick={() => setOpen(true)}
        className="gap-xxs px-xs"
      >
        {create ? <Plus className="size-3.5" /> : <Pencil className="size-3.5" />}
        {create ? "등록" : "수정"}
      </Button>

      <Modal open={open} onOpenChange={setOpen} title={title} description={description}>
        <form key={recordKey} action={formAction} className="flex flex-col gap-md">
          {children}

          {state.ok === false && state.message ? (
            <p
              aria-live="polite"
              className="flex items-center gap-xs rounded-sm bg-error-soft px-sm py-xs text-body-sm text-error-deep"
            >
              <CircleAlert className="size-4 shrink-0" />
              {state.message}
            </p>
          ) : null}

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

export function CreateEducationDialog({ employeeId }: { employeeId: number }) {
  return (
    <EditDialog
      action={createEducationAction.bind(null, employeeId)}
      label="학력 등록"
      title="학력 등록"
      description="학교명, 전공, 학위와 재학 기간을 입력합니다"
      recordKey="education-new"
      create
    >
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Field label="학교명" required>
          <Input name="schoolName" required maxLength={100} />
        </Field>
        <Field label="전공">
          <Input name="major" maxLength={100} />
        </Field>
        <Field label="학위" required>
          <SelectMenu name="degree" ariaLabel="학위" options={DEGREE_OPTIONS} />
        </Field>
        <div className="flex flex-col gap-xxs">
          <span className="text-body-sm font-medium">상태</span>
          <CheckboxField name="graduated" label="졸업" />
        </div>
        <Field label="입학일">
          <DatePicker name="admissionDate" ariaLabel="입학일" />
        </Field>
        <Field label="졸업일">
          <DatePicker name="graduationDate" ariaLabel="졸업일" />
        </Field>
      </div>
    </EditDialog>
  );
}

export function CreateCertificateDialog({ employeeId }: { employeeId: number }) {
  return (
    <EditDialog
      action={createCertificateAction.bind(null, employeeId)}
      label="자격증 등록"
      title="자격증 등록"
      description="자격증 정보와 유효 기간을 입력합니다"
      recordKey="certificate-new"
      create
    >
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Field label="자격증명" required>
          <Input name="name" required maxLength={100} />
        </Field>
        <Field label="발급기관">
          <Input name="issuer" maxLength={100} />
        </Field>
        <Field label="자격증 번호">
          <Input name="licenseNo" maxLength={100} />
        </Field>
        <Field label="취득일">
          <DatePicker name="acquiredDate" ariaLabel="취득일" />
        </Field>
        <Field label="만료일">
          <DatePicker name="expiryDate" ariaLabel="만료일" />
        </Field>
      </div>
    </EditDialog>
  );
}

export function CreateFamilyMemberDialog({ employeeId }: { employeeId: number }) {
  return (
    <EditDialog
      action={createFamilyMemberAction.bind(null, employeeId)}
      label="가족사항 등록"
      title="가족사항 등록"
      description="가족 관계와 부양·동거 여부를 입력합니다"
      recordKey="family-member-new"
      create
    >
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Field label="성명" required>
          <Input name="name" required maxLength={50} />
        </Field>
        <Field label="관계" required>
          <SelectMenu name="relation" ariaLabel="관계" options={RELATION_OPTIONS} />
        </Field>
        <Field label="생년월일">
          <DatePicker name="birthDate" ariaLabel="생년월일" />
        </Field>
        <div className="flex flex-col gap-xxs">
          <span className="text-body-sm font-medium">공제 정보</span>
          <div className="flex items-center gap-md">
            <CheckboxField name="dependent" label="부양가족" />
            <CheckboxField name="cohabiting" label="동거" />
          </div>
        </div>
      </div>
    </EditDialog>
  );
}

export function EditEducationDialog({
  employeeId,
  education,
}: {
  employeeId: number;
  education: EducationRes;
}) {
  return (
    <EditDialog
      action={patchEducationAction.bind(null, employeeId, education.id)}
      label={`${education.schoolName} 학력 수정`}
      title="학력 수정"
      description="학교명, 전공, 학위와 재학 기간을 수정합니다"
      recordKey={JSON.stringify(education)}
    >
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Field label="학교명" required>
          <Input name="schoolName" defaultValue={education.schoolName} required maxLength={100} />
        </Field>
        <Field label="전공">
          <Input name="major" defaultValue={education.major ?? ""} maxLength={100} />
        </Field>
        <Field label="학위" required>
          <SelectMenu
            name="degree"
            ariaLabel="학위"
            defaultValue={education.degree ?? ""}
            options={DEGREE_OPTIONS}
            panelPosition="absolute"
          />
        </Field>
        <div className="flex flex-col gap-xxs">
          <span className="text-body-sm font-medium">상태</span>
          <CheckboxField
            name="graduated"
            label="졸업"
            defaultChecked={education.graduated}
          />
        </div>
        <Field label="입학일">
          <DatePicker name="admissionDate" defaultValue={education.admissionDate ?? ""} ariaLabel="입학일" />
        </Field>
        <Field label="졸업일">
          <DatePicker
            name="graduationDate"
            defaultValue={education.graduationDate ?? ""}
            ariaLabel="졸업일"
          />
        </Field>
      </div>
    </EditDialog>
  );
}

export function EditCertificateDialog({
  employeeId,
  certificate,
}: {
  employeeId: number;
  certificate: CertificateRes;
}) {
  return (
    <EditDialog
      action={patchCertificateAction.bind(null, employeeId, certificate.id)}
      label={`${certificate.name} 자격증 수정`}
      title="자격증 수정"
      description="자격증 정보와 유효 기간을 수정합니다"
      recordKey={JSON.stringify(certificate)}
    >
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Field label="자격증명" required>
          <Input name="name" defaultValue={certificate.name} required maxLength={100} />
        </Field>
        <Field label="발급기관">
          <Input name="issuer" defaultValue={certificate.issuer ?? ""} maxLength={100} />
        </Field>
        <Field label="자격증 번호">
          <Input name="licenseNo" defaultValue={certificate.licenseNo ?? ""} maxLength={100} />
        </Field>
        <Field label="취득일">
          <DatePicker name="acquiredDate" defaultValue={certificate.acquiredDate ?? ""} ariaLabel="취득일" />
        </Field>
        <Field label="만료일">
          <DatePicker name="expiryDate" defaultValue={certificate.expiryDate ?? ""} ariaLabel="만료일" />
        </Field>
      </div>
    </EditDialog>
  );
}

export function EditFamilyMemberDialog({
  employeeId,
  member,
}: {
  employeeId: number;
  member: FamilyMemberRes;
}) {
  return (
    <EditDialog
      action={patchFamilyMemberAction.bind(null, employeeId, member.id)}
      label={`${member.name} 가족사항 수정`}
      title="가족사항 수정"
      description="가족 관계와 부양·동거 여부를 수정합니다"
      recordKey={JSON.stringify(member)}
    >
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Field label="성명" required>
          <Input name="name" defaultValue={member.name} required maxLength={50} />
        </Field>
        <Field label="관계" required>
          <SelectMenu
            name="relation"
            ariaLabel="관계"
            defaultValue={member.relation}
            options={RELATION_OPTIONS}
            panelPosition="absolute"
          />
        </Field>
        <Field label="생년월일">
          <DatePicker name="birthDate" defaultValue={member.birthDate ?? ""} ariaLabel="생년월일" />
        </Field>
        <div className="flex flex-col gap-xxs">
          <span className="text-body-sm font-medium">공제 정보</span>
          <div className="flex items-center gap-md">
            <CheckboxField
              name="dependent"
              label="부양가족"
              defaultChecked={member.dependent}
            />
            <CheckboxField
              name="cohabiting"
              label="동거"
              defaultChecked={member.cohabiting}
            />
          </div>
        </div>
      </div>
    </EditDialog>
  );
}
