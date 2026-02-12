import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface BalanceData {
  balance: number;
  dailyProfit: number;
  totalProfit: number;
  nextUpdate: Date;
  history: { date: string; balance: number }[];
}

export function useBalance() {
  const { user } = useAuth();
  const [balanceData, setBalanceData] = useState<BalanceData>({
    balance: 0,
    dailyProfit: 0,
    totalProfit: 0,
    nextUpdate: new Date(),
    history: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const plans = {
    basic: { rate: 0.5, minAmount: 50 },
    intermediate: { rate: 0.85, minAmount: 200 },
    premium: { rate: 1.5, minAmount: 500 },
  };

  const calculateDailyReturn = useCallback((plan: string, balance: number) => {
    const rate = plans[plan as keyof typeof plans]?.rate || 0.5;
    return balance * (rate / 100);
  }, []);

  const loadBalance = useCallback(() => {
    if (!user) {
      setBalanceData({
        balance: 0,
        dailyProfit: 0,
        totalProfit: 0,
        nextUpdate: new Date(),
        history: [],
      });
      setIsLoading(false);
      return;
    }

    const stored = localStorage.getItem(`balance_${user.uid}`);
    if (stored) {
      const data = JSON.parse(stored);
      const now = new Date();
      const lastUpdate = new Date(data.lastUpdate);
      const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

      let newBalance = data.balance;
      if (hoursSinceUpdate >= 24) {
        const profit = calculateDailyReturn(user.plan, data.balance);
        newBalance = data.balance + profit;
        data.balance = newBalance;
        data.lastUpdate = now.toISOString();
        data.history.push({ date: now.toISOString(), balance: newBalance });
        localStorage.setItem(`balance_${user.uid}`, JSON.stringify(data));
      }

      const nextUpdate = new Date(lastUpdate);
      nextUpdate.setHours(nextUpdate.getHours() + 24);

      setBalanceData({
        balance: data.balance,
        dailyProfit: calculateDailyReturn(user.plan, data.balance),
        totalProfit: data.balance - (data.initialBalance || data.balance),
        nextUpdate,
        history: data.history || [],
      });
    } else {
      const initialBalance = plans[user.plan as keyof typeof plans]?.minAmount || 50;
      const newData = {
        balance: initialBalance,
        initialBalance,
        lastUpdate: new Date().toISOString(),
        history: [{ date: new Date().toISOString(), balance: initialBalance }],
      };
      localStorage.setItem(`balance_${user.uid}`, JSON.stringify(newData));

      setBalanceData({
        balance: initialBalance,
        dailyProfit: calculateDailyReturn(user.plan, initialBalance),
        totalProfit: 0,
        nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        history: [{ date: new Date().toISOString(), balance: initialBalance }],
      });
    }
    setIsLoading(false);
  }, [user, calculateDailyReturn]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  const simulateUpdate = useCallback(() => {
    if (!user) return;

    const stored = localStorage.getItem(`balance_${user.uid}`);
    if (stored) {
      const data = JSON.parse(stored);
      const profit = calculateDailyReturn(user.plan, data.balance);
      data.balance = data.balance + profit;
      data.lastUpdate = new Date().toISOString();
      data.history.push({ date: new Date().toISOString(), balance: data.balance });
      localStorage.setItem(`balance_${user.uid}`, JSON.stringify(data));
      loadBalance();
    }
  }, [user, calculateDailyReturn, loadBalance]);

  return { balanceData, isLoading, simulateUpdate, loadBalance };
}
