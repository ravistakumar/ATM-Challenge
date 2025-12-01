import { useEffect, useState } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  type: 'withdraw' | 'deposit';
  amount: number;
  onAnotherTransaction: () => void;
  onExit: () => void;
  autoLogoutSeconds?: number;
}

export function SuccessModal({
  isOpen,
  type,
  amount,
  onAnotherTransaction,
  onExit,
  autoLogoutSeconds = 15,
}: SuccessModalProps) {
  const [countdown, setCountdown] = useState(autoLogoutSeconds);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(autoLogoutSeconds);
      return;
    }

    setCountdown(autoLogoutSeconds);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onExit();
          return autoLogoutSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, autoLogoutSeconds, onExit]);

  if (!isOpen) return null;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center border border-[--color-gray-200]">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-[--color-success]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-[--color-gray-900] mb-2">
          Transaction Complete
        </h2>

        {/* Amount */}
        <p className="text-[--color-gray-700] mb-1">
          Successfully {type === 'withdraw' ? 'withdrew' : 'deposited'}
        </p>
        <p className="text-3xl font-bold text-[--color-gray-900] mb-6">
          {formatCurrency(amount)}
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onAnotherTransaction}
            className="w-full py-3 bg-[--color-primary] text-white rounded-lg font-medium hover:bg-[--color-primary-dark] transition-colors"
          >
            Another Transaction
          </button>
          <button
            onClick={onExit}
            className="w-full py-3 bg-[--color-gray-100] text-[--color-gray-700] rounded-lg font-medium hover:bg-[--color-gray-200] transition-colors border border-[--color-gray-300]"
          >
            Exit
          </button>
        </div>

        {/* Countdown */}
        <p className="text-sm text-[--color-gray-500] mt-4">
          Auto-logout in <span className="font-semibold text-[--color-gray-700]">{countdown}</span> seconds
        </p>
      </div>
    </div>
  );
}
