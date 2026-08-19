"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { CONTROL_BASE } from "@/components/ui/control-styles";
import { Dropdown } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";

// MARK: - 날짜 입력

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function displayDate(value?: string): string {
  const date = parseDate(value);
  return date ? `${date.getFullYear()}. ${pad(date.getMonth() + 1)}. ${pad(date.getDate())}.` : "날짜 선택";
}

function usePickerValue({
  value,
  defaultValue = "",
  onValueChange,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = controlled ? value : internalValue;

  const updateValue = (next: string) => {
    if (!controlled) setInternalValue(next);
    onValueChange?.(next);
  };

  return { currentValue, updateValue, reset: () => !controlled && setInternalValue(defaultValue) };
}

function useFormReset(ref: React.RefObject<HTMLDivElement | null>, reset: () => void) {
  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const onReset = () => window.setTimeout(reset, 0);
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [ref, reset]);
}

interface CalendarProps {
  selected?: string;
  min?: string;
  max?: string;
  onSelect: (value: string) => void;
}

function Calendar({ selected, min, max, onSelect }: CalendarProps) {
  const selectedDate = parseDate(selected);
  const [view, setView] = useState(() => selectedDate ?? new Date());
  const today = toDateValue(new Date());

  const days = useMemo(() => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const dayCount = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: dayCount }, (_, index) => index + 1),
    ];
  }, [view]);

  const moveMonth = (offset: number) => {
    setView((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <div className="w-[280px] p-xs">
      <div className="mb-xs flex items-center justify-between">
        <button
          type="button"
          aria-label="이전 달"
          onClick={() => moveMonth(-1)}
          className="rounded-sm p-xs text-body transition-interactive focus-ring hover:bg-canvas-soft-2 hover:text-ink"
        >
          <ChevronLeft className="size-4" />
        </button>
        <strong className="text-body-sm font-medium tabular-nums">
          {view.getFullYear()}년 {view.getMonth() + 1}월
        </strong>
        <button
          type="button"
          aria-label="다음 달"
          onClick={() => moveMonth(1)}
          className="rounded-sm p-xs text-body transition-interactive focus-ring hover:bg-canvas-soft-2 hover:text-ink"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-xxs text-center">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-xxs text-caption font-medium text-mute">
            {day}
          </span>
        ))}
        {days.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} />;
          const dateValue = `${view.getFullYear()}-${pad(view.getMonth() + 1)}-${pad(day)}`;
          const active = dateValue === selected;
          const disabled = Boolean((min && dateValue < min) || (max && dateValue > max));
          return (
            <button
              key={dateValue}
              type="button"
              disabled={disabled}
              aria-current={dateValue === today ? "date" : undefined}
              aria-pressed={active}
              onClick={() => onSelect(dateValue)}
              className={cn(
                "flex size-8 items-center justify-center rounded-sm text-body-sm tabular-nums",
                "transition-interactive focus-ring disabled:cursor-not-allowed disabled:text-hairline-strong",
                active
                  ? "bg-primary font-medium text-on-primary"
                  : "text-body hover:bg-canvas-soft-2 hover:text-ink",
                dateValue === today && !active && "font-medium text-ink ring-1 ring-inset ring-hairline-strong/45",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface PickerBaseProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  ariaLabel?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  panelPosition?: "fixed" | "absolute";
}

interface DatePickerProps extends PickerBaseProps {
  min?: string;
  max?: string;
}

export function DatePicker({
  id,
  name,
  value,
  defaultValue,
  onValueChange,
  ariaLabel = "날짜",
  className,
  required,
  disabled,
  panelPosition = "absolute",
  min,
  max,
}: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const picker = usePickerValue({ value, defaultValue, onValueChange });
  useFormReset(rootRef, picker.reset);

  return (
    <div ref={rootRef} className={cn("w-full", className)}>
      {name ? <input type="hidden" name={name} value={picker.currentValue} /> : null}
      <Dropdown
        triggerId={id}
        ariaLabel={ariaLabel}
        disabled={disabled}
        panelPosition={panelPosition}
        panelRole="dialog"
        panelClassName="w-max min-w-full"
        label={
          <>
            <CalendarDays className="size-4 shrink-0 text-mute" aria-hidden />
            <span className={cn("truncate tabular-nums", picker.currentValue ? "text-ink" : "text-mute")}>
              {displayDate(picker.currentValue)}
            </span>
          </>
        }
      >
        {(close) => (
          <>
            <Calendar
              selected={picker.currentValue}
              min={min}
              max={max}
              onSelect={(next) => {
                picker.updateValue(next);
                close();
              }}
            />
            {!required && picker.currentValue ? (
              <div className="border-t border-hairline px-xs pt-xxs">
                <button
                  type="button"
                  onClick={() => {
                    picker.updateValue("");
                    close();
                  }}
                  className="flex w-full items-center justify-center gap-xxs rounded-sm px-xs py-xs text-caption text-mute transition-interactive focus-ring hover:bg-canvas-soft-2 hover:text-ink"
                >
                  <X className="size-3.5" />
                  선택 해제
                </button>
              </div>
            ) : null}
          </>
        )}
      </Dropdown>
    </div>
  );
}

export function MonthPicker({
  id,
  name,
  value,
  defaultValue,
  onValueChange,
  ariaLabel = "월",
  className,
  disabled,
  panelPosition = "absolute",
}: PickerBaseProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const picker = usePickerValue({ value, defaultValue, onValueChange });
  const initialYear = Number(picker.currentValue.slice(0, 4)) || new Date().getFullYear();
  const [year, setYear] = useState(initialYear);
  useFormReset(rootRef, picker.reset);

  return (
    <div ref={rootRef} className={cn("w-full", className)}>
      {name ? <input type="hidden" name={name} value={picker.currentValue} /> : null}
      <Dropdown
        triggerId={id}
        ariaLabel={ariaLabel}
        disabled={disabled}
        panelPosition={panelPosition}
        panelRole="dialog"
        panelClassName="w-max min-w-full"
        label={
          <>
            <CalendarDays className="size-4 shrink-0 text-mute" aria-hidden />
            <span className={cn("truncate tabular-nums", picker.currentValue ? "text-ink" : "text-mute")}>
              {picker.currentValue ? picker.currentValue.replace("-", "년 ") + "월" : "월 선택"}
            </span>
          </>
        }
      >
        {(close) => (
          <div className="w-[260px] p-xs">
            <div className="mb-xs flex items-center justify-between">
              <button type="button" aria-label="이전 연도" onClick={() => setYear((value) => value - 1)} className="rounded-sm p-xs text-body transition-interactive focus-ring hover:bg-canvas-soft-2 hover:text-ink">
                <ChevronLeft className="size-4" />
              </button>
              <strong className="text-body-sm font-medium tabular-nums">{year}년</strong>
              <button type="button" aria-label="다음 연도" onClick={() => setYear((value) => value + 1)} className="rounded-sm p-xs text-body transition-interactive focus-ring hover:bg-canvas-soft-2 hover:text-ink">
                <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-xxs">
              {MONTHS.map((month) => {
                const next = `${year}-${pad(month)}`;
                const active = picker.currentValue === next;
                return (
                  <button
                    key={month}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      picker.updateValue(next);
                      close();
                    }}
                    className={cn(
                      "rounded-sm px-sm py-xs text-body-sm tabular-nums transition-interactive focus-ring",
                      active ? "bg-primary font-medium text-on-primary" : "text-body hover:bg-canvas-soft-2 hover:text-ink",
                    )}
                  >
                    {month}월
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Dropdown>
    </div>
  );
}

export function DateTimePicker({
  id,
  name,
  value,
  defaultValue,
  onValueChange,
  ariaLabel = "날짜와 시간",
  className,
  disabled,
  panelPosition = "absolute",
}: PickerBaseProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const picker = usePickerValue({ value, defaultValue, onValueChange });
  const [date = "", time = "00:00"] = picker.currentValue.split("T");
  useFormReset(rootRef, picker.reset);

  const updateDate = (nextDate: string) => picker.updateValue(`${nextDate}T${time || "00:00"}`);
  const updateTime = (nextTime: string) => {
    const nextDate = date || toDateValue(new Date());
    picker.updateValue(`${nextDate}T${nextTime}`);
  };

  return (
    <div ref={rootRef} className={cn("w-full", className)}>
      {name ? <input type="hidden" name={name} value={picker.currentValue} /> : null}
      <Dropdown
        triggerId={id}
        ariaLabel={ariaLabel}
        disabled={disabled}
        panelPosition={panelPosition}
        panelRole="dialog"
        panelClassName="w-max min-w-full"
        label={
          <>
            <CalendarDays className="size-4 shrink-0 text-mute" aria-hidden />
            <span className={cn("truncate tabular-nums", picker.currentValue ? "text-ink" : "text-mute")}>
              {picker.currentValue ? `${displayDate(date)} ${time}` : "날짜와 시간 선택"}
            </span>
          </>
        }
      >
        {() => (
          <>
            <Calendar selected={date} onSelect={updateDate} />
            <div className="flex items-center gap-xs border-t border-hairline px-sm py-xs">
              <Clock className="size-4 shrink-0 text-mute" aria-hidden />
              <span className="text-caption font-medium text-body">시간</span>
              <input
                type="time"
                value={time}
                step={600}
                aria-label={`${ariaLabel} 시간`}
                onChange={(event) => updateTime(event.target.value)}
                className={cn(
                  CONTROL_BASE,
                  "ml-auto h-8 w-[112px] px-xs tabular-nums [&::-webkit-calendar-picker-indicator]:hidden",
                )}
              />
            </div>
          </>
        )}
      </Dropdown>
    </div>
  );
}
