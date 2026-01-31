import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Trash2, Check, UserCheck } from 'lucide-react';
import { Contact } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToUserContacts, deleteContact } from '../../services/firestoreService';

interface ContactListProps {
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  emptyMessage?: string;
}

const ContactList: React.FC<ContactListProps> = ({
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  emptyMessage = 'No contacts yet',
}) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserContacts(user.uid, (updatedContacts) => {
      setContacts(updatedContacts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSelect = (contactId: string) => {
    if (!selectable || !onSelectionChange) return;

    const newSelected = new Set(selectedIds);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    onSelectionChange(newSelected);
  };

  const handleDelete = async (contactId: string) => {
    if (!user) return;

    setDeletingId(contactId);
    try {
      await deleteContact(user.uid, contactId);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-100 rounded-xl h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto flex items-center justify-center">
          <User className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {contacts.map((contact) => {
        const isSelected = selectedIds.has(contact.id);
        const isDeleting = deletingId === contact.id;

        return (
          <div
            key={contact.id}
            onClick={() => handleSelect(contact.id)}
            className={`
              p-4 rounded-xl border-2 transition-all
              ${selectable ? 'cursor-pointer' : ''}
              ${isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-100 bg-white'
              }
              ${isDeleting ? 'opacity-50' : ''}
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    contact.matchedUserId
                      ? 'bg-green-100 text-green-600'
                      : isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {contact.matchedUserId ? (
                    <UserCheck className="w-5 h-5" />
                  ) : isSelected ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-slate-900">{contact.name}</p>
                    {contact.matchedUserId && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        On Trip Mode
                      </span>
                    )}
                  </div>
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

              {!selectable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(contact.id);
                  }}
                  disabled={isDeleting}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContactList;
