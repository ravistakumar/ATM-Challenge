import { useState } from 'react';
import { getErrorMessage } from '../utils/errorHandling';

// Constants
const MIN_WITHDRAWAL = 20;
const WITHDRAWAL_INCREMENT = 20;

interface TransactionModalProps {
  type: 'withdraw' | 'deposit';
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
  maxAmount?: number;
}

export function TransactionModal({
  type,
  isOpen,
  onClose,
  onSubmit,
  maxAmount,
}: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const quickAmounts = type === 'withdraw'
    ? [20, 40, 60, 100, 200]
    : [50, 100, 200, 500];

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (type === 'withdraw') {
      if (numAmount < MIN_WITHDRAWAL) {
        setError(`Minimum withdrawal is $${MIN_WITHDRAWAL}`);
        return;
      }
      if (numAmount % WITHDRAWAL_INCREMENT !== 0) {
        setError(`Amount must be in multiples of $${WITHDRAWAL_INCREMENT}`);
        return;
      }
      if (maxAmount && numAmount > maxAmount / 100) {
        setError(`Maximum available: $${(maxAmount / 100).toFixed(2)}`);
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(numAmount * 100);
      setAmount('');
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 border border-[var(--color-gray-200)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--color-gray-900)]">
            {type === 'withdraw' ? 'Withdraw Cash' : 'Deposit Funds'}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-gray-500)] hover:text-[var(--color-gray-700)] text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--color-gray-700)] mb-2">
            Enter Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-gray-500)] text-xl">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-4 text-2xl font-semibold border border-[var(--color-gray-300)] rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none bg-white text-[var(--color-gray-900)]"
            />
          </div>
          {type === 'withdraw' && (
            <p className="text-sm text-[var(--color-gray-500)] mt-1">
              Minimum ${MIN_WITHDRAWAL}, in multiples of ${WITHDRAWAL_INCREMENT}
            </p>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm text-[var(--color-gray-700)] mb-2">Quick Select</p>
          <div className="grid grid-cols-5 gap-2">
            {quickAmounts.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleQuickAmount(value)}
                className={`
                  py-2 rounded-lg text-sm font-medium transition-colors border
                  ${amount === value.toString()
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-white text-[var(--color-gray-700)] border-[var(--color-gray-300)] hover:bg-[var(--color-gray-50)]'
                  }
                `}
              >
                ${value}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-[var(--color-danger)] text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[var(--color-gray-100)] text-[var(--color-gray-700)] rounded-lg font-medium hover:bg-[var(--color-gray-200)] transition-colors border border-[var(--color-gray-300)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !amount}
            className={`
              flex-1 py-3 rounded-lg font-medium transition-colors
              ${loading || !amount
                ? 'bg-[var(--color-gray-200)] text-[var(--color-gray-500)] cursor-not-allowed'
                : type === 'withdraw'
                  ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white'
                  : 'bg-[var(--color-success)] hover:opacity-90 text-white'
              }
            `}
          >
            {loading ? 'Processing...' : !amount ? 'Enter Amount' : type === 'withdraw' ? 'Withdraw' : 'Deposit'}
          </button>
        </div>
      </div>
    </div>
  );
}
