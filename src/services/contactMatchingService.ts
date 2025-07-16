import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
// Simple hash function for React Native compatibility
// In production, use a proper crypto library like react-native-crypto
import { db } from '../../firebase.config';
import { NormalizedContact } from './contactService';

export interface ContactMatch {
  uid: string;
  email: string;
  phoneNumber: string;
  matchedAt: Date;
  contactName: string;
  isActive: boolean;
}

export interface ContactMatchingResult {
  success: boolean;
  matches?: ContactMatch[];
  error?: string;
}

export interface ContactSyncResult {
  success: boolean;
  processedCount: number;
  matchedCount: number;
  error?: string;
}

export class ContactMatchingService {
  /**
   * Create a privacy-friendly hash of a phone number
   */
  private hashPhoneNumber(phoneNumber: string): string {
    // Simple hash function for React Native compatibility
    // In production, use a proper crypto library like react-native-crypto
    let hash = 0;
    for (let i = 0; i < phoneNumber.length; i++) {
      const char = phoneNumber.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Store user's phone number hash in Firestore for matching
   */
  async registerUserPhoneNumber(uid: string, phoneNumber: string, email: string): Promise<boolean> {
    try {
      const phoneHash = this.hashPhoneNumber(phoneNumber);
      
      await setDoc(doc(db, 'userPhoneHashes', phoneHash), {
        uid,
        email,
        phoneNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      });

      return true;
    } catch (error) {
      console.error('Error registering user phone number:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        console.error('Permission denied - user may not be authenticated');
      }
      return false;
    }
  }

  /**
   * Remove user's phone number hash from Firestore
   */
  async unregisterUserPhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      const phoneHash = this.hashPhoneNumber(phoneNumber);
      await deleteDoc(doc(db, 'userPhoneHashes', phoneHash));
      return true;
    } catch (error) {
      console.error('Error unregistering user phone number:', error);
      return false;
    }
  }

  /**
   * Find matches for a batch of normalized phone numbers
   */
  async findContactMatches(normalizedPhoneNumbers: string[]): Promise<ContactMatchingResult> {
    try {
      if (normalizedPhoneNumbers.length === 0) {
        return { success: true, matches: [] };
      }

      // Create hashes for all phone numbers
      const phoneHashes = normalizedPhoneNumbers.map(number => this.hashPhoneNumber(number));

      // Firestore 'in' queries are limited to 10 items, so we need to batch them
      const batchSize = 10;
      const batches = [];

      for (let i = 0; i < phoneHashes.length; i += batchSize) {
        const batch = phoneHashes.slice(i, i + batchSize);
        batches.push(batch);
      }

      const allMatches: ContactMatch[] = [];

      // Process each batch
      for (const batch of batches) {
        const q = query(
          collection(db, 'userPhoneHashes'),
          where('__name__', 'in', batch),
          where('isActive', '==', true)
        );

        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allMatches.push({
            uid: data.uid,
            email: data.email,
            phoneNumber: data.phoneNumber,
            matchedAt: new Date(),
            contactName: '', // Will be populated later
            isActive: data.isActive
          });
        });
      }

      return {
        success: true,
        matches: allMatches
      };
    } catch (error) {
      console.error('Error finding contact matches:', error);
      let errorMessage = 'Failed to find contact matches';
      
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage = 'Permission denied. Please make sure you are logged in and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Store known contacts for a user
   */
  async storeKnownContacts(userUid: string, contacts: NormalizedContact[]): Promise<ContactSyncResult> {
    try {
      let processedCount = 0;
      let matchedCount = 0;

      // Get all normalized phone numbers from contacts
      const allPhoneNumbers = contacts.reduce((acc, contact) => {
        return acc.concat(contact.normalizedPhoneNumbers);
      }, [] as string[]);

      // Find matches for all phone numbers
      const matchingResult = await this.findContactMatches(allPhoneNumbers);

      if (!matchingResult.success) {
        return {
          success: false,
          processedCount: 0,
          matchedCount: 0,
          error: matchingResult.error
        };
      }

      const matches = matchingResult.matches || [];
      
      // Create a map of phone number to user data for quick lookup
      const phoneToUserMap = new Map<string, ContactMatch>();
      matches.forEach(match => {
        phoneToUserMap.set(match.phoneNumber, match);
      });

      // Process each contact
      for (const contact of contacts) {
        processedCount++;

        // Check if any of the contact's phone numbers match a user
        const matchedUsers: ContactMatch[] = [];
        for (const phoneNumber of contact.normalizedPhoneNumbers) {
          const userMatch = phoneToUserMap.get(phoneNumber);
          if (userMatch) {
            matchedUsers.push({
              ...userMatch,
              contactName: contact.name
            });
          }
        }

        if (matchedUsers.length > 0) {
          matchedCount++;

          // Store the known contact with matched user information
          await setDoc(doc(db, 'users', userUid, 'knownContacts', contact.id || contact.name), {
            contactId: contact.id,
            contactName: contact.name,
            originalPhoneNumbers: contact.originalPhoneNumbers,
            normalizedPhoneNumbers: contact.normalizedPhoneNumbers,
            hasValidPhoneNumbers: contact.hasValidPhoneNumbers,
            matchedUsers: matchedUsers.map(user => ({
              uid: user.uid,
              email: user.email,
              phoneNumber: user.phoneNumber,
              matchedAt: serverTimestamp()
            })),
            syncedAt: serverTimestamp(),
            isActive: true
          });
        }
      }

      return {
        success: true,
        processedCount,
        matchedCount
      };
    } catch (error) {
      console.error('Error storing known contacts:', error);
      let errorMessage = 'Failed to store known contacts';
      
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage = 'Permission denied. Please make sure you are logged in and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        processedCount: 0,
        matchedCount: 0,
        error: errorMessage
      };
    }
  }

  /**
   * Get known contacts for a user
   */
  async getKnownContacts(userUid: string): Promise<ContactMatchingResult> {
    try {
      const q = query(
        collection(db, 'users', userUid, 'knownContacts'),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const knownContacts: ContactMatch[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Flatten matched users for easier handling
        if (data.matchedUsers && data.matchedUsers.length > 0) {
          data.matchedUsers.forEach((user: any) => {
            knownContacts.push({
              uid: user.uid,
              email: user.email,
              phoneNumber: user.phoneNumber,
              matchedAt: user.matchedAt?.toDate() || new Date(),
              contactName: data.contactName,
              isActive: data.isActive
            });
          });
        }
      });

      return {
        success: true,
        matches: knownContacts
      };
    } catch (error) {
      console.error('Error getting known contacts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get known contacts'
      };
    }
  }

  /**
   * Update a known contact's status
   */
  async updateKnownContactStatus(userUid: string, contactId: string, isActive: boolean): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'users', userUid, 'knownContacts', contactId), {
        isActive,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error updating known contact status:', error);
      return false;
    }
  }

  /**
   * Delete a known contact
   */
  async deleteKnownContact(userUid: string, contactId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'users', userUid, 'knownContacts', contactId));
      return true;
    } catch (error) {
      console.error('Error deleting known contact:', error);
      return false;
    }
  }
}