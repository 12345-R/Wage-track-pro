
import { AppState, User, AuthResponse } from '../types';
import { STORAGE_KEY, INITIAL_EMPLOYEES } from '../constants';

const GLOBAL_DB_KEY = 'wagetrack_remote_database'; // Simulation of a central DB
const SESSION_TOKEN_KEY = 'wagetrack_auth_token';

/**
 * MOCK BACKEND API
 * In a real-world scenario, these methods would be fetch() calls to a Node/Python/Go backend.
 */
export const storageService = {
  
  // --- PRIVATE SIMULATED DATABASE HELPERS ---
  _getRemoteDB: () => {
    const db = localStorage.getItem(GLOBAL_DB_KEY);
    return db ? JSON.parse(db) : { users: [], data: {} };
  },

  _saveRemoteDB: (db: any) => {
    localStorage.setItem(GLOBAL_DB_KEY, JSON.stringify(db));
  },

  // --- AUTHENTICATION API ---
  
  login: async (email: string, pass: string): Promise<AuthResponse> => {
    await new Promise(r => setTimeout(r, 800)); // Network delay
    const db = storageService._getRemoteDB();
    const user = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());

    if (user && user.password === pass) {
      // Generate a stateless "Token" (In reality, a JWT from the server)
      const token = btoa(`${email}:${Date.now()}`);
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      return { success: true, token, email };
    }
    return { success: false, error: 'Invalid credentials. Account not found or password incorrect.' };
  },

  register: async (user: User): Promise<AuthResponse> => {
    await new Promise(r => setTimeout(r, 1000));
    const db = storageService._getRemoteDB();
    
    if (db.users.some((u: User) => u.email.toLowerCase() === user.email.toLowerCase())) {
      return { success: false, error: 'This business email is already registered.' };
    }

    db.users.push(user);
    // Initialize empty data for new user
    db.data[user.email] = { 
      employees: INITIAL_EMPLOYEES, 
      shifts: [], 
      updatedAt: Date.now(), 
      version: 1 
    };
    
    storageService._saveRemoteDB(db);
    return { success: true };
  },

  // --- DATA ACCESS API (USER-SCOPED) ---

  fetchData: async (token: string): Promise<AppState | null> => {
    try {
      const email = atob(token).split(':')[0];
      const db = storageService._getRemoteDB();
      return db.data[email] || null;
    } catch {
      return null;
    }
  },

  /**
   * PUSH DATA (With Optimistic Concurrency Control)
   * This is the fix for multi-device data corruption.
   */
  pushData: async (token: string, clientState: AppState): Promise<{ success: boolean; latestState?: AppState; error?: string }> => {
    await new Promise(r => setTimeout(r, 500));
    
    const email = atob(token).split(':')[0];
    const db = storageService._getRemoteDB();
    const serverState: AppState = db.data[email];

    // OCC Check: Reject if client's version is behind the server's version
    if (serverState && serverState.version > clientState.version) {
      console.warn("OCC Conflict: Server has version " + serverState.version + ", client has " + clientState.version);
      return { 
        success: false, 
        latestState: serverState, 
        error: "Conflict detected: Data was updated on another device. Syncing now..." 
      };
    }

    // Accept update and increment version
    const newState = { 
      ...clientState, 
      version: (serverState?.version || 0) + 1, 
      updatedAt: Date.now() 
    };
    
    db.data[email] = newState;
    storageService._saveRemoteDB(db);
    
    return { success: true, latestState: newState };
  },

  logout: () => {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  },

  getAuthToken: () => localStorage.getItem(SESSION_TOKEN_KEY)
};
