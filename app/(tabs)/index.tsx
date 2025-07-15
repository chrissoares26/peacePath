import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/src/hooks/useAuth';

export default function HomeScreen() {
  const { user, userProfile, signOut } = useAuth();

  async function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to PeacePath!</ThemedText>
        <HelloWave />
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Authentication Status</ThemedText>
        <ThemedText>
          {user ? `Signed in as: ${user.email}` : 'Not signed in'}
        </ThemedText>
        {userProfile && (
          <ThemedText>
            Phone: {userProfile.phoneNumber}
          </ThemedText>
        )}
        {user && (
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Phase 1: Authentication ✅</ThemedText>
        <ThemedText>
          Firebase Auth with phone verification is now working! You can sign in with your phone number.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Next Steps</ThemedText>
        <ThemedText>
          Phase 2: Contact sync and matching
        </ThemedText>
        <ThemedText>
          Phase 3: Swipe classification UI
        </ThemedText>
        <ThemedText>
          Phase 4: Location and proximity system
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  signOutButton: {
    backgroundColor: '#f87171',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
