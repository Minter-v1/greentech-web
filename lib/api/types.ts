// MARK: - greentech-was API 타입

// MARK: 공통 응답
export interface FieldErrorRes {
  field?: string;
  rejectedValue?: unknown;
  message?: string;
}

export interface ApiResult<T> {
  success: boolean;
  code: string;
  message: string;
  data?: T;
  fieldErrors?: FieldErrorRes[];
  path?: string;
  timestamp: string;
}

export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}

// MARK: 열거형
export type EmploymentType = "FULL_TIME" | "CONTRACT" | "PART_TIME" | "DISPATCH";
export type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "RESIGNED";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type AttendanceStatus =
  | "NORMAL"
  | "LATE"
  | "EARLY_LEAVE"
  | "ABSENT"
  | "ON_LEAVE"
  | "HOLIDAY";
export type ApprovalStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "CANCELED";
export type OvertimeType = "EXTENDED" | "NIGHT" | "HOLIDAY";
export type PayrollRunStatus = "DRAFT" | "CALCULATED" | "CONFIRMED" | "CANCELED";
export type Degree = "HIGH_SCHOOL" | "ASSOCIATE" | "BACHELOR" | "MASTER" | "DOCTOR";
export type FamilyRelation = "SPOUSE" | "CHILD" | "PARENT" | "SIBLING" | "OTHER";
export type ChangeType =
  | "HIRE"
  | "PROMOTION"
  | "TRANSFER"
  | "LEAVE_OF_ABSENCE"
  | "REINSTATE"
  | "RESIGN";
export type DayType = "WORKDAY" | "WEEKEND" | "HOLIDAY";
export type PayslipItemType = "EARNING" | "DEDUCTION";
export type AttachmentOwnerType = "EMPLOYEE" | "CERTIFICATE" | "LEAVE_REQUEST" | "PAYSLIP";
export type AttachmentCategory =
  | "PROFILE_PHOTO"
  | "CERTIFICATE_SCAN"
  | "PROOF_DOCUMENT"
  | "ETC";

// MARK: 인증
export interface LoginReq {
  username: string;
  password: string;
}

export interface LoginRes {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: string;
  username: string;
  employeeId?: number;
  employeeName?: string;
  roles: string[];
}

export interface MeRes {
  userId: number;
  username: string;
  employeeId?: number;
  empNo?: string;
  name?: string;
  departmentName?: string;
  positionName?: string;
  roles: string[];
}

// MARK: 조직
export interface DepartmentRes {
  id: number;
  code: string;
  name: string;
  parentId?: number;
  sortOrder?: number;
  active: boolean;
}

export interface DepartmentTreeRes {
  id: number;
  code: string;
  name: string;
  active: boolean;
  children: DepartmentTreeRes[];
}

export interface DepartmentCreateReq {
  code: string;
  name: string;
  parentId?: number;
  sortOrder?: number;
}

export interface DepartmentUpdateReq {
  name: string;
  parentId?: number;
  sortOrder?: number;
}

export interface JobPositionRes {
  id: number;
  code: string;
  name: string;
  levelNo: number;
  active: boolean;
}

export interface JobPositionCreateReq {
  code: string;
  name: string;
  levelNo: number;
}

// MARK: 사원
export interface EmployeeSummaryRes {
  id: number;
  empNo: string;
  name: string;
  departmentName?: string;
  positionName?: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  hireDate: string;
  email?: string;
}

export interface EmployeeDetailRes {
  id: number;
  empNo: string;
  name: string;
  nameEn?: string;
  residentNoMasked?: string;
  birthDate?: string;
  gender?: Gender;
  email?: string;
  departmentId?: number;
  departmentName?: string;
  jobPositionId?: number;
  positionName?: string;
  managerId?: number;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  hireDate: string;
  resignDate?: string;
}

export interface EmployeeSearchParams extends PageParams {
  keyword?: string;
  departmentId?: number;
  status?: EmployeeStatus;
}

/**
 * NOTE: WAS의 update는 부분 갱신이 아님. name 외 필드도 null-guard 없이 덮어쓰므로
 * 빠뜨린 값은 지워짐. 항상 현재 상세를 읽어 전체를 실어 보낼 것
 */
export interface EmployeeUpdateReq {
  name: string;
  nameEn?: string;
  birthDate?: string;
  gender?: Gender;
  email?: string;
  departmentId?: number;
  jobPositionId?: number;
  managerId?: number;
  employmentType?: EmploymentType;
  status?: EmployeeStatus;
}

export interface EmployeeResignReq {
  resignDate: string;
  reason?: string;
}

export interface EmployeeContactRes {
  id: number;
  employeeId: number;
  mobile?: string;
  tel?: string;
  zipCode?: string;
  address1?: string;
  address2?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
}

export interface EducationRes {
  id: number;
  schoolName: string;
  major?: string;
  degree?: Degree;
  admissionDate?: string;
  graduationDate?: string;
  graduated?: boolean;
}

export interface CertificateRes {
  id: number;
  name: string;
  issuer?: string;
  licenseNo?: string;
  acquiredDate?: string;
  expiryDate?: string;
}

export interface FamilyMemberRes {
  id: number;
  name: string;
  relation: FamilyRelation;
  birthDate?: string;
  dependent?: boolean;
  cohabiting?: boolean;
}

export interface EmploymentHistoryRes {
  id: number;
  changeType: ChangeType;
  effectiveDate: string;
  beforeDepartmentId?: number;
  afterDepartmentId?: number;
  beforePositionId?: number;
  afterPositionId?: number;
  reason?: string;
}

// MARK: 근태
export interface AttendanceRes {
  id: number;
  employeeId: number;
  workDate: string;
  checkInAt?: string;
  checkOutAt?: string;
  workMinutes: number;
  overtimeMinutes: number;
  nightMinutes: number;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceMonthlyRes {
  employeeId: number;
  yearMonth: string;
  workedDays: number;
  lateDays: number;
  absentDays: number;
  totalWorkMinutes: number;
  totalOvertimeMinutes: number;
  totalNightMinutes: number;
  records: AttendanceRes[];
}

export interface WorkCalendarRes {
  id: number;
  calendarDate: string;
  dayType: DayType;
  holidayName?: string;
}

// MARK: 휴가
export interface LeaveTypeRes {
  id: number;
  code: string;
  name: string;
  paid: boolean;
  deductAnnual: boolean;
  maxDaysPerYear?: number;
}

export interface LeaveBalanceRes {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  leaveTypeName: string;
  year: number;
  grantedDays: number;
  usedDays: number;
  remainingDays: number;
  expiresOn?: string;
}

export interface LeaveRequestRes {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  days: number;
  halfDay: boolean;
  reason?: string;
  status: ApprovalStatus;
  approverId?: number;
  approvedAt?: string;
  rejectReason?: string;
}

export interface LeaveRequestCreateReq {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  halfDay?: boolean;
  reason?: string;
}

// MARK: 연장근무
export interface OvertimeRequestRes {
  id: number;
  employeeId: number;
  employeeName: string;
  workDate: string;
  startAt: string;
  endAt: string;
  minutes: number;
  overtimeType: OvertimeType;
  reason?: string;
  status: ApprovalStatus;
  approverId?: number;
  approvedAt?: string;
}

export interface OvertimeCreateReq {
  workDate: string;
  startAt: string;
  endAt: string;
  overtimeType: OvertimeType;
  reason?: string;
}

// MARK: 급여
export interface PayrollRunRes {
  id: number;
  payYearMonth: string;
  status: PayrollRunStatus;
  payDate?: string;
  targetCount: number;
  totalGross: number;
  totalDeduction: number;
  totalNet: number;
  executedBy?: string;
  executedAt?: string;
  confirmedAt?: string;
}

export interface PayslipSummaryRes {
  id: number;
  payYearMonth: string;
  employeeId: number;
  empNo: string;
  employeeName: string;
  departmentName?: string;
  grossPay: number;
  totalDeduction: number;
  netPay: number;
}

export interface PayslipItemRes {
  itemCode: string;
  itemName: string;
  itemType: PayslipItemType;
  amount: number;
  note?: string;
}

export interface PayslipRes extends PayslipSummaryRes {
  positionName?: string;
  workDays: number;
  overtimeMinutes: number;
  items: PayslipItemRes[];
}

// MARK: 첨부파일
export interface AttachmentRes {
  id: number;
  ownerType: AttachmentOwnerType;
  ownerId: number;
  category: AttachmentCategory;
  originalName: string;
  contentType?: string;
  fileSize: number;
  createdBy?: string;
  createdAt: string;
}
