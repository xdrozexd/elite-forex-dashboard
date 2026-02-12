import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  fee: number;
  netAmount: number;
  method: 'bank_transfer_rd' | 'crypto_usdt';
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  cryptoDetails?: {
    network: string;
    walletAddress: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: string;
  rejectionReason?: string;
  transactionHash?: string;
  notes?: string;
}

export function useWithdrawals() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWithdrawals([]);
      setPendingWithdrawals([]);
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'withdrawals'),
      where('userId', '==', user.uid),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate(),
        processedAt: doc.data().processedAt?.toDate(),
      })) as Withdrawal[];

      setWithdrawals(data);
      setPendingWithdrawals(data.filter(w => w.status === 'pending'));
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching withdrawals:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const requestWithdrawal = useCallback(async (
    amount: number,
    method: Withdrawal['method'],
    details: Withdrawal['bankDetails'] | Withdrawal['cryptoDetails']
  ) => {
    if (!user) throw new Error('No user');

    const fee = 0; // Sin comisión por ahora
    const netAmount = amount - fee;

    const newWithdrawal = {
      userId: user.uid,
      amount,
      fee,
      netAmount,
      method,
      status: 'pending',
      ...(method === 'bank_transfer_rd' 
        ? { bankDetails: details }
        : { cryptoDetails: details }
      ),
      requestedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'withdrawals'), newWithdrawal);
    return docRef.id;
  }, [user]);

  return {
    withdrawals,
    pendingWithdrawals,
    isLoading,
    requestWithdrawal,
  };
}
