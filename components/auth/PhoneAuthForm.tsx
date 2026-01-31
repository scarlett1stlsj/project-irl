import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Phone, Loader2 } from 'lucide-react';
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import {
  setupRecaptcha,
  sendPhoneVerification,
  verifyPhoneCode,
} from '../../services/authService';

interface PhoneAuthFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const PhoneAuthForm: React.FC<PhoneAuthFormProps> = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Cleanup recaptcha on unmount
    return () => {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
      }
    };
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format phone number (add + if not present)
      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+1${phoneNumber.replace(/\D/g, '')}`;

      // Setup recaptcha
      if (!recaptchaRef.current) {
        recaptchaRef.current = setupRecaptcha('recaptcha-container');
      }

      // Send verification code
      const result = await sendPhoneVerification(formattedPhone, recaptchaRef.current);
      setConfirmationResult(result);
      setStep('verify');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send verification code';
      if (message.includes('auth/invalid-phone-number')) {
        setError('Please enter a valid phone number.');
      } else if (message.includes('auth/too-many-requests')) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;

    setLoading(true);
    setError(null);

    try {
      await verifyPhoneCode(confirmationResult, verificationCode);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      if (message.includes('auth/invalid-verification-code')) {
        setError('Invalid verification code. Please try again.');
      } else if (message.includes('auth/code-expired')) {
        setError('Code expired. Please request a new one.');
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
        <button
          onClick={step === 'verify' ? () => setStep('phone') : onBack}
          className="p-2 -ml-2 text-slate-400"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-2">
          {step === 'phone' ? 'Phone Sign In' : 'Enter Code'}
        </h1>
      </header>

      <div className="flex-1">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <Phone className="w-8 h-8 text-blue-500" />
        </div>

        {step === 'phone' ? (
          <>
            <h2 className="text-2xl font-bold mb-2">Enter your phone number</h2>
            <p className="text-slate-500 mb-8">
              We'll send you a verification code via SMS.
            </p>

            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Send Code</span>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2">Verify your phone</h2>
            <p className="text-slate-500 mb-8">
              Enter the 6-digit code we sent to {phoneNumber}
            </p>

            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Verification Code
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.replace(/\D/g, ''))
                  }
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Verify</span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setStep('phone');
                  setError(null);
                  setVerificationCode('');
                }}
                className="text-blue-600 font-medium"
              >
                Didn't receive the code? Try again
              </button>
            </div>
          </>
        )}
      </div>

      {/* Hidden recaptcha container */}
      <div id="recaptcha-container" />
    </div>
  );
};

export default PhoneAuthForm;
