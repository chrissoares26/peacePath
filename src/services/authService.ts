import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase.config';
import { ContactMatchingService } from './contactMatchingService';

export interface UserProfile {
  uid: string;
  email: string;
  phoneNumber: string;
  createdAt: any;
  preferences: {
    tracking: boolean;
    trackingInterval: number;
  };
}

export interface AuthServiceResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  phoneNumber: string;
}

export class AuthService {
  async signInWithEmail(email: string, password: string): Promise<AuthServiceResult> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Error signing in:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to sign in' 
      };
    }
  }

  async signUpWithEmail(signUpData: SignUpData): Promise<AuthServiceResult> {
    try {
      const result = await createUserWithEmailAndPassword(auth, signUpData.email, signUpData.password);
      
      if (result.user) {
        await this.createUserProfile(result.user, signUpData.phoneNumber);
      }

      return { success: true, user: result.user };
    } catch (error) {
      console.error('Error signing up:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create account' 
      };
    }
  }

  private async createUserProfile(user: User, phoneNumber: string): Promise<void> {
    const userDocRef = doc(db, 'users', user.uid, 'profile', 'main');
    
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      phoneNumber: phoneNumber,
      createdAt: serverTimestamp(),
      preferences: {
        tracking: true,
        trackingInterval: 5, // minutes
      },
    };

    await setDoc(userDocRef, userProfile);
    
    // Register user's phone number for contact matching
    const contactMatchingService = new ContactMatchingService();
    await contactMatchingService.registerUserPhoneNumber(user.uid, phoneNumber, user.email || '');
  }

  async signOut(): Promise<AuthServiceResult> {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to sign out' 
      };
    }
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return auth.onAuthStateChanged(callback);
  }
}