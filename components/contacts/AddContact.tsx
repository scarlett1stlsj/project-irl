import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Mail, Phone, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { addContact } from '../../services/firestoreService';

const AddContact: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError('Please enter an email or phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addContact(user.uid, {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact');
      setLoading(false);
    }
  };

  const handleAddAnother = () => {
    setName('');
    setEmail('');
    setPhone('');
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="flex-1 flex flex-col p-6 min-h-screen">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Contact Added!</h2>
            <p className="text-slate-500">{name} has been added to your contacts.</p>
          </div>
          <div className="w-full space-y-3">
            <button
              onClick={handleAddAnother}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl"
            >
              Add Another Contact
            </button>
            <button
              onClick={() => navigate('/contacts')}
              className="w-full bg-slate-100 text-slate-700 font-bold py-4 rounded-2xl"
            >
              View All Contacts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 min-h-screen">
      <header className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-2">Add Contact</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-400">
            Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input
              type="text"
              placeholder="Contact name"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-400">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-400">Phone</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input
              type="tel"
              placeholder="+1 (555) 123-4567"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center">
          Enter at least an email or phone number
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Add Contact'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddContact;
