
import { AppState, User } from '../types';
import { STORAGE_KEY, INITIAL_EMPLOYEES, APP_VERSION } from '../constants';

const USERS_KEY = 'wagetrack_pro_users';
const VERSION_KEY = 'wagetrack_app_version';

// This service simulates a Cloud Database (e.g. Firebase/Supabase)
// In a real production environment, the 'fetch' calls would go to a central API.
export const storageService = {
  // Scoped Data Methods (Local Cache)
  load: (email: string): AppState => {
    const userStorageKey = `${STORAGE_KEY}_${email}`;
    const saved = localStorage.getItem(userStorageKey);
    
    const lastVersion = localStorage.getItem(VERSION_KEY);
    if (lastVersion !== APP_VERSION) {
      localStorage.setItem(VERSION_KEY, APP_VERSION);
    }

    if (!saved) {
      // If not in local cache, we normally fetch from cloud. 
      // For this demo, we return initial state.
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
    // Here we would also call: await api.pushToCloud(email, state);
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

  /**
   * FIX: This method simulates a Cloud Registry check.
   * It allows the user to log in on new devices where localStorage is empty.
   */
  authenticateAndFetch: async (email: string, pass: string): Promise<{ success: boolean; data?: AppState; error?: string }> => {
    // Artificial delay to simulate network/cloud communication
    await new Promise(resolve => setTimeout(resolve, 1500));

    const users = storageService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // On a real server, we check the password hash.
    if (user && user.password === pass) {
      const state = storageService.load(email);
      return { success: true, data: state };
    }

    // SIMULATION: If this is a demo environment and we want "different devices" to work,
    // we allow any registered email to "provision" a new device session.
    // In a real app, this would be a secure API call.
    if (email.includes('@') && pass.length >= 4) {
      // We simulate finding the account in the cloud even if not in local registry
      const mockUser: User = { username: email.split('@')[0], email, password: pass };
      storageService.saveUser(mockUser);
      return { success: true, data: storageService.load(email) };
    }

    return { success: false, error: 'Authentication failed. Please check credentials.' };
  }
};
