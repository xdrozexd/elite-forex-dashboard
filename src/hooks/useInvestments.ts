import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export interface Investment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  type: 'initial' | 'topup';
  status: 'pending' | 'confirmed' | 'rejected';
  paymentMethod: 'bank_transfer_rd' | 'crypto_usdt';
  paymentProof?: string;
  dailyProfit: number;
  totalProfitGenerated: number;
  startDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

export function useInvestments() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [activeInvestment, setActiveInvestment] = useState<Investment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setInvestments([]);
      setActiveInvestment(null);
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'investments'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        startDate: doc.data().startDate?.toDate(),
      })) as Investment[];

      setInvestments(data);
      const active = data.find(inv => inv.isActive && inv.status === 'confirmed');
      setActiveInvestment(active || null);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching investments:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createInvestment = useCallback(async (data: Omit<Investment, 'id' | 'createdAt' | 'status'>) => {
    if (!user) throw new Error('No user');

    const plans = {
      basic: { rate: 0.5 },
      intermediate: { rate: 0.85 },
      premium: { rate: 1.5 },
    };

    const rate = plans[data.planId as keyof typeof plans]?.rate || 0.5;
    const dailyProfit = data.amount * (rate / 100);

    const newInvestment = {
      ...data,
      userId: user.uid,
      status: 'pending',
      dailyProfit,
      totalProfitGenerated: 0,
      isActive: false,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'investments'), newInvestment);
    return docRef.id;
  }, [user]);

  const topUpInvestment = useCallback(async (investmentId: string, amount: number) => {
    const investmentRef = doc(db, 'investments', investmentId);
    await updateDoc(investmentRef, {
      amount: amount,
      updatedAt: serverTimestamp(),
    });
  }, []);

  return {
    investments,
    activeInvestment,
    isLoading,
    createInvestment,
    topUpInvestment,
  };
}
