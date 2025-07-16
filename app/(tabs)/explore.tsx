import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useContacts } from '@/src/hooks/useContacts';
import { useAuth } from '@/src/hooks/useAuth';
import * as Linking from 'expo-linking';

export default function ContactsScreen() {
  const {
    hasPermission,
    needsPermission,
    canRequestPermission,
    isRequestingPermission,
    contacts,
    contactCount,
    validContactCount,
    isLoadingContacts,
    contactsError,
    isSyncing,
    syncError,
    lastSyncDate,
    knownContacts,
    knownContactCount,
    isLoadingKnownContacts,
    knownContactsError,
    requestContactsPermission,
    checkContactsPermission,
    loadContacts,
    syncContacts,
    loadKnownContacts,
    clearContactsError,
    clearSyncError,
    clearKnownContactsError,
  } = useContacts();

  const { user } = useAuth();

  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);

  useEffect(() => {
    if (!hasCheckedPermission) {
      checkContactsPermission();
      setHasCheckedPermission(true);
    }
  }, [hasCheckedPermission, checkContactsPermission]);

  // Automatically load contacts if permission is already granted
  useEffect(() => {
    if (hasPermission && contacts.length === 0 && !isLoadingContacts && !contactsError) {
      loadContacts();
    }
  }, [hasPermission, contacts.length, isLoadingContacts, contactsError, loadContacts]);

  const handleRequestPermission = async () => {
    const granted = await requestContactsPermission();
    
    if (granted) {
      await loadContacts();
    } else if (!canRequestPermission) {
      // Permission was permanently denied
      Alert.alert(
        'Permission Required',
        'Contacts access is required to find your friends on PeacePath. Please enable it in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
    }
  };

  const handleRetry = () => {
    clearContactsError();
    loadContacts();
  };

  const handleSyncContacts = async () => {
    if (!user) return;
    
    const result = await syncContacts(user.uid);
    
    if (result.success) {
      // Load known contacts after successful sync
      await loadKnownContacts(user.uid);
    }
  };

  // Permission not yet requested or denied
  if (needsPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.centerContent}>
            <View style={styles.iconContainer}>
              <IconSymbol size={48} name="person.2.fill" color="#0284c7" />
            </View>
            <Text style={styles.mainTitle}>
              Sync Your Contacts
            </Text>
            <Text style={styles.mainSubtitle}>
              Find your friends on PeacePath and manage your relationships
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureRow}>
              <View style={[styles.featureIcon, styles.featureIconGreen]}>
                <IconSymbol size={16} name="checkmark" color="#059669" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  Your Privacy is Protected
                </Text>
                <Text style={styles.featureDescription}>
                  Your contacts are processed locally and only phone numbers are used for matching
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <View style={[styles.featureIcon, styles.featureIconBlue]}>
                <IconSymbol size={16} name="person.2.fill" color="#2563eb" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  Find Friends Automatically
                </Text>
                <Text style={styles.featureDescription}>
                  See which of your contacts are already using PeacePath
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <View style={[styles.featureIcon, styles.featureIconPurple]}>
                <IconSymbol size={16} name="heart.fill" color="#7c3aed" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  Manage Relationships
                </Text>
                <Text style={styles.featureDescription}>
                  Easily classify your contacts and set up proximity alerts
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isRequestingPermission && styles.primaryButtonDisabled]}
            onPress={handleRequestPermission}
            disabled={isRequestingPermission}
            accessibilityLabel="Allow contacts access"
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              {isRequestingPermission ? 'Requesting Access...' : 'Allow Contacts Access'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            We only access your contacts to help you find friends on PeacePath. You can change this permission anytime in your device settings.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Permission granted - show contacts or loading state
  if (isLoadingContacts) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconContainer}>
            <IconSymbol size={32} name="person.2.fill" color="#0284c7" />
          </View>
          <Text style={styles.loadingTitle}>
            Loading Your Contacts...
          </Text>
          <Text style={styles.loadingSubtitle}>
            We&apos;re reading your contacts to help you find friends on PeacePath
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (contactsError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <IconSymbol size={32} name="exclamationmark.triangle.fill" color="#dc2626" />
          </View>
          <Text style={styles.errorTitle}>
            Error Loading Contacts
          </Text>
          <Text style={styles.errorMessage}>
            {contactsError}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            accessibilityLabel="Retry loading contacts"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Contacts loaded successfully
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contactsContainer}>
        <View style={styles.contactsHeader}>
          <Text style={styles.contactsTitle}>
            Your Contacts
          </Text>
          <Text style={styles.contactsCount}>
            {contactCount} contact{contactCount !== 1 ? 's' : ''} found • {validContactCount} with valid phone numbers
          </Text>
          {lastSyncDate && (
            <Text style={styles.syncDate}>
              Last synced: {lastSyncDate.toLocaleString()}
            </Text>
          )}
        </View>

        {/* Sync Controls */}
        <View style={styles.syncContainer}>
          <TouchableOpacity
            style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
            onPress={handleSyncContacts}
            disabled={isSyncing || !user}
            accessibilityLabel="Sync contacts"
            accessibilityRole="button"
          >
            <IconSymbol 
              size={16} 
              name={isSyncing ? "arrow.clockwise" : "arrow.2.circlepath"} 
              color="#ffffff" 
            />
            <Text style={styles.syncButtonText}>
              {isSyncing ? 'Syncing...' : 'Sync Contacts'}
            </Text>
          </TouchableOpacity>

          {knownContactCount > 0 && (
            <Text style={styles.knownContactsCount}>
              {knownContactCount} friend{knownContactCount !== 1 ? 's' : ''} found on PeacePath
            </Text>
          )}
        </View>

        {/* Sync Error */}
        {syncError && (
          <View style={styles.syncErrorContainer}>
            <Text style={styles.syncErrorText}>{syncError}</Text>
            <TouchableOpacity
              style={styles.syncErrorButton}
              onPress={clearSyncError}
              accessibilityLabel="Clear sync error"
              accessibilityRole="button"
            >
              <Text style={styles.syncErrorButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Known Contacts Section */}
        {knownContacts.length > 0 && (
          <View style={styles.knownContactsSection}>
            <Text style={styles.sectionTitle}>Friends on PeacePath</Text>
            <ScrollView style={styles.knownContactsList}>
              {knownContacts.slice(0, 5).map((contact, index) => (
                <View key={`${contact.uid}-${index}`} style={styles.knownContactItem}>
                  <View style={styles.knownContactAvatar}>
                    <IconSymbol size={16} name="person.fill" color="#059669" />
                  </View>
                  <View style={styles.knownContactInfo}>
                    <Text style={styles.knownContactName}>
                      {contact.contactName}
                    </Text>
                    <Text style={styles.knownContactEmail}>
                      {contact.email}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <IconSymbol size={32} name="person.2.fill" color="#6b7280" />
            </View>
            <Text style={styles.emptyTitle}>
              No Contacts Found
            </Text>
            <Text style={styles.emptyMessage}>
              It looks like you don&apos;t have any contacts saved on your device
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.contactsList}>
            {contacts.slice(0, 10).map((contact, index) => (
              <View key={contact.id || index} style={styles.contactItem}>
                <View style={styles.contactAvatar}>
                  <IconSymbol size={20} name="person.fill" color="#6b7280" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>
                    {contact.name}
                  </Text>
                  {contact.originalPhoneNumbers && contact.originalPhoneNumbers.length > 0 && (
                    <Text style={styles.contactPhone}>
                      {contact.originalPhoneNumbers[0]}
                    </Text>
                  )}
                  {contact.hasValidPhoneNumbers && (
                    <Text style={styles.contactNormalized}>
                      {contact.normalizedPhoneNumbers[0]} (normalized)
                    </Text>
                  )}
                </View>
              </View>
            ))}
            {contacts.length > 10 && (
              <View style={styles.moreContactsContainer}>
                <Text style={styles.moreContactsText}>
                  And {contacts.length - 10} more contact{contacts.length - 10 !== 1 ? 's' : ''}...
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  centerContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#dbeafe',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  featureIconGreen: {
    backgroundColor: '#dcfce7',
  },
  featureIconBlue: {
    backgroundColor: '#dbeafe',
  },
  featureIconPurple: {
    backgroundColor: '#e9d5ff',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#4b5563',
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
  primaryButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#dbeafe',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#fee2e2',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  contactsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  contactsHeader: {
    marginBottom: 24,
  },
  contactsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  contactsCount: {
    fontSize: 14,
    color: '#4b5563',
  },
  syncDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  syncContainer: {
    marginBottom: 20,
  },
  syncButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  syncButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  syncButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  knownContactsCount: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    fontWeight: '500',
  },
  syncErrorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#f87171',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncErrorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
  },
  syncErrorButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  syncErrorButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  knownContactsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  knownContactsList: {
    maxHeight: 200,
  },
  knownContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    marginBottom: 8,
  },
  knownContactAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#dcfce7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  knownContactInfo: {
    flex: 1,
  },
  knownContactName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  knownContactEmail: {
    fontSize: 12,
    color: '#059669',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#f3f4f6',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  contactPhone: {
    fontSize: 14,
    color: '#4b5563',
  },
  contactNormalized: {
    fontSize: 12,
    color: '#059669',
    fontStyle: 'italic',
  },
  moreContactsContainer: {
    paddingVertical: 16,
  },
  moreContactsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
