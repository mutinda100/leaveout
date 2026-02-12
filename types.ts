
export type Role = 'STUDENT' | 'TEACHER' | 'NURSE' | 'SECURITY' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  role: Role;
  class?: string;
  admissionNo?: string;
  avatar?: string;
}

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXITED' | 'RETURNED';

export type LeaveType = 'NORMAL' | 'EMERGENCY';

export interface DeviceRecord {
  admNo: string;
  deviceId: string;
  registeredAt: number;
  lastUsedAt: number;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentAdmNo: string;
  type: LeaveType;
  reason: string;
  requestedAt: number;
  expectedReturnAt: number;
  validFrom?: number;
  validTo?: number;
  status: RequestStatus;
  approvedBy?: string;
  approvedAt?: number;
  exitedAt?: number;
  exitedConfirmedBy?: string;
  returnedAt?: number;
  returnedConfirmedBy?: string;
  deviceFingerprint?: string; // Track which device sent the request
}

export interface ExitLog {
  requestId: string;
  studentId: string;
  exitTime: number;
  confirmedBy: string; // security user ID
  mode: 'ONLINE' | 'OFFLINE';
}

export interface ReturnLog {
  requestId: string;
  studentId: string;
  returnedAt: number;
  confirmedBy: string; // admin or teacher user ID
  remarks?: string;
}
