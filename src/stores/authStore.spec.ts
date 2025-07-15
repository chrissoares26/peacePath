import { useAuthStore } from './authStore';

// Mock the auth service
jest.mock('../services/authService', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    signOut: jest.fn().mockResolvedValue({ success: true }),
  })),
}));

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      userProfile: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    
    expect(state.user).toBeNull();
    expect(state.userProfile).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set user and authenticated state', () => {
    const mockUser = { uid: '123', phoneNumber: '+1234567890' } as any;
    
    useAuthStore.getState().setUser(mockUser);
    
    const state = useAuthStore.getState();
    expect(state.user).toBe(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('should set loading state', () => {
    useAuthStore.getState().setLoading(true);
    
    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(true);
  });

  it('should set error state', () => {
    const errorMessage = 'Authentication failed';
    
    useAuthStore.getState().setError(errorMessage);
    
    const state = useAuthStore.getState();
    expect(state.error).toBe(errorMessage);
    expect(state.isLoading).toBe(false);
  });

  it('should clear error', () => {
    useAuthStore.getState().setError('Some error');
    useAuthStore.getState().clearError();
    
    const state = useAuthStore.getState();
    expect(state.error).toBeNull();
  });

  it('should handle sign out', async () => {
    const mockUser = { uid: '123', phoneNumber: '+1234567890' } as any;
    
    // Set initial authenticated state
    useAuthStore.getState().setUser(mockUser);
    
    // Sign out
    await useAuthStore.getState().signOut();
    
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.userProfile).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});