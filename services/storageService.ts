
import { AppState, User } from '../types';
import { STORAGE_KEY, INITIAL_EMPLOYEES } from '../constants';

const USERS_KEY = 'wagetrack_pro_users';

export const storageService = {
  // Scoped Data Methods
  load: (username: string): AppState => {
    const userStorageKey = `${STORAGE_KEY}_${username}`;
    const saved = localStorage.getItem(userStorageKey);
    if (!saved) {
      return {
        employees: INITIAL_EMPLOYEES,
        shifts: []
      };
    }
    try {
      return JSON.parse(saved);
    } catch {
      return { employees: INITIAL_EMPLOYEES, shifts: [] };
    }
  },

  save: (username: string, state: AppState) => {
    const userStorageKey = `${STORAGE_KEY}_${username}`;
    localStorage.setItem(userStorageKey, JSON.stringify(state));
  },

  // Global Auth Methods
  getUsers: (): User[] => {
    const saved = localStorage.getItem(USERS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  saveUser: (user: User) => {
    const users = storageService.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};
