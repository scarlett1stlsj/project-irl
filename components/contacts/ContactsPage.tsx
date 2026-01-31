import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Upload, UserPlus } from 'lucide-react';
import ContactList from './ContactList';

const ContactsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white p-6 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold ml-2">My Contacts</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/contacts/add')}
              className="flex items-center space-x-1 text-slate-600 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add</span>
            </button>
            <button
              onClick={() => navigate('/contacts/import')}
              className="flex items-center space-x-1 text-blue-600 font-bold text-sm bg-blue-50 px-3 py-2 rounded-lg"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <ContactList emptyMessage="Add or import contacts to invite friends on your trips" />
      </div>
    </div>
  );
};

export default ContactsPage;
