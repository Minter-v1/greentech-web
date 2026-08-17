import { apiFetch } from "./client";
import type { AttendanceMonthlyRes, AttendanceRes, WorkCalendarRes } from "./types";

// MARK: - 근태

export function getMyAttendance(yearMonth: string) {
  return apiFetch<AttendanceMonthlyRes>("/api/v1/attendances/me", { query: { yearMonth } });
}

export function getEmployeeAttendance(employeeId: number, yearMonth: string) {
  return apiFetch<AttendanceMonthlyRes>(`/api/v1/attendances/employees/${employeeId}`, {
    query: { yearMonth },
  });
}

export function checkIn() {
  return apiFetch<AttendanceRes>("/api/v1/attendances/check-in", { method: "POST" });
}

export function checkOut() {
  return apiFetch<AttendanceRes>("/api/v1/attendances/check-out", { method: "POST" });
}

export function getWorkCalendar(from: string, to: string) {
  return apiFetch<WorkCalendarRes[]>("/api/v1/attendances/calendar", { query: { from, to } });
}
