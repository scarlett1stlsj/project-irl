import { ParsedContact } from './contactImportService';

// Contact Picker API types (not yet in TypeScript lib)
interface ContactAddress {
  city?: string;
  country?: string;
  postalCode?: string;
  region?: string;
  streetAddress?: string;
}

interface ContactInfo {
  address?: ContactAddress[];
  email?: string[];
  icon?: Blob[];
  name?: string[];
  tel?: string[];
}

interface ContactsManager {
  select(
    properties: string[],
    options?: { multiple?: boolean }
  ): Promise<ContactInfo[]>;
  getProperties(): Promise<string[]>;
}

declare global {
  interface Navigator {
    contacts?: ContactsManager;
  }
}

// Check if Contact Picker API is available
export const isContactPickerSupported = (): boolean => {
  return 'contacts' in navigator && 'ContactsManager' in window;
};

// Get supported properties
export const getSupportedProperties = async (): Promise<string[]> => {
  if (!navigator.contacts) {
    return [];
  }

  try {
    return await navigator.contacts.getProperties();
  } catch {
    return [];
  }
};

// Open native contact picker
export const pickContacts = async (): Promise<ParsedContact[]> => {
  if (!navigator.contacts) {
    throw new Error('Contact Picker API is not supported on this device/browser');
  }

  try {
    // Get supported properties
    const supported = await navigator.contacts.getProperties();

    // Build properties array based on what's available
    const properties: string[] = [];
    if (supported.includes('name')) properties.push('name');
    if (supported.includes('email')) properties.push('email');
    if (supported.includes('tel')) properties.push('tel');

    if (properties.length === 0) {
      throw new Error('No contact properties are accessible');
    }

    // Open the native picker
    const selectedContacts = await navigator.contacts.select(properties, {
      multiple: true,
    });

    // Convert to our ParsedContact format
    const contacts: ParsedContact[] = [];

    for (const contact of selectedContacts) {
      const name = contact.name?.[0] || '';
      const email = contact.email?.[0];
      const phone = normalizePhone(contact.tel?.[0]);

      if (name && (email || phone)) {
        contacts.push({ name, email, phone });
      }
    }

    return contacts;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'SecurityError') {
        throw new Error('Permission denied. Please allow access to contacts.');
      }
      if (error.name === 'InvalidStateError') {
        throw new Error('Another contact picker is already open.');
      }
      throw error;
    }
    throw new Error('Failed to pick contacts');
  }
};

// Normalize phone number
const normalizePhone = (phone?: string): string | undefined => {
  if (!phone) return undefined;

  const hasPlus = phone.startsWith('+');
  const digits = phone.replace(/\D/g, '');

  if (!digits) return undefined;

  return hasPlus ? `+${digits}` : digits;
};

// Get best import method for the current browser
export const getBestImportMethod = (): 'picker' | 'file' => {
  // Contact Picker is only supported on:
  // - Android Chrome 80+
  // - Android Edge 80+
  // Not supported on iOS Safari, desktop browsers
  if (isContactPickerSupported()) {
    return 'picker';
  }
  return 'file';
};

// Get user-friendly description of the import method
export const getImportMethodDescription = (): {
  method: 'picker' | 'file';
  title: string;
  description: string;
} => {
  const method = getBestImportMethod();

  if (method === 'picker') {
    return {
      method: 'picker',
      title: 'Sync from Phone',
      description: 'Select contacts directly from your phone',
    };
  }

  return {
    method: 'file',
    title: 'Import from File',
    description: 'Upload a CSV or vCard file exported from your contacts app',
  };
};
