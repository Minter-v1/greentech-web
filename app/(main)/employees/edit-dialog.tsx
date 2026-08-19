"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CircleAlert, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, Input, Textarea } from "@/components/ui/field";
import { SelectMenu } from "@/components/ui/select-menu";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import type { EmployeeDetailRes } from "@/lib/api/types";
import { patchEmployeeAction, type CreateEmployeeState } from "./actions";

// MARK: - 사원 정보 수정 다이얼로그
// 보낸 키만 반영되므로 폼에 없는 필드는 건드리지 않음

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
      저장
    </Button>
  );
}

export function EditEmployeeDialog({
  employee,
  departments,
  positions,
  managers,
}: {
  employee: EmployeeDetailRes;
  departments: Option[];
  positions: Option[];
  managers: Option[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<CreateEmployeeState, FormData>(
    patchEmployeeAction.bind(null, employee.id),
    {},
  );
  const handled = useRef<CreateEmployeeState | null>(null);

  useEffect(() => {
    if (!state.ok || handled.current === state) return;
    handled.current = state;
    setOpen(false);
  }, [state]);

  return (
    <>
      <Button variant="secondary" className="gap-xs" onClick={() => setOpen(true)}>
        <Pencil className="size-4" />
        정보 수정
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="사원 정보 수정"
        description={`사번 ${employee.empNo} 는 변경할 수 없습니다. 재직 상태는 목록에서 변경하세요`}
      >
        <form action={formAction} className="flex flex-col gap-md">
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <Field label="성명" htmlFor="edit-name" error={state.fieldErrors?.name} required>
              <Input id="edit-name" name="name" defaultValue={employee.name} required />
            </Field>
            <Field label="영문 성명" htmlFor="edit-name-en" error={state.fieldErrors?.nameEn}>
              <Input id="edit-name-en" name="nameEn" defaultValue={employee.nameEn ?? ""} />
            </Field>
            <Field label="이메일" htmlFor="edit-email" error={state.fieldErrors?.email}>
              <Input
                id="edit-email"
                name="email"
                type="email"
                defaultValue={employee.email ?? ""}
              />
            </Field>
            <Field label="생년월일" htmlFor="edit-birth" error={state.fieldErrors?.birthDate}>
              <DatePicker
                id="edit-birth"
                name="birthDate"
                defaultValue={employee.birthDate ?? ""}
              />
            </Field>
            <Field label="성별" htmlFor="edit-gender">
              <SelectMenu name="gender" ariaLabel="성별" defaultValue={employee.gender ?? ""} placeholder="선택 안 함" options={GENDER_OPTIONS} />
            </Field>
            <Field label="고용형태" htmlFor="edit-type" required>
              <SelectMenu name="employmentType" ariaLabel="고용형태" defaultValue={employee.employmentType} options={TYPE_OPTIONS} />
            </Field>
            <Field label="부서" htmlFor="edit-dept">
              <SelectMenu
                name="departmentId"
                ariaLabel="부서"
                defaultValue={employee.departmentId ? String(employee.departmentId) : ""}
                placeholder="선택 안 함"
                options={[{ value: "", label: "선택 안 함" }, ...departments.map((o) => ({ value: String(o.id), label: o.label }))]}
              />
            </Field>
            <Field label="직위" htmlFor="edit-position">
              <SelectMenu
                name="jobPositionId"
                ariaLabel="직위"
                defaultValue={employee.jobPositionId ? String(employee.jobPositionId) : ""}
                placeholder="선택 안 함"
                options={[{ value: "", label: "선택 안 함" }, ...positions.map((o) => ({ value: String(o.id), label: o.label }))]}
              />
            </Field>
            <Field label="직속 상급자" htmlFor="edit-manager">
              <SelectMenu
                name="managerId"
                ariaLabel="직속 상급자"
                defaultValue={employee.managerId ? String(employee.managerId) : ""}
                placeholder="선택 안 함"
                options={[{ value: "", label: "선택 안 함" }, ...managers.map((o) => ({ value: String(o.id), label: o.label }))]}
              />
            </Field>
          </div>

          <Field label="발령 사유" htmlFor="edit-reason">
            <Textarea
              id="edit-reason"
              name="reason"
              rows={2}
              maxLength={500}
              placeholder="부서나 직위를 바꿀 때 발령 이력에 남을 사유"
            />
          </Field>

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
