import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Keypad } from '../components/Keypad';
import { PinDisplay } from '../components/PinDisplay';
import { authAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [step, setStep] = useState<'account' | 'pin'>('account');
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleAccountSubmit = () => {
    if (accountNumber.length === 10) {
      setStep('pin');
      setError('');
    }
  };

  const handlePinChange = async (newPin: string) => {
    setPin(newPin);
    setError('');

    if (newPin.length === 4) {
      setLoading(true);
      try {
        const response = await authAPI.login({
          account_number: accountNumber,
          pin: newPin,
        });
        login(response.access_token, accountNumber);
        navigate('/dashboard');
      } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: { message?: string } } } };
        setError(error.response?.data?.detail?.message || 'Login failed');
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
    <div className="min-h-screen bg-[--color-gray-100] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 border border-[--color-gray-200]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[--color-primary] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[--color-gray-900]">ATM</h1>
          <p className="text-[--color-gray-700] mt-1">
            {step === 'account' ? 'Enter your account number' : 'Enter your PIN'}
          </p>
        </div>

        {step === 'account' ? (
          <>
            {/* Account Number Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[--color-gray-700] mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setAccountNumber(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && accountNumber.length === 10) {
                    handleAccountSubmit();
                  }
                }}
                placeholder="Enter 10-digit account number"
                className="w-full px-4 py-3 text-lg text-center tracking-widest border border-[--color-gray-300] rounded-lg focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20 focus:outline-none bg-white text-[--color-gray-900]"
                autoFocus
              />
              <p className="text-sm text-[--color-gray-500] mt-2 text-center">
                {accountNumber.length}/10 digits
              </p>
            </div>

            <button
              onClick={handleAccountSubmit}
              disabled={accountNumber.length !== 10}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                accountNumber.length === 10
                  ? 'bg-[--color-primary] text-white hover:bg-[--color-primary-dark]'
                  : 'bg-[--color-gray-200] text-[--color-gray-500] cursor-not-allowed'
              }`}
            >
              {accountNumber.length === 10 ? 'Continue' : `Enter ${10 - accountNumber.length} more digits`}
            </button>

            {/* Demo accounts */}
            <div className="mt-6 p-4 bg-[--color-gray-50] rounded-lg border border-[--color-gray-200]">
              <p className="text-sm text-[--color-gray-700] text-center mb-3">Demo Accounts</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAccountNumber('1234567890')}
                  className="py-2 px-3 bg-white border border-[--color-gray-300] rounded-lg text-sm text-[--color-gray-900] hover:bg-[--color-gray-50] transition-colors"
                >
                  1234567890
                </button>
                <button
                  onClick={() => setAccountNumber('0987654321')}
                  className="py-2 px-3 bg-white border border-[--color-gray-300] rounded-lg text-sm text-[--color-gray-900] hover:bg-[--color-gray-50] transition-colors"
                >
                  0987654321
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* PIN Entry */}
            <div className="mb-6">
              <div className="text-center mb-4">
                <p className="text-sm text-[--color-gray-700]">Account: <span className="font-medium">{accountNumber}</span></p>
              </div>

              <div className="flex justify-center mb-6">
                <PinDisplay length={4} filled={pin.length} />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-[--color-danger] text-sm text-center">
                  {error}
                </div>
              )}

              {loading && (
                <div className="mb-4 text-center text-[--color-gray-500]">
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

            <button
              onClick={handleBack}
              className="w-full py-3 bg-[--color-gray-100] text-[--color-gray-700] rounded-lg font-medium hover:bg-[--color-gray-200] transition-colors border border-[--color-gray-300]"
            >
              Back
            </button>

            {/* PIN hint */}
            <p className="text-sm text-[--color-gray-500] text-center mt-4">
              Demo PINs: 1234 or 4321
            </p>
          </>
        )}
      </div>
    </div>
  );
}
