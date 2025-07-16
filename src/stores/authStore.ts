import { create } from 'zustand';
import { User } from 'firebase/auth';
import { AuthService, UserProfile } from '../services/authService';

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  setUser: (user: User | null) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false 
  }),

  setUserProfile: (profile: UserProfile | null) => set({ 
    userProfile: profile 
  }),

  setLoading: (loading: boolean) => set({ 
    isLoading: loading 
  }),

  setError: (error: string | null) => set({ 
    error,
    isLoading: false 
  }),

  signOut: async () => {
    set({ isLoading: true });
    const authService = new AuthService();
    const result = await authService.signOut();
    
    if (result.success) {
      set({ 
        user: null, 
        userProfile: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null 
      });
    } else {
      set({ 
        error: result.error || 'Failed to sign out',
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));