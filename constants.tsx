
import { User, Role, RequestStatus, LeaveType } from './types';

export const Roles: Record<string, Role> = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  NURSE: 'NURSE',
  SECURITY: 'SECURITY',
  ADMIN: 'ADMIN',
};

export const RequestStatuses: Record<string, RequestStatus> = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXITED: 'EXITED',
  RETURNED: 'RETURNED',
};

export const LeaveTypes: Record<string, LeaveType> = {
  NORMAL: 'NORMAL',
  EMERGENCY: 'EMERGENCY',
};

export const STAFF_USERS: User[] = [
  { id: 'admin1', name: 'Geraid Mutegi', role: 'ADMIN', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Geraid' },
  { id: 'nurse1', name: 'Nurse Joy', role: 'NURSE', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joy' },
  { id: 'sec1', name: 'Officer Mutua', role: 'SECURITY', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mutua' },
  { id: 'teacher1', name: 'Mr. Kamau', role: 'TEACHER', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kamau' },
];
