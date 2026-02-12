import { createContext, useContext, useState, ReactNode } from 'react';
import { Plan, Withdrawal, DailyUpdate } from '../types';

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

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 50,
    dailyPercentage: 0.5,
    features: ['Acceso a señales básicas', 'Soporte por email', 'Retiros en 48h'],
    color: 'border-gray-500',
  },
  {
    id: 'intermediate',
    name: 'Intermedio',
    price: 200,
    dailyPercentage: 0.85,
    features: ['Acceso a todas las señales', 'Soporte prioritario', 'Retiros en 24h', 'Análisis diario'],
    color: 'border-blue-500',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 500,
    dailyPercentage: 1.5,
    features: ['Señales VIP exclusivas', 'Soporte 24/7', 'Retiros en 4h', 'Análisis personalizado', 'Señales de Scalping'],
    color: 'border-gold',
  },
];

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [referrals] = useState<number>(3);
  const [referralLink] = useState<string>('https://t.me/elite_forex_bot?ref=demo_user_123');
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

export { plans };
