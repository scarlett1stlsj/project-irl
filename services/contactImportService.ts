import Papa from 'papaparse';
import vCard from 'vcf';
import { Contact } from '../types';

// Parsed contact structure before saving
export interface ParsedContact {
  name: string;
  email?: string;
  phone?: string;
}

// CSV Column mapping options
interface CSVMappingOptions {
  nameColumn?: string;
  emailColumn?: string;
  phoneColumn?: string;
}

// Parse CSV file
export const parseCSV = async (
  file: File,
  options?: CSVMappingOptions
): Promise<ParsedContact[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const contacts: ParsedContact[] = [];

        for (const row of results.data as Record<string, string>[]) {
          // Try to find name, email, phone columns
          const nameCol = options?.nameColumn || findColumn(row, ['name', 'full name', 'fullname', 'display name']);
          const emailCol = options?.emailColumn || findColumn(row, ['email', 'e-mail', 'email address']);
          const phoneCol = options?.phoneColumn || findColumn(row, ['phone', 'telephone', 'mobile', 'cell', 'phone number']);

          const name = nameCol ? row[nameCol]?.trim() : '';
          const email = emailCol ? row[emailCol]?.trim() : undefined;
          const phone = phoneCol ? normalizePhone(row[phoneCol]?.trim()) : undefined;

          // Skip if no name
          if (!name) continue;

          // Skip if no contact info
          if (!email && !phone) continue;

          contacts.push({ name, email, phone });
        }

        resolve(contacts);
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
};

// Find a column by possible names
const findColumn = (row: Record<string, string>, possibleNames: string[]): string | null => {
  const rowKeys = Object.keys(row).map((k) => k.toLowerCase());

  for (const name of possibleNames) {
    const index = rowKeys.findIndex((k) => k.includes(name.toLowerCase()));
    if (index !== -1) {
      return Object.keys(row)[index];
    }
  }
  return null;
};

// Parse vCard file
export const parseVCard = async (file: File): Promise<ParsedContact[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const content = reader.result as string;
        const contacts: ParsedContact[] = [];

        // Split by vCard boundaries and parse each
        const vcardStrings = content.split(/(?=BEGIN:VCARD)/i).filter((s) => s.trim());

        for (const vcardString of vcardStrings) {
          try {
            const card = new vCard().parse(vcardString);

            // Get name
            let name = '';
            const fn = card.get('fn');
            if (fn) {
              name = Array.isArray(fn) ? fn[0]._data : fn._data;
            } else {
              const n = card.get('n');
              if (n) {
                const nData = Array.isArray(n) ? n[0]._data : n._data;
                // N format is: LastName;FirstName;MiddleName;Prefix;Suffix
                const parts = nData.split(';');
                name = [parts[1], parts[0]].filter(Boolean).join(' ').trim();
              }
            }

            // Get email
            let email: string | undefined;
            const emailProp = card.get('email');
            if (emailProp) {
              email = Array.isArray(emailProp) ? emailProp[0]._data : emailProp._data;
            }

            // Get phone
            let phone: string | undefined;
            const telProp = card.get('tel');
            if (telProp) {
              const telData = Array.isArray(telProp) ? telProp[0]._data : telProp._data;
              phone = normalizePhone(telData);
            }

            if (name && (email || phone)) {
              contacts.push({ name, email, phone });
            }
          } catch (e) {
            // Skip malformed vCards
            console.warn('Skipping malformed vCard entry');
          }
        }

        resolve(contacts);
      } catch (error) {
        reject(new Error('vCard parsing error'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

// Auto-detect file type and parse
export const parseContactFile = async (file: File): Promise<ParsedContact[]> => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    return parseCSV(file);
  } else if (fileName.endsWith('.vcf') || fileName.endsWith('.vcard')) {
    return parseVCard(file);
  } else {
    throw new Error('Unsupported file type. Please use CSV or vCard (.vcf) files.');
  }
};

// Normalize phone number (remove formatting, keep digits and leading +)
const normalizePhone = (phone?: string): string | undefined => {
  if (!phone) return undefined;

  // Keep + at start if present, then only digits
  const hasPlus = phone.startsWith('+');
  const digits = phone.replace(/\D/g, '');

  if (!digits) return undefined;

  return hasPlus ? `+${digits}` : digits;
};

// Convert parsed contacts to Contact objects (ready for Firestore)
export const prepareContactsForSave = (
  parsedContacts: ParsedContact[],
  ownerId: string
): Omit<Contact, 'id'>[] => {
  return parsedContacts.map((c) => ({
    ownerId,
    name: c.name,
    email: c.email,
    phone: c.phone,
  }));
};

// Validate parsed contacts
export const validateContacts = (contacts: ParsedContact[]): {
  valid: ParsedContact[];
  invalid: { contact: ParsedContact; reason: string }[];
} => {
  const valid: ParsedContact[] = [];
  const invalid: { contact: ParsedContact; reason: string }[] = [];

  for (const contact of contacts) {
    if (!contact.name) {
      invalid.push({ contact, reason: 'Missing name' });
    } else if (!contact.email && !contact.phone) {
      invalid.push({ contact, reason: 'No email or phone' });
    } else {
      valid.push(contact);
    }
  }

  return { valid, invalid };
};
