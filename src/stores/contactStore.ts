import { create } from 'zustand';
import { Contact } from 'expo-contacts';
import { ContactService, ContactPermissionResult, NormalizedContact } from '../services/contactService';
import { ContactMatchingService, ContactMatch, ContactSyncResult } from '../services/contactMatchingService';

interface ContactState {
  // Permission state
  permissionStatus: ContactPermissionResult | null;
  isRequestingPermission: boolean;
  
  // Contact data
  contacts: NormalizedContact[];
  rawContacts: Contact[];
  isLoadingContacts: boolean;
  contactsError: string | null;
  
  // Sync state
  isSyncing: boolean;
  syncError: string | null;
  lastSyncDate: Date | null;
  
  // Known contacts (matched users)
  knownContacts: ContactMatch[];
  isLoadingKnownContacts: boolean;
  knownContactsError: string | null;
  
  // Actions
  requestContactsPermission: () => Promise<boolean>;
  checkContactsPermission: () => Promise<void>;
  loadContacts: () => Promise<void>;
  syncContacts: (userUid: string) => Promise<ContactSyncResult>;
  loadKnownContacts: (userUid: string) => Promise<void>;
  clearContactsError: () => void;
  clearSyncError: () => void;
  clearKnownContactsError: () => void;
}

export const useContactStore = create<ContactState>((set, get) => ({
  // Initial state
  permissionStatus: null,
  isRequestingPermission: false,
  contacts: [],
  rawContacts: [],
  isLoadingContacts: false,
  contactsError: null,
  isSyncing: false,
  syncError: null,
  lastSyncDate: null,
  knownContacts: [],
  isLoadingKnownContacts: false,
  knownContactsError: null,

  // Actions
  requestContactsPermission: async () => {
    set({ isRequestingPermission: true, contactsError: null });
    
    const contactService = new ContactService();
    const result = await contactService.requestContactsPermission();
    
    set({ 
      permissionStatus: result,
      isRequestingPermission: false 
    });
    
    return result.granted;
  },

  checkContactsPermission: async () => {
    const contactService = new ContactService();
    const result = await contactService.getContactsPermissionStatus();
    
    set({ permissionStatus: result });
  },

  loadContacts: async () => {
    set({ isLoadingContacts: true, contactsError: null });
    
    const contactService = new ContactService();
    
    // Load normalized contacts for the app
    const normalizedResult = await contactService.getContacts();
    
    if (normalizedResult.success && normalizedResult.data) {
      // Also load raw contacts for backward compatibility
      const rawResult = await contactService.getRawContacts();
      
      set({ 
        contacts: normalizedResult.data,
        rawContacts: rawResult.success ? rawResult.data : [],
        isLoadingContacts: false 
      });
    } else {
      set({ 
        contactsError: normalizedResult.error || 'Failed to load contacts',
        isLoadingContacts: false 
      });
    }
  },

  syncContacts: async (userUid: string) => {
    set({ isSyncing: true, syncError: null });
    
    const { contacts } = get();
    const contactMatchingService = new ContactMatchingService();
    const result = await contactMatchingService.storeKnownContacts(userUid, contacts);
    
    if (result.success) {
      set({ 
        isSyncing: false,
        lastSyncDate: new Date()
      });
    } else {
      set({ 
        syncError: result.error || 'Failed to sync contacts',
        isSyncing: false 
      });
    }
    
    return result;
  },

  loadKnownContacts: async (userUid: string) => {
    set({ isLoadingKnownContacts: true, knownContactsError: null });
    
    const contactMatchingService = new ContactMatchingService();
    const result = await contactMatchingService.getKnownContacts(userUid);
    
    if (result.success && result.matches) {
      set({ 
        knownContacts: result.matches,
        isLoadingKnownContacts: false 
      });
    } else {
      set({ 
        knownContactsError: result.error || 'Failed to load known contacts',
        isLoadingKnownContacts: false 
      });
    }
  },

  clearContactsError: () => set({ contactsError: null }),
  clearSyncError: () => set({ syncError: null }),
  clearKnownContactsError: () => set({ knownContactsError: null }),
}));