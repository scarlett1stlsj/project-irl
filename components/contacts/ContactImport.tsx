import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Smartphone, Upload, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  isContactPickerSupported,
  pickContacts,
  getImportMethodDescription,
} from '../../services/contactPickerService';
import {
  parseContactFile,
  ParsedContact,
} from '../../services/contactImportService';
import { addContacts, matchContactsWithUsers } from '../../services/firestoreService';
import FileDropZone from './FileDropZone';
import ContactPreview from './ContactPreview';
import ContactList from './ContactList';

type ImportStep = 'select' | 'preview' | 'success';

const ContactImport: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<ImportStep>('select');
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supportsContactPicker = isContactPickerSupported();
  const methodInfo = getImportMethodDescription();

  const handlePickerImport = async () => {
    setLoading(true);
    setError(null);

    try {
      const contacts = await pickContacts();
      if (contacts.length > 0) {
        setParsedContacts(contacts);
        setStep('preview');
      } else {
        setError('No contacts were selected');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const contacts = await parseContactFile(file);
      if (contacts.length > 0) {
        setParsedContacts(contacts);
        setStep('preview');
      } else {
        setError('No valid contacts found in file');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async (selectedContacts: ParsedContact[]) => {
    if (!user) return;

    // Match contacts with existing users
    const contactsToSave = selectedContacts.map((c) => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
    }));

    // Save contacts
    await addContacts(user.uid, contactsToSave);

    setImportedCount(selectedContacts.length);
    setStep('success');
  };

  const handleReset = () => {
    setParsedContacts([]);
    setError(null);
    setStep('select');
  };

  if (step === 'preview') {
    return (
      <div className="flex-1 flex flex-col p-6 min-h-screen">
        <header className="flex items-center mb-6">
          <button onClick={handleReset} className="p-2 -ml-2 text-slate-400">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold ml-2">Preview Contacts</h1>
        </header>

        <div className="flex-1">
          <ContactPreview
            contacts={parsedContacts}
            onConfirm={handleConfirmImport}
            onCancel={handleReset}
          />
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="flex-1 flex flex-col p-6 min-h-screen">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Contacts Imported!</h2>
            <p className="text-slate-500">
              {importedCount} contact{importedCount !== 1 ? 's' : ''} added to your Trip Mode.
            </p>
          </div>
          <button
            onClick={() => navigate('/contacts')}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl"
          >
            View My Contacts
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-slate-100 text-slate-700 font-bold py-4 rounded-2xl"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 min-h-screen">
      <header className="flex items-center mb-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-2">Import Contacts</h1>
      </header>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Add your friends</h2>
          <p className="text-slate-500">
            Import contacts to easily invite them on your trips.
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-4 bg-red-50 rounded-xl text-red-600">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {supportsContactPicker && (
          <button
            onClick={handlePickerImport}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Smartphone className="w-5 h-5" />
                <span>Sync from Phone</span>
              </>
            )}
          </button>
        )}

        <div className="relative">
          {supportsContactPicker && (
            <div className="flex items-center justify-center my-6">
              <div className="flex-1 border-t border-slate-200" />
              <span className="px-4 text-sm text-slate-400">or</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>
          )}

          <FileDropZone onFileSelect={handleFileSelect} />
        </div>
      </div>
    </div>
  );
};

export default ContactImport;
