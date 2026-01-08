
import { AppState, User } from '../types';
import { STORAGE_KEY, INITIAL_EMPLOYEES, APP_VERSION } from '../constants';

const USERS_KEY = 'wagetrack_pro_users';
const VERSION_KEY = 'wagetrack_app_version';

export const storageService = {
  // Scoped Data Methods
  load: (email: string): AppState => {
    const userStorageKey = `${STORAGE_KEY}_${email}`;
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

  save: (email: string, state: AppState) => {
    const userStorageKey = `${STORAGE_KEY}_${email}`;
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

  // CROSS-DEVICE SYNC LOGIC
  // This packages everything into a portable bundle
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
    // Encoded bundle for URL sharing
    return btoa(unescape(encodeURIComponent(JSON.stringify(bundle))));
  },

  // This unpacks a bundle from another device
  applyIdentityBundle: (key: string): { success: boolean, email?: string, error?: string } => {
    try {
      const decoded = decodeURIComponent(escape(atob(key)));
      const bundle = JSON.parse(decoded);

      if (!bundle.u || !bundle.s) return { success: false, error: 'Invalid Identity Format.' };

      // Persist to the local storage of THIS device
      storageService.saveUser(bundle.u);
      storageService.save(bundle.u.email, bundle.s);

      return { success: true, email: bundle.u.email };
    } catch (e) {
      return { success: false, error: 'Identity Link is invalid or expired.' };
    }
  },

  // Generates the link to be opened on other devices
  getUniversalLink: (email: string): string => {
    const bundle = storageService.getIdentityBundle(email);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?access=${bundle}`;
  },

  // Check if current URL is an access link
  checkForAccessLink: (): { success: boolean, email?: string } => {
    const params = new URLSearchParams(window.location.search);
    const accessData = params.get('access');
    if (accessData) {
      const result = storageService.applyIdentityBundle(accessData);
      if (result.success) {
        // Clean URL after syncing
        window.history.replaceState({}, document.title, window.location.pathname);
        return { success: true, email: result.email };
      }
    }
    return { success: false };
  }
};
