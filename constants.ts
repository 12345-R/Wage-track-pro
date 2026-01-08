
import { Employee } from './types';

export const MAX_EMPLOYEES = 15;

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Alex Rivera', role: 'Team Lead', hourlyRate: 25, avatar: 'https://picsum.photos/seed/alex/150' },
  { id: '2', name: 'Jordan Smith', role: 'Staff', hourlyRate: 18, avatar: 'https://picsum.photos/seed/jordan/150' },
  { id: '3', name: 'Casey Johnson', role: 'Staff', hourlyRate: 18, avatar: 'https://picsum.photos/seed/casey/150' },
];

export const STORAGE_KEY = 'wagetrack_pro_data';
