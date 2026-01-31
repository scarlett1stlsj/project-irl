import React, { useState } from 'react';
import { Check, X, User, Mail, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { ParsedContact } from '../../services/contactImportService';

interface ContactPreviewProps {
  contacts: ParsedContact[];
  onConfirm: (selectedContacts: ParsedContact[]) => Promise<void>;
  onCancel: () => void;
}

const ContactPreview: React.FC<ContactPreviewProps> = ({
  contacts,
  onConfirm,
  onCancel,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set(contacts.map((_, i) => i))
  );
  const [loading, setLoading] = useState(false);

  const toggleContact = (index: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(contacts.map((_, i) => i)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleConfirm = async () => {
    const selectedContacts = contacts.filter((_, i) => selectedIds.has(i));
    if (selectedContacts.length === 0) return;

    setLoading(true);
    try {
      await onConfirm(selectedContacts);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">{contacts.length} contacts found</h3>
          <p className="text-sm text-slate-500">
            {selectedIds.size} selected
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={selectAll}
            className="text-xs font-bold text-blue-600 px-3 py-1.5 bg-blue-50 rounded-lg"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="text-xs font-bold text-slate-600 px-3 py-1.5 bg-slate-100 rounded-lg"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {contacts.map((contact, index) => {
          const isSelected = selectedIds.has(index);
          const hasIssue = !contact.email && !contact.phone;

          return (
            <button
              key={index}
              onClick={() => toggleContact(index)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-100 bg-white'
              } ${hasIssue ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{contact.name}</p>
                    <div className="flex flex-col text-xs text-slate-500 mt-0.5">
                      {contact.email && (
                        <span className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {contact.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {hasIssue && (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex space-x-3 pt-4 border-t">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-slate-100 text-slate-700 font-bold py-4 rounded-2xl disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading || selectedIds.size === 0}
          className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>Import {selectedIds.size}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ContactPreview;
