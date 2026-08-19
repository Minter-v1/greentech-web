"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";

// MARK: - 셀렉트
// 네이티브 select 는 OS 가 목록을 그려 디자인 시스템 밖으로 벗어남.
// 커스텀 드롭다운 + hidden input 조합으로 폼 제출 동작은 그대로 유지

export interface SelectOption {
  value: string;
  label: string;
  /** 계층 표현용 들여쓰기 단계 */
  depth?: number;
  disabled?: boolean;
}

interface SelectMenuProps {
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  ariaLabel: string;
  className?: string;
  onValueChange?: (value: string) => void;
  panelPosition?: "fixed" | "absolute";
}

export function SelectMenu({
  name,
  options,
  defaultValue = "",
  placeholder = "선택하세요",
  ariaLabel,
  className,
  onValueChange,
  panelPosition = "absolute",
}: SelectMenuProps) {
  const [value, setValue] = useState(defaultValue);
  const selected = options.find((option) => option.value === value);

  return (
    <div className={cn("w-full", className)}>
      <input type="hidden" name={name} value={value} />
      <Dropdown
        ariaLabel={ariaLabel}
        panelPosition={panelPosition}
        label={
          <span className={cn("truncate", selected ? "text-ink" : "text-mute")}>
            {selected?.label ?? placeholder}
          </span>
        }
      >
        {(close) =>
          options.map((option) => (
            <DropdownItem
              key={option.value}
              selected={option.value === value}
              disabled={option.disabled}
              onSelect={() => {
                setValue(option.value);
                onValueChange?.(option.value);
                close();
              }}
            >
              <span
                className="truncate"
                style={option.depth ? { paddingLeft: `${option.depth * 12}px` } : undefined}
              >
                {option.label}
              </span>
              {option.value === value ? (
                <Check className="ml-auto size-3.5 shrink-0 text-ink" strokeWidth={2.5} />
              ) : null}
            </DropdownItem>
          ))
        }
      </Dropdown>
    </div>
  );
}
