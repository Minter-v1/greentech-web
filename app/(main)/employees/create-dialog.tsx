"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CircleAlert, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Modal } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/field";
import { SelectMenu } from "@/components/ui/select-menu";
import { Spinner } from "@/components/ui/spinner";
import { createEmployeeAction, type CreateEmployeeState } from "./actions";

// MARK: - 사원 등록 다이얼로그

interface Option {
  id: number;
  label: string;
}

const GENDER_OPTIONS = [
  { value: "", label: "선택 안 함" },
  { value: "MALE", label: "남" },
  { value: "FEMALE", label: "여" },
  { value: "OTHER", label: "기타" },
];

const TYPE_OPTIONS = [
  { value: "FULL_TIME", label: "정규직" },
  { value: "CONTRACT", label: "계약직" },
  { value: "PART_TIME", label: "단시간" },
  { value: "DISPATCH", label: "파견" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-xs">
      {pending ? <Spinner size="sm" className="text-on-primary" /> : null}
      {pending ? "등록 중" : "등록"}
    </Button>
  );
}

export function CreateEmployeeDialog({
  departments,
  positions,
  managers,
}: {
  departments: Option[];
  positions: Option[];
  managers: Option[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<CreateEmployeeState, FormData>(
    createEmployeeAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const handled = useRef<CreateEmployeeState | null>(null);

  useEffect(() => {
    if (!state.ok || handled.current === state) return;
    handled.current = state;
    formRef.current?.reset();
    setOpen(false);
  }, [state]);

  return (
    <>
      <Button className="gap-xs" onClick={() => setOpen(true)}>
        <UserPlus className="size-4" />
        사원 등록
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="사원 등록"
        description="사번, 성명, 입사일, 고용형태는 필수입니다"
        className="max-h-[85vh] overflow-y-auto"
      >
        <form ref={formRef} action={formAction} className="flex flex-col gap-md">
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <Field label="사번" htmlFor="emp-no" error={state.fieldErrors?.empNo} required>
              <Input id="emp-no" name="empNo" maxLength={20} placeholder="20260901" required />
            </Field>
            <Field label="성명" htmlFor="emp-name" error={state.fieldErrors?.name} required>
              <Input id="emp-name" name="name" maxLength={50} placeholder="홍길동" required />
            </Field>
            <Field label="영문 성명" htmlFor="emp-name-en" error={state.fieldErrors?.nameEn}>
              <Input id="emp-name-en" name="nameEn" maxLength={100} placeholder="Hong Gildong" />
            </Field>
            <Field label="이메일" htmlFor="emp-email" error={state.fieldErrors?.email}>
              <Input id="emp-email" name="email" type="email" maxLength={120} />
            </Field>
            <Field
              label="주민등록번호"
              htmlFor="emp-resident"
              error={state.fieldErrors?.residentNo}
            >
              <Input
                id="emp-resident"
                name="residentNo"
                placeholder="000000-0000000"
                autoComplete="off"
              />
            </Field>
            <Field label="생년월일" htmlFor="emp-birth" error={state.fieldErrors?.birthDate}>
              <DatePicker id="emp-birth" name="birthDate" />
            </Field>
            <Field label="성별" htmlFor="emp-gender">
              <SelectMenu name="gender" ariaLabel="성별" placeholder="선택 안 함" options={GENDER_OPTIONS} />
            </Field>
            <Field label="입사일" htmlFor="emp-hire" error={state.fieldErrors?.hireDate} required>
              <DatePicker id="emp-hire" name="hireDate" required />
            </Field>
            <Field label="고용형태" htmlFor="emp-type" error={state.fieldErrors?.employmentType} required>
              <SelectMenu name="employmentType" ariaLabel="고용형태" defaultValue="FULL_TIME" options={TYPE_OPTIONS} />
            </Field>
            <Field label="부서" htmlFor="emp-dept">
              <SelectMenu
                name="departmentId"
                ariaLabel="부서"
                placeholder="선택 안 함"
                options={[{ value: "", label: "선택 안 함" }, ...departments.map((o) => ({ value: String(o.id), label: o.label }))]}
              />
            </Field>
            <Field label="직위" htmlFor="emp-position">
              <SelectMenu
                name="jobPositionId"
                ariaLabel="직위"
                placeholder="선택 안 함"
                options={[{ value: "", label: "선택 안 함" }, ...positions.map((o) => ({ value: String(o.id), label: o.label }))]}
              />
            </Field>
            <Field label="직속 상급자" htmlFor="emp-manager">
              <SelectMenu
                name="managerId"
                ariaLabel="직속 상급자"
                placeholder="선택 안 함"
                options={[{ value: "", label: "선택 안 함" }, ...managers.map((o) => ({ value: String(o.id), label: o.label }))]}
              />
            </Field>
          </div>

          {state.ok === false && state.message ? (
            <p className="flex items-center gap-xs rounded-sm bg-error-soft px-sm py-xs text-body-sm text-error-deep">
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
