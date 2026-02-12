import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Plan, Withdrawal, DailyUpdate } from '../types';
import { getPlanById } from '../data/plans';
import { useAuth } from './useAuth';
export { plans } from '../data/plans';

interface AppContextType {
  currentPlan: Plan | null;
  balance: number;
  referrals: number;
  referralLink: string;
  withdrawals: Withdrawal[];
  dailyUpdates: DailyUpdate[];
  updateBalance: (percentage: number) => void;
  setPlan: (plan: Plan) => void;
  requestWithdrawal: (amount: number) => void;
  simulateDailyUpdate: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [referrals] = useState<number>(3);
  const [referralLink] = useState<string>('https://t.me/Elite_inversiones_bot?ref=user_123');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([
    { id: '1', amount: 150, status: 'approved', date: '2024-01-10' },
    { id: '2', amount: 75, status: 'approved', date: '2024-01-05' },
  ]);
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>([
    { date: '2024-01-01', percentage: 0.5, amount: 0.25 },
    { date: '2024-01-02', percentage: 0.5, amount: 0.25 },
    { date: '2024-01-03', percentage: 0.85, amount: 0.43 },
    { date: '2024-01-04', percentage: 0.5, amount: 0.25 },
    { date: '2024-01-05', percentage: 1.5, amount: 0.75 },
    { date: '2024-01-06', percentage: 0.85, amount: 0.43 },
    { date: '2024-01-07', percentage: 0.5, amount: 0.25 },
    { date: '2024-01-08', percentage: 1.5, amount: 0.75 },
    { date: '2024-01-09', percentage: 0.85, amount: 0.43 },
    { date: '2024-01-10', percentage: 0.5, amount: 0.25 },
  ]);

  useEffect(() => {
    if (user?.plan) {
      const plan = getPlanById(user.plan);
      if (plan) {
        setCurrentPlan(plan);
        setBalance(plan.price);
      }
    }
  }, [user]);

  const updateBalance = (percentage: number) => {
    if (balance > 0) {
      const dailyAmount = (balance * percentage) / 100;
      setBalance(prev => prev + dailyAmount);
      const today = new Date().toISOString().split('T')[0];
      setDailyUpdates(prev => [...prev.slice(-9), {
        date: today,
        percentage,
        amount: dailyAmount,
      }]);
    }
  };

  const setPlan = (plan: Plan) => {
    setCurrentPlan(plan);
    setBalance(plan.price);
  };

  const requestWithdrawal = (amount: number) => {
    if (amount >= 50 && amount <= balance) {
      setBalance(prev => prev - amount);
      setWithdrawals(prev => [{
        id: Date.now().toString(),
        amount,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      }, ...prev]);
    }
  };

  const simulateDailyUpdate = () => {
    if (currentPlan) {
      updateBalance(currentPlan.dailyPercentage);
    }
  };

  return (
    <AppContext.Provider value={{
      currentPlan,
      balance,
      referrals,
      referralLink,
      withdrawals,
      dailyUpdates,
      updateBalance,
      setPlan,
      requestWithdrawal,
      simulateDailyUpdate,
    }}>
      {children}
    </AppContext.Provider>
  );
};
