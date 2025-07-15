import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { AuthService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { db } from '../../firebase.config';

export function useAuth() {
  const { 
    user, 
    userProfile, 
    isLoading, 
    isAuthenticated, 
    error,
    setUser,
    setUserProfile,
    setLoading,
    setError,
    signOut,
    clearError
  } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const authService = new AuthService();

    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid, 'profile', 'main');
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as any);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setError('Failed to fetch user profile');
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [setUser, setUserProfile, setLoading, setError]);

  return {
    user,
    userProfile,
    isLoading,
    isAuthenticated,
    error,
    signOut,
    clearError,
  };
}