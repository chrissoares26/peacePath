import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AuthService, SignUpData } from '../../src/services/authService';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { setUser, setError } = useAuthStore();

  function getFirebaseErrorMessage(error: string): string {
    // Convert Firebase error codes to user-friendly messages
    if (error.includes('auth/user-not-found')) {
      return 'No account found with this email address';
    }
    if (error.includes('auth/wrong-password')) {
      return 'Incorrect password';
    }
    if (error.includes('auth/email-already-in-use')) {
      return 'An account with this email already exists';
    }
    if (error.includes('auth/weak-password')) {
      return 'Password is too weak. Please use at least 6 characters';
    }
    if (error.includes('auth/invalid-email')) {
      return 'Invalid email address';
    }
    if (error.includes('auth/network-request-failed')) {
      return 'Network error. Please check your connection and try again';
    }
    if (error.includes('auth/too-many-requests')) {
      return 'Too many failed attempts. Please try again later';
    }
    return error;
  }

  function validatePhoneNumber(phone: string): { isValid: boolean; formatted?: string; error?: string } {
    try {
      // Check if phone number is empty
      if (!phone.trim()) {
        return { isValid: false, error: 'Phone number is required' };
      }

      // Check if phone number starts with country code
      if (!phone.startsWith('+')) {
        return { isValid: false, error: 'Phone number must include country code (e.g., +1 for US)' };
      }

      // Try to parse without defaulting to a specific country
      if (!isValidPhoneNumber(phone)) {
        return { isValid: false, error: 'Invalid phone number format' };
      }
      
      const phoneNumberObj = parsePhoneNumber(phone);
      
      // Additional validation for reasonable length
      if (phoneNumberObj.nationalNumber.length < 7) {
        return { isValid: false, error: 'Phone number is too short' };
      }
      
      return { 
        isValid: true, 
        formatted: phoneNumberObj.formatInternational() 
      };
    } catch (error) {
      return { isValid: false, error: 'Invalid phone number format' };
    }
  }

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function handleEmailChange(text: string) {
    setEmail(text);
    // Clear auth error when user starts typing
    if (authError) {
      setAuthError(null);
    }
  }

  function handlePasswordChange(text: string) {
    setPassword(text);
    // Clear auth error when user starts typing
    if (authError) {
      setAuthError(null);
    }
  }

  function handlePhoneNumberChange(text: string) {
    setPhoneNumber(text);
    
    // Clear errors when user starts typing
    if (phoneError && text.length > phoneNumber.length) {
      setPhoneError(null);
    }
    if (authError) {
      setAuthError(null);
    }
    
    // Validate on blur or when user pauses (add + automatically)
    if (text.length === 1 && !text.startsWith('+')) {
      setPhoneNumber('+' + text);
    }
  }

  function handlePhoneNumberBlur() {
    if (phoneNumber && isSignUp) {
      const validation = validatePhoneNumber(phoneNumber);
      if (!validation.isValid) {
        setPhoneError(validation.error || 'Invalid phone number');
      } else {
        setPhoneError(null);
      }
    }
  }

  async function handleSignIn() {
    // Clear previous errors
    setAuthError(null);

    if (!validateEmail(email)) {
      setAuthError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    const authService = new AuthService();
    const result = await authService.signInWithEmail(email, password);
    
    if (result.success && result.user) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setUser(result.user);
      router.replace('/');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage = getFirebaseErrorMessage(result.error || 'Failed to sign in');
      setAuthError(errorMessage);
    }
    
    setIsLoading(false);
  }

  async function handleSignUp() {
    // Clear previous errors
    setAuthError(null);
    setPhoneError(null);

    if (!validateEmail(email)) {
      setAuthError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long');
      return;
    }

    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || 'Please enter a valid phone number with country code');
      return;
    }

    setIsLoading(true);
    const authService = new AuthService();
    const signUpData: SignUpData = {
      email,
      password,
      phoneNumber: phoneValidation.formatted!
    };
    
    const result = await authService.signUpWithEmail(signUpData);
    
    if (result.success && result.user) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setUser(result.user);
      router.replace('/');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage = getFirebaseErrorMessage(result.error || 'Failed to create account');
      setAuthError(errorMessage);
    }
    
    setIsLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          PeacePath
        </Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Create your account to get started' : 'Sign in to your account'}
        </Text>
      </View>

      <View>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            Email Address
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="your@email.com"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            accessibilityLabel="Email address input"
            accessibilityRole="none"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            Password
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Password (min 6 characters)"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            autoComplete="password"
            accessibilityLabel="Password input"
            accessibilityRole="none"
          />
        </View>

        {isSignUp && (
          <View style={styles.phoneFieldContainer}>
            <Text style={styles.fieldLabel}>
              Phone Number
            </Text>
            <TextInput
              style={[styles.textInput, phoneError && styles.textInputError]}
              placeholder="+1234567890"
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              onBlur={handlePhoneNumberBlur}
              keyboardType="phone-pad"
              autoComplete="tel"
              accessibilityLabel="Phone number input"
              accessibilityRole="none"
            />
            {phoneError ? (
              <Text style={styles.errorText}>
                {phoneError}
              </Text>
            ) : (
              <Text style={styles.helperText}>
                Include country code (e.g., +1 for US)
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
          onPress={isSignUp ? handleSignUp : handleSignIn}
          disabled={isLoading}
          accessibilityLabel={isSignUp ? "Sign up" : "Sign in"}
          accessibilityRole="button"
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.buttonTextLoading}>
                Please wait...
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        {authError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>
              {authError}
            </Text>
            {authError.includes('Network error') && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setAuthError(null);
                  isSignUp ? handleSignUp() : handleSignIn();
                }}
                disabled={isLoading}
              >
                <Text style={styles.retryButtonText}>
                  Retry
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => {
            setIsSignUp(!isSignUp);
            setPhoneError(null);
            setAuthError(null); // Clear all errors when switching modes
          }}
          disabled={isLoading}
          accessibilityLabel={isSignUp ? "Switch to sign in" : "Switch to sign up"}
          accessibilityRole="button"
        >
          <Text style={styles.switchButtonText}>
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0284c7',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4b5563',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  phoneFieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textInputError: {
    borderColor: '#f87171',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#0284c7',
  },
  primaryButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextLoading: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 12,
  },
  errorMessage: {
    color: '#b91c1c',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '500',
  },
  switchButton: {
    width: '100%',
    paddingVertical: 8,
  },
  switchButtonText: {
    color: '#0284c7',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});