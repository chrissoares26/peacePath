import { AuthService } from './authService';

// Mock Firebase
jest.mock('../../firebase.config', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    currentUser: null,
  },
  db: {},
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return current user from auth', () => {
      const result = authService.getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should call Firebase signOut', async () => {
      const mockSignOut = require('firebase/auth').signOut;
      mockSignOut.mockResolvedValue(undefined);

      const result = await authService.signOut();
      
      expect(mockSignOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should handle signOut errors', async () => {
      const mockSignOut = require('firebase/auth').signOut;
      mockSignOut.mockRejectedValue(new Error('Sign out failed'));

      const result = await authService.signOut();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Sign out failed');
    });
  });

  describe('signInWithEmail', () => {
    it('should sign in with email and password', async () => {
      const mockSignIn = require('firebase/auth').signInWithEmailAndPassword;
      const mockUser = { uid: '123', email: 'test@test.com' };
      mockSignIn.mockResolvedValue({ user: mockUser });

      const result = await authService.signInWithEmail('test@test.com', 'password');
      
      expect(mockSignIn).toHaveBeenCalledWith(expect.anything(), 'test@test.com', 'password');
      expect(result.success).toBe(true);
      expect(result.user).toBe(mockUser);
    });

    it('should handle signIn errors', async () => {
      const mockSignIn = require('firebase/auth').signInWithEmailAndPassword;
      mockSignIn.mockRejectedValue(new Error('Invalid credentials'));

      const result = await authService.signInWithEmail('test@test.com', 'wrongpassword');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('signUpWithEmail', () => {
    it('should sign up with email, password, and phone', async () => {
      const mockSignUp = require('firebase/auth').createUserWithEmailAndPassword;
      const mockSetDoc = require('firebase/firestore').setDoc;
      const mockUser = { uid: '123', email: 'test@test.com' };
      mockSignUp.mockResolvedValue({ user: mockUser });
      mockSetDoc.mockResolvedValue(undefined);

      const signUpData = {
        email: 'test@test.com',
        password: 'password',
        phoneNumber: '+1234567890'
      };
      
      const result = await authService.signUpWithEmail(signUpData);
      
      expect(mockSignUp).toHaveBeenCalledWith(expect.anything(), 'test@test.com', 'password');
      expect(mockSetDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.user).toBe(mockUser);
    });

    it('should handle signUp errors', async () => {
      const mockSignUp = require('firebase/auth').createUserWithEmailAndPassword;
      mockSignUp.mockRejectedValue(new Error('Email already in use'));

      const signUpData = {
        email: 'test@test.com',
        password: 'password',
        phoneNumber: '+1234567890'
      };
      
      const result = await authService.signUpWithEmail(signUpData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already in use');
    });
  });
});