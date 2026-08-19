"use client";

import { Toggle } from "@/components/ui/toggle";
import { toggleDepartmentActiveAction, togglePositionActiveAction } from "./actions";

// MARK: - 사용 여부 토글 바인딩

export function PositionActiveToggle({
  positionId,
  name,
  active,
}: {
  positionId: number;
  name: string;
  active: boolean;
}) {
  return (
    <Toggle
      checked={active}
      label={`${name} 사용 여부`}
      onToggle={(next) => togglePositionActiveAction(positionId, next)}
    />
  );
}

export function DepartmentActiveToggle({
  departmentId,
  name,
  active,
}: {
  departmentId: number;
  name: string;
  active: boolean;
}) {
  return (
    <Toggle
      checked={active}
      label={`${name} 사용 여부`}
      onToggle={(next) => toggleDepartmentActiveAction(departmentId, next)}
    />
  );
}
