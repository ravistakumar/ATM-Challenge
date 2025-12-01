import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Keypad } from '../components/Keypad';
import { PinDisplay } from '../components/PinDisplay';
import { authAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errorHandling';

// Constants
const ACCOUNT_NUMBER_LENGTH = 10;
const PIN_LENGTH = 4;
const DEMO_ACCOUNTS = [
  { number: '1234567890', pin: '1234' },
  { number: '0987654321', pin: '4321' },
];

export function Login() {
  const [step, setStep] = useState<'account' | 'pin'>('account');
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Abort controller to cancel previous login requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleAccountSubmit = () => {
    if (accountNumber.length === ACCOUNT_NUMBER_LENGTH) {
      setStep('pin');
      setError('');
    }
  };

  const handlePinChange = async (newPin: string) => {
    setPin(newPin);
    setError('');

    if (newPin.length === PIN_LENGTH) {
      // Cancel any previous login request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      try {
        const response = await authAPI.login({
          account_number: accountNumber,
          pin: newPin,
        });
        login(response.access_token, accountNumber);
        navigate('/dashboard');
      } catch (err: unknown) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(getErrorMessage(err));
        setPin('');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setStep('account');
    setPin('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[var(--color-gray-100)] flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg min-h-[600px] p-10 border border-[var(--color-gray-200)] flex flex-col">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-gray-900)]">ATM</h1>
          <p className="text-lg text-[var(--color-gray-700)] mt-2">
            {step === 'account' ? 'Enter your account number' : 'Enter your PIN'}
          </p>
        </div>

        {step === 'account' ? (
          <div className="flex-1 flex flex-col">
            {/* Account Number Input */}
            <div className="mb-8">
              <label className="block text-base font-medium text-[var(--color-gray-700)] mb-3">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, ACCOUNT_NUMBER_LENGTH);
                  setAccountNumber(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && accountNumber.length === ACCOUNT_NUMBER_LENGTH) {
                    handleAccountSubmit();
                  }
                }}
                placeholder={`Enter ${ACCOUNT_NUMBER_LENGTH}-digit account number`}
                maxLength={ACCOUNT_NUMBER_LENGTH}
                className="account-input w-full px-5 py-4 text-xl text-center tracking-[0.3em] border-2 border-[var(--color-gray-300)] rounded-xl focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none bg-white text-[var(--color-gray-900)]"
                autoFocus
              />
              <p className="text-base text-[var(--color-gray-500)] mt-3 text-center">
                {accountNumber.length}/{ACCOUNT_NUMBER_LENGTH} digits
              </p>
            </div>

            <button
              onClick={handleAccountSubmit}
              disabled={accountNumber.length !== ACCOUNT_NUMBER_LENGTH}
              className={`w-full py-5 rounded-xl font-semibold text-xl transition-all ${
                accountNumber.length === ACCOUNT_NUMBER_LENGTH
                  ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-lg hover:shadow-xl'
                  : 'bg-[var(--color-gray-200)] text-[var(--color-gray-500)] cursor-not-allowed'
              }`}
            >
              {accountNumber.length === ACCOUNT_NUMBER_LENGTH ? 'Continue' : `Enter ${ACCOUNT_NUMBER_LENGTH - accountNumber.length} more digits`}
            </button>

            {/* Demo accounts */}
            <div className="mt-auto pt-8">
              <div className="p-5 bg-[var(--color-gray-50)] rounded-xl border border-[var(--color-gray-200)]">
                <p className="text-base text-[var(--color-gray-700)] text-center mb-4">Demo Accounts</p>
                <div className="grid grid-cols-2 gap-4">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button
                      key={account.number}
                      onClick={() => setAccountNumber(account.number)}
                      className="py-3 px-4 bg-white border-2 border-[var(--color-gray-300)] rounded-xl text-base font-medium text-[var(--color-gray-900)] hover:bg-[var(--color-gray-50)] hover:border-[var(--color-primary)] transition-all"
                    >
                      {account.number}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* PIN Entry */}
            <div className="mb-6">
              <div className="text-center mb-6">
                <p className="text-base text-[var(--color-gray-700)]">Account: <span className="font-semibold tracking-wide">{accountNumber}</span></p>
              </div>

              <div className="flex justify-center mb-8">
                <PinDisplay length={4} filled={pin.length} />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-[var(--color-danger)] text-base text-center">
                  {error}
                </div>
              )}

              {loading && (
                <div className="mb-6 text-center text-[var(--color-gray-500)] text-lg">
                  Verifying...
                </div>
              )}

              <div className="flex justify-center">
                <Keypad
                  value={pin}
                  onChange={handlePinChange}
                  maxLength={4}
                />
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <button
                onClick={handleBack}
                className="w-full py-4 bg-[var(--color-gray-100)] text-[var(--color-gray-700)] rounded-xl font-medium text-lg hover:bg-[var(--color-gray-200)] transition-colors border-2 border-[var(--color-gray-300)]"
              >
                Back
              </button>

              {/* PIN hint */}
              <p className="text-base text-[var(--color-gray-500)] text-center">
                Demo PINs: {DEMO_ACCOUNTS.map(a => a.pin).join(' or ')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
