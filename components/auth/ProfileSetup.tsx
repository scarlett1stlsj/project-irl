import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateProfile, profile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateProfile({ name: name.trim() });
      // Set flag to bypass redirect check temporarily
      sessionStorage.setItem('profileSetupComplete', 'true');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 min-h-screen">
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <User className="w-10 h-10 text-blue-500" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">What's your name?</h1>
        <p className="text-slate-500 text-center mb-8">
          This is how friends will see you on Trip Mode.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400">
              Your Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
