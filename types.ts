
export interface Employee {
  id: string;
  name: string;
  role: string;
  hourlyRate: number;
  avatar: string;
  emoji?: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  totalHours: number;
  earnedWage: number;
}

export interface User {
  username: string;
  password: string; 
  email: string; 
}

export interface AppState {
  employees: Employee[];
  shifts: Shift[];
  updatedAt: number;
  version: number; // Incrementing version counter for OCC
}

export type View = 'dashboard' | 'employees' | 'shifts' | 'ai-insights' | 'reports';

export interface AuthResponse {
  success: boolean;
  token?: string;
  email?: string;
  error?: string;
}
