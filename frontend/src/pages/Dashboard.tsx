import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionModal } from '../components/TransactionModal';
import { SuccessModal } from '../components/SuccessModal';
import { accountAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';
import type { BalanceResponse } from '../types';

const INACTIVITY_TIMEOUT_SECONDS = 15;

export function Dashboard() {
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<'withdraw' | 'deposit' | null>(null);
  const [successData, setSuccessData] = useState<{
    type: 'withdraw' | 'deposit';
    amount: number;
  } | null>(null);

  const navigate = useNavigate();
  const { accountNumber, logout } = useAuth();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const { remainingSeconds } = useInactivityTimeout({
    timeoutSeconds: INACTIVITY_TIMEOUT_SECONDS,
    onTimeout: handleLogout,
    enabled: !successData,
  });

  const fetchBalance = async () => {
    try {
      const data = await accountAPI.getBalance();
      setBalance(data);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleWithdraw = async (amountCents: number) => {
    await accountAPI.withdraw({ amount: amountCents });
    await fetchBalance();
    setSuccessData({ type: 'withdraw', amount: amountCents });
  };

  const handleDeposit = async (amountCents: number) => {
    await accountAPI.deposit({ amount: amountCents });
    await fetchBalance();
    setSuccessData({ type: 'deposit', amount: amountCents });
  };

  const handleAnotherTransaction = () => {
    setSuccessData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[--color-gray-100] flex items-center justify-center">
        <div className="text-[--color-gray-500]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--color-gray-100]">
      {/* Header */}
      <header className="bg-[--color-primary]">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-white">
            <p className="text-sm opacity-80">Account</p>
            <p className="font-semibold tracking-wide">
              ****{accountNumber?.slice(-4)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!successData && (
              <div className="text-white text-right">
                <p className="text-xs opacity-70">Session</p>
                <p className="text-sm font-semibold">{remainingSeconds}s</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        {balance && (
          <BalanceCard
            balance={balance.balance}
            dailyLimit={balance.daily_limit}
            dailyWithdrawn={balance.daily_withdrawn}
          />
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setModalType('withdraw')}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm border border-[--color-gray-200] hover:border-[--color-primary] hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-[--color-primary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-[--color-gray-900]">Withdraw</span>
            <span className="text-xs text-[--color-gray-500] mt-1">Get Cash</span>
          </button>

          <button
            onClick={() => setModalType('deposit')}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm border border-[--color-gray-200] hover:border-[--color-success] hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-[--color-success]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="font-semibold text-[--color-gray-900]">Deposit</span>
            <span className="text-xs text-[--color-gray-500] mt-1">Add Funds</span>
          </button>
        </div>

        {/* Quick Withdraw */}
        <div className="bg-white rounded-lg shadow-sm border border-[--color-gray-200] p-6">
          <h3 className="font-semibold text-[--color-gray-900] mb-4">Quick Withdraw</h3>
          <div className="grid grid-cols-4 gap-3">
            {[20, 40, 60, 100].map((amount) => (
              <button
                key={amount}
                onClick={() => handleWithdraw(amount * 100)}
                disabled={!balance || amount * 100 > balance.balance || amount * 100 > (balance.daily_limit - balance.daily_withdrawn)}
                className="py-3 bg-[--color-gray-50] text-[--color-gray-900] hover:bg-[--color-primary] hover:text-white rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[--color-gray-50] disabled:hover:text-[--color-gray-900] border border-[--color-gray-200]"
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="text-center text-sm text-[--color-gray-500] pb-6">
          <p>Daily withdrawal limit: $500</p>
          <p>Withdrawals must be in multiples of $20</p>
        </div>
      </main>

      {/* Transaction Modals */}
      <TransactionModal
        type="withdraw"
        isOpen={modalType === 'withdraw'}
        onClose={() => setModalType(null)}
        onSubmit={handleWithdraw}
        maxAmount={balance ? Math.min(balance.balance, balance.daily_limit - balance.daily_withdrawn) : 0}
      />

      <TransactionModal
        type="deposit"
        isOpen={modalType === 'deposit'}
        onClose={() => setModalType(null)}
        onSubmit={handleDeposit}
      />

      {/* Success Modal */}
      {successData && (
        <SuccessModal
          isOpen={true}
          type={successData.type}
          amount={successData.amount}
          onAnotherTransaction={handleAnotherTransaction}
          onExit={handleLogout}
          autoLogoutSeconds={INACTIVITY_TIMEOUT_SECONDS}
        />
      )}
    </div>
  );
}
