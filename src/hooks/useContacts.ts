import { useContactStore } from '../stores/contactStore';

export function useContacts() {
  const {
    permissionStatus,
    isRequestingPermission,
    contacts,
    rawContacts,
    isLoadingContacts,
    contactsError,
    isSyncing,
    syncError,
    lastSyncDate,
    knownContacts,
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
  } = useContactStore();

  const hasPermission = permissionStatus?.granted || false;
  const needsPermission = !permissionStatus || !permissionStatus.granted;
  const canRequestPermission = !permissionStatus || permissionStatus.canAskAgain;

  // Helper functions for normalized contacts
  const validContacts = contacts.filter(contact => contact.hasValidPhoneNumbers);
  const allNormalizedNumbers = contacts.reduce((acc, contact) => {
    return acc.concat(contact.normalizedPhoneNumbers);
  }, [] as string[]);

  return {
    // Permission state
    hasPermission,
    needsPermission,
    canRequestPermission,
    permissionStatus,
    isRequestingPermission,

    // Contact data
    contacts,
    rawContacts,
    validContacts,
    contactCount: contacts.length,
    validContactCount: validContacts.length,
    allNormalizedNumbers,
    isLoadingContacts,
    contactsError,

    // Sync state
    isSyncing,
    syncError,
    lastSyncDate,

    // Known contacts (matched users)
    knownContacts,
    knownContactCount: knownContacts.length,
    isLoadingKnownContacts,
    knownContactsError,

    // Actions
    requestContactsPermission,
    checkContactsPermission,
    loadContacts,
    syncContacts,
    loadKnownContacts,
    clearContactsError,
    clearSyncError,
    clearKnownContactsError,
  };
}