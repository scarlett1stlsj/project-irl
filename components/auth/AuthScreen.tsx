import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plane, Mail, Phone, Chrome } from 'lucide-react';
import EmailAuthForm from './EmailAuthForm';
import PhoneAuthForm from './PhoneAuthForm';
import { signInWithGoogle } from '../../services/authService';

type AuthMethod = 'select' | 'email' | 'phone';

const AuthScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authMethod, setAuthMethod] = useState<AuthMethod>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    navigate(from, { replace: true });
  };

  if (authMethod === 'email') {
    return (
      <EmailAuthForm
        onBack={() => setAuthMethod('select')}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  if (authMethod === 'phone') {
    return (
      <PhoneAuthForm
        onBack={() => setAuthMethod('select')}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 min-h-screen">
      <header className="mt-16 mb-12 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Plane className="w-10 h-10 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Trip Mode</h1>
        <p className="text-slate-500 mt-2">See more friends on every trip.</p>
      </header>

      <div className="flex-1 flex flex-col justify-center space-y-4">
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border-2 border-slate-200 text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 hover:border-slate-300 transition-colors disabled:opacity-50"
        >
          <Chrome className="w-5 h-5 text-blue-500" />
          <span>Continue with Google</span>
        </button>

        <button
          onClick={() => setAuthMethod('email')}
          disabled={loading}
          className="w-full bg-white border-2 border-slate-200 text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 hover:border-slate-300 transition-colors disabled:opacity-50"
        >
          <Mail className="w-5 h-5 text-slate-600" />
          <span>Continue with Email</span>
        </button>

        <button
          onClick={() => setAuthMethod('phone')}
          disabled={loading}
          className="w-full bg-white border-2 border-slate-200 text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 hover:border-slate-300 transition-colors disabled:opacity-50"
        >
          <Phone className="w-5 h-5 text-slate-600" />
          <span>Continue with Phone</span>
        </button>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 mt-8 pb-6">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default AuthScreen;
