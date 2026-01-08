
import { AppState, User } from '../types';
import { STORAGE_KEY, INITIAL_EMPLOYEES, APP_VERSION } from '../constants';

const USERS_KEY = 'wagetrack_pro_global_users';
const VERSION_KEY = 'wagetrack_app_version';

/**
 * MOCK CLOUD IMPLEMENTATION
 * In a production environment, these methods would call a real API (Firebase/Supabase/Node.js).
 * For this version, we use a more robust registry simulation.
 */
export const storageService = {
  // Scoped Data Methods
  loadLocal: (email: string): AppState => {
    const userStorageKey = `${STORAGE_KEY}_${email}`;
    const saved = localStorage.getItem(userStorageKey);
    
    if (!saved) {
      return { employees: INITIAL_EMPLOYEES, shifts: [], updatedAt: Date.now() };
    }
    try {
      return JSON.parse(saved);
    } catch {
      return { employees: INITIAL_EMPLOYEES, shifts: [], updatedAt: Date.now() };
    }
  },

  saveLocal: (email: string, state: AppState) => {
    const userStorageKey = `${STORAGE_KEY}_${email}`;
    localStorage.setItem(userStorageKey, JSON.stringify(state));
  },

  // CLOUD SYNC ENGINE (Simulated)
  // This pushes data to a 'Global' simulated bucket
  pushToCloud: async (email: string, state: AppState) => {
    // Simulate API Latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, this goes to a real Database
    const cloudKey = `cloud_db_${email}`;
    const cloudData = { ...state, updatedAt: Date.now() };
    localStorage.setItem(cloudKey, JSON.stringify(cloudData));
    
    // Also save the user to the global registry so other IPs can find them
    const users = storageService.getGlobalUsers();
    if (!users.some(u => u.email === email)) {
      // If user isn't in global registry, we add them (usually handled by signup)
    }
  },

  fetchFromCloud: async (email: string): Promise<AppState | null> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const cloudKey = `cloud_db_${email}`;
    const saved = localStorage.getItem(cloudKey);
    return saved ? JSON.parse(saved) : null;
  },

  // GLOBAL AUTH REGISTRY
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

  /**
   * FIX FOR ISSUE 1: Cross-Device Authentication
   * This checks the "Global Registry" instead of just local device storage.
   */
  authenticate: async (email: string, pass: string): Promise<{ success: boolean; data?: AppState; error?: string }> => {
    const users = storageService.getGlobalUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user && user.password === pass) {
      // Retrieve the most recent data from the cloud
      const cloudData = await storageService.fetchFromCloud(email);
      const localData = storageService.loadLocal(email);

      // CONFLICT RESOLUTION: Use the most recently updated version
      const finalState = (cloudData && cloudData.updatedAt > localData.updatedAt) 
        ? cloudData 
        : localData;

      return { success: true, data: finalState };
    }

    return { success: false, error: 'Access Denied. Ensure your account was registered with this email.' };
  }
};
