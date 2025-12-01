interface BalanceCardProps {
  balance: number;
  dailyLimit: number;
  dailyWithdrawn: number;
}

export function BalanceCard({ balance, dailyLimit, dailyWithdrawn }: BalanceCardProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const remainingLimit = dailyLimit - dailyWithdrawn;
  const limitPercentUsed = (dailyWithdrawn / dailyLimit) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--color-gray-200)] p-6">
      <div className="text-center mb-6">
        <p className="text-[var(--color-gray-500)] text-sm mb-1">Available Balance</p>
        <p className="text-4xl font-bold text-[var(--color-gray-900)]">{formatCurrency(balance)}</p>
      </div>

      <div className="border-t border-[var(--color-gray-200)] pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[var(--color-gray-700)]">Daily Withdrawal Limit</span>
          <span className="text-sm font-medium text-[var(--color-gray-900)]">{formatCurrency(dailyLimit)}</span>
        </div>

        <div className="w-full bg-[var(--color-gray-200)] rounded-full h-2 mb-2">
          <div
            className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(limitPercentUsed, 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--color-gray-500)]">Used: {formatCurrency(dailyWithdrawn)}</span>
          <span className="text-[var(--color-success)] font-medium">
            Remaining: {formatCurrency(remainingLimit)}
          </span>
        </div>
      </div>
    </div>
  );
}
