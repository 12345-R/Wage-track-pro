
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

  // Migration & Sync Logic for Cross-Device Support
  getIdentityBundle: (email: string): string => {
    const users = storageService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return '';

    const state = storageService.load(email);
    const bundle = {
      u: user,
      s: state,
      v: APP_VERSION,
      ts: Date.now()
    };
    // Portable Base64 string
    return btoa(unescape(encodeURIComponent(JSON.stringify(bundle))));
  },

  applyIdentityBundle: (key: string): { success: boolean, email?: string, error?: string } => {
    try {
      const decoded = decodeURIComponent(escape(atob(key)));
      const bundle = JSON.parse(decoded);

      if (!bundle.u || !bundle.s) return { success: false, error: 'Invalid Identity Format.' };

      // Persist to this device
      storageService.saveUser(bundle.u);
      storageService.save(bundle.u.email, bundle.s);

      return { success: true, email: bundle.u.email };
    } catch (e) {
      return { success: false, error: 'Failed to decrypt bundle. Please check the key.' };
    }
  },

  getSyncUrl: (email: string): string => {
    const bundle = storageService.getIdentityBundle(email);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?sync=${bundle}`;
  },

  checkForSyncUrl: (): { success: boolean, email?: string } => {
    const params = new URLSearchParams(window.location.search);
    const syncData = params.get('sync');
    if (syncData) {
      const result = storageService.applyIdentityBundle(syncData);
      if (result.success) {
        // Clean URL after sync
        window.history.replaceState({}, document.title, window.location.pathname);
        return { success: true, email: result.email };
      }
    }
    return { success: false };
  }
};
