
import { AppState, User } from '../types';
import { STORAGE_KEY, INITIAL_EMPLOYEES, APP_VERSION } from '../constants';

const USERS_KEY = 'wagetrack_pro_global_users';
const VERSION_KEY = 'wagetrack_app_version';

/**
 * SOURCE OF TRUTH SERVICE
 * Simulates a robust backend API with concurrency control.
 */
export const storageService = {
  // Scoped Local Cache (for offline/performance)
  loadLocal: (email: string): AppState => {
    const userStorageKey = `${STORAGE_KEY}_${email}`;
    const saved = localStorage.getItem(userStorageKey);
    return saved ? JSON.parse(saved) : { employees: INITIAL_EMPLOYEES, shifts: [], updatedAt: 0 };
  },

  saveLocal: (email: string, state: AppState) => {
    const userStorageKey = `${STORAGE_KEY}_${email}`;
    localStorage.setItem(userStorageKey, JSON.stringify(state));
  },

  // CLOUD SYNC ENGINE
  // Simulated Server-Side Logic
  pushToCloud: async (email: string, newState: AppState): Promise<{ success: boolean; remoteState?: AppState; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Network latency
    
    const cloudKey = `cloud_db_${email}`;
    const rawCloudData = localStorage.getItem(cloudKey);
    const cloudState: AppState | null = rawCloudData ? JSON.parse(rawCloudData) : null;

    // CONCURRENCY CONTROL: If cloud is newer, reject client update to prevent overwrite
    if (cloudState && cloudState.updatedAt > newState.updatedAt) {
      console.warn("Cloud data is newer. Rejecting push to prevent data loss.");
      return { 
        success: false, 
        remoteState: cloudState, 
        error: "Conflict: Cloud has more recent data." 
      };
    }

    // Success: Update Cloud with a new timestamp
    const finalizedState = { ...newState, updatedAt: Date.now() };
    localStorage.setItem(cloudKey, JSON.stringify(finalizedState));
    return { success: true, remoteState: finalizedState };
  },

  fetchFromCloud: async (email: string): Promise<AppState | null> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const cloudKey = `cloud_db_${email}`;
    const saved = localStorage.getItem(cloudKey);
    return saved ? JSON.parse(saved) : null;
  },

  // GLOBAL REGISTRY (The 'Users' Table)
  getGlobalUsers: (): User[] => {
    const saved = localStorage.getItem(USERS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  saveUserToGlobal: (user: User) => {
    const users = storageService.getGlobalUsers();
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex > -1) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // ROBUST AUTHENTICATION
  authenticate: async (email: string, pass: string): Promise<{ success: boolean; data?: AppState; error?: string }> => {
    const users = storageService.getGlobalUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user && user.password === pass) {
      // Force retrieval of latest cloud data on login to ensure consistency
      const cloudData = await storageService.fetchFromCloud(email);
      return { success: true, data: cloudData || storageService.loadLocal(email) };
    }

    return { success: false, error: 'Invalid credentials. Please verify your email and password.' };
  }
};
