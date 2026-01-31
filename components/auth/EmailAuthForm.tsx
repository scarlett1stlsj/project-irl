import React, { useState } from 'react';
import { ChevronLeft, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { signUpWithEmail, signInWithEmail } from '../../services/authService';

interface EmailAuthFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const EmailAuthForm: React.FC<EmailAuthFormProps> = ({ onBack, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      // Clean up Firebase error messages
      if (message.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists.');
      } else if (message.includes('auth/invalid-email')) {
        setError('Please enter a valid email address.');
      } else if (message.includes('auth/weak-password')) {
        setError('Password should be at least 6 characters.');
      } else if (message.includes('auth/user-not-found') || message.includes('auth/wrong-password')) {
        setError('Invalid email or password.');
      } else if (message.includes('auth/invalid-credential')) {
        setError('Invalid email or password.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 min-h-screen">
      <header className="flex items-center mb-10">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-2">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h1>
      </header>

      <div className="flex-1">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <Mail className="w-8 h-8 text-blue-500" />
        </div>

        <h2 className="text-2xl font-bold mb-2">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-slate-500 mb-8">
          {isSignUp
            ? 'Enter your email and create a password.'
            : 'Enter your email and password to continue.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-blue-600 font-medium"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailAuthForm;
