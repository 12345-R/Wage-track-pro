
import { AppState, User } from '../types';
import { STORAGE_KEY, INITIAL_EMPLOYEES, APP_VERSION } from '../constants';

const USERS_KEY = 'wagetrack_pro_users';
const VERSION_KEY = 'wagetrack_app_version';

export const storageService = {
  // Scoped Data Methods
  load: (username: string): AppState => {
    const userStorageKey = `${STORAGE_KEY}_${username}`;
    const saved = localStorage.getItem(userStorageKey);
    
    const lastVersion = localStorage.getItem(VERSION_KEY);
    if (lastVersion !== APP_VERSION) {
      localStorage.setItem(VERSION_KEY, APP_VERSION);
    }

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
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    
    if (existingIndex > -1) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  updateUserPassword: (email: string, newPassword: string) => {
    const users = storageService.getUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (index !== -1) {
      users[index].password = newPassword;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return true;
    }
    return false;
  },

  // Identity & Sync Fix: Generate a "Business Identity Key" for cross-device restoration
  getIdentityKey: (email: string): string => {
    const users = storageService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return '';

    const state = storageService.load(email);
    const bundle = {
      user,
      state,
      ts: Date.now(),
      v: APP_VERSION
    };
    // Base64 encoding for portability
    return btoa(unescape(encodeURIComponent(JSON.stringify(bundle))));
  },

  restoreFromIdentityKey: (key: string): { success: boolean; email?: string; error?: string } => {
    try {
      const decoded = decodeURIComponent(escape(atob(key)));
      const bundle = JSON.parse(decoded);

      if (!bundle.user || !bundle.state) {
        return { success: false, error: 'Invalid Identity Key.' };
      }

      // Restore user and state to local storage
      storageService.saveUser(bundle.user);
      storageService.save(bundle.user.email, bundle.state);

      return { success: true, email: bundle.user.email };
    } catch (e) {
      return { success: false, error: 'Could not verify Identity Key. Check the code and try again.' };
    }
  }
};
