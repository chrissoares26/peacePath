import * as Contacts from 'expo-contacts';
import { PermissionStatus } from 'expo-modules-core';
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

export interface ContactServiceResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ContactPermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  status: PermissionStatus;
}

export interface NormalizedContact {
  id: string;
  name: string;
  originalPhoneNumbers: string[];
  normalizedPhoneNumbers: string[];
  hasValidPhoneNumbers: boolean;
}

export interface PhoneNormalizationResult {
  original: string;
  normalized: string | null;
  isValid: boolean;
  country?: string;
  error?: string;
}

export class ContactService {
  /**
   * Normalize a phone number to E.164 format
   */
  private normalizePhoneNumber(phoneNumber: string, defaultCountry: CountryCode = 'US'): PhoneNormalizationResult {
    if (!phoneNumber || phoneNumber.trim() === '') {
      return {
        original: phoneNumber,
        normalized: null,
        isValid: false,
        error: 'Empty phone number'
      };
    }

    const cleanNumber = phoneNumber.trim();

    try {
      // First try with default country
      if (isValidPhoneNumber(cleanNumber, defaultCountry)) {
        const parsed = parsePhoneNumber(cleanNumber, defaultCountry);
        return {
          original: phoneNumber,
          normalized: parsed.format('E.164'),
          isValid: true,
          country: parsed.country
        };
      }

      // Try without country code (international format)
      if (isValidPhoneNumber(cleanNumber)) {
        const parsed = parsePhoneNumber(cleanNumber);
        return {
          original: phoneNumber,
          normalized: parsed.format('E.164'),
          isValid: true,
          country: parsed.country
        };
      }

      return {
        original: phoneNumber,
        normalized: null,
        isValid: false,
        error: 'Invalid phone number format'
      };
    } catch (error) {
      return {
        original: phoneNumber,
        normalized: null,
        isValid: false,
        error: error instanceof Error ? error.message : 'Phone number parsing error'
      };
    }
  }

  /**
   * Process and normalize all phone numbers for a contact
   */
  private normalizeContactPhoneNumbers(contact: Contacts.Contact): NormalizedContact {
    const phoneNumbers = contact.phoneNumbers || [];
    const originalPhoneNumbers: string[] = [];
    const normalizedPhoneNumbers: string[] = [];

    phoneNumbers.forEach(phoneEntry => {
      if (phoneEntry.number) {
        originalPhoneNumbers.push(phoneEntry.number);
        
        const normalizationResult = this.normalizePhoneNumber(phoneEntry.number);
        if (normalizationResult.isValid && normalizationResult.normalized) {
          normalizedPhoneNumbers.push(normalizationResult.normalized);
        }
      }
    });

    // Remove duplicates from normalized numbers
    const uniqueNormalizedNumbers = [...new Set(normalizedPhoneNumbers)];

    return {
      id: contact.id || '',
      name: contact.name || 'Unknown Contact',
      originalPhoneNumbers,
      normalizedPhoneNumbers: uniqueNormalizedNumbers,
      hasValidPhoneNumbers: uniqueNormalizedNumbers.length > 0
    };
  }

  /**
   * Request contacts permission with proper handling
   */
  async requestContactsPermission(): Promise<ContactPermissionResult> {
    try {
      const { status, canAskAgain } = await Contacts.requestPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
        status
      };
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied' as PermissionStatus
      };
    }
  }

  /**
   * Check current contacts permission status
   */
  async getContactsPermissionStatus(): Promise<ContactPermissionResult> {
    try {
      const { status, canAskAgain } = await Contacts.getPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
        status
      };
    } catch (error) {
      console.error('Error checking contacts permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied' as PermissionStatus
      };
    }
  }

  /**
   * Read and normalize contacts from device
   */
  async getContacts(limit?: number): Promise<ContactServiceResult> {
    try {
      // First check permission
      const permissionResult = await this.getContactsPermissionStatus();
      
      if (!permissionResult.granted) {
        return {
          success: false,
          error: 'Contacts permission not granted'
        };
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        sort: Contacts.SortTypes.LastName,
        pageSize: limit || 1000,
      });

      // Normalize all contacts
      const normalizedContacts = data.map(contact => this.normalizeContactPhoneNumbers(contact));

      return {
        success: true,
        data: normalizedContacts
      };
    } catch (error) {
      console.error('Error reading contacts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read contacts'
      };
    }
  }

  /**
   * Read contacts from device (legacy method for backward compatibility)
   */
  async getRawContacts(limit?: number): Promise<ContactServiceResult> {
    try {
      // First check permission
      const permissionResult = await this.getContactsPermissionStatus();
      
      if (!permissionResult.granted) {
        return {
          success: false,
          error: 'Contacts permission not granted'
        };
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        sort: Contacts.SortTypes.LastName,
        pageSize: limit || 1000,
      });

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error reading contacts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read contacts'
      };
    }
  }

  /**
   * Get contacts count without reading all data
   */
  async getContactsCount(): Promise<number> {
    try {
      const permissionResult = await this.getContactsPermissionStatus();
      
      if (!permissionResult.granted) {
        return 0;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name],
        pageSize: 1,
      });

      // This is a rough estimate - expo-contacts doesn't provide a direct count method
      return data.length > 0 ? 1000 : 0; // Default estimate if contacts exist
    } catch (error) {
      console.error('Error getting contacts count:', error);
      return 0;
    }
  }
}