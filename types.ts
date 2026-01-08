
export interface Employee {
  id: string;
  name: string;
  role: string;
  hourlyRate: number;
  avatar: string;
  emoji?: string; // Optional emoji identifier
}

export interface Shift {
  id: string;
  employeeId: string;
  date: string; // ISO Date String
  clockIn: string; // HH:mm
  clockOut?: string; // HH:mm
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
}

export type View = 'dashboard' | 'employees' | 'shifts' | 'ai-insights' | 'reports';
