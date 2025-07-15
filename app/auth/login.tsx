import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService, SignUpData } from '../../src/services/authService';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { setUser, setError } = useAuthStore();

  function validatePhoneNumber(phone: string): { isValid: boolean; formatted?: string } {
    try {
      if (!isValidPhoneNumber(phone, 'US')) {
        return { isValid: false };
      }
      
      const phoneNumberObj = parsePhoneNumber(phone, 'US');
      return { 
        isValid: true, 
        formatted: phoneNumberObj.formatInternational() 
      };
    } catch {
      return { isValid: false };
    }
  }

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function handleSignIn() {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    const authService = new AuthService();
    const result = await authService.signInWithEmail(email, password);
    
    if (result.success && result.user) {
      setUser(result.user);
      router.replace('/');
    } else {
      Alert.alert('Error', result.error || 'Failed to sign in');
    }
    
    setIsLoading(false);
  }

  async function handleSignUp() {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long.');
      return;
    }

    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number with country code (e.g., +1234567890).');
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
      setUser(result.user);
      router.replace('/');
    } else {
      Alert.alert('Error', result.error || 'Failed to create account');
    }
    
    setIsLoading(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, backgroundColor: '#ffffff' }}>
      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center', color: '#0284c7', marginBottom: 8 }}>
          PeacePath
        </Text>
        <Text style={{ fontSize: 16, textAlign: 'center', color: '#4b5563' }}>
          {isSignUp ? 'Create your account to get started' : 'Sign in to your account'}
        </Text>
      </View>

      <View>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
            Email Address
          </Text>
          <TextInput
            style={{
              width: '100%',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 12,
              fontSize: 16,
              backgroundColor: '#ffffff'
            }}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            accessibilityLabel="Email address input"
            accessibilityRole="none"
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
            Password
          </Text>
          <TextInput
            style={{
              width: '100%',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 12,
              fontSize: 16,
              backgroundColor: '#ffffff'
            }}
            placeholder="Password (min 6 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            accessibilityLabel="Password input"
            accessibilityRole="none"
          />
        </View>

        {isSignUp && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
              Phone Number
            </Text>
            <TextInput
              style={{
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 12,
                fontSize: 16,
                backgroundColor: '#ffffff'
              }}
              placeholder="+1234567890"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
              accessibilityLabel="Phone number input"
              accessibilityRole="none"
            />
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              Include country code (e.g., +1 for US)
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={{
            width: '100%',
            paddingVertical: 16,
            borderRadius: 12,
            marginBottom: 16,
            backgroundColor: isLoading ? '#9ca3af' : '#0284c7'
          }}
          onPress={isSignUp ? handleSignUp : handleSignIn}
          disabled={isLoading}
          accessibilityLabel={isSignUp ? "Sign up" : "Sign in"}
          accessibilityRole="button"
        >
          <Text style={{ color: '#ffffff', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>
            {isLoading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ width: '100%', paddingVertical: 8 }}
          onPress={() => setIsSignUp(!isSignUp)}
          disabled={isLoading}
          accessibilityLabel={isSignUp ? "Switch to sign in" : "Switch to sign up"}
          accessibilityRole="button"
        >
          <Text style={{ color: '#0284c7', textAlign: 'center', fontWeight: '500' }}>
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 32 }}>
        <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}