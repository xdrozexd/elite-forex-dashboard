import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, getDoc, addDoc } from 'firebase/firestore';

export interface UserData {
  uid: string;
  email: string;
  username: string;
  displayName?: string;
  phone?: string;
  isActive: boolean;
  plan: {
    currentPlanId: string;
    investedAmount: number;
    isActive: boolean;
  };
  balance: {
    total: number;
    invested: number;
    available: number;
    totalProfit: number;
  };
  role: 'user' | 'admin';
  createdAt: Date;
  referralCode: string;
}

export interface PendingDeposit {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  type: string;
  paymentMethod: string;
  proofImage?: string;
  createdAt: Date;
}

export interface PendingWithdrawal {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  netAmount: number;
  method: string;
  bankDetails?: any;
  cryptoDetails?: any;
  requestedAt: Date;
}

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvested: 0,
    totalProfitPaid: 0,
    pendingWithdrawals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check if current user is admin
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const checkAdmin = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      setIsAdmin(userDoc.data()?.role === 'admin');
    };

    checkAdmin();
  }, [user]);

  // Subscribe to all users
  useEffect(() => {
    if (!isAdmin) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as UserData[];

      setUsers(data);
      
      // Calculate stats
      const totalInvested = data.reduce((acc, u) => acc + (u.balance?.invested || 0), 0);
      const totalProfitPaid = data.reduce((acc, u) => acc + (u.balance?.totalProfit || 0), 0);
      
      setStats({
        totalUsers: data.length,
        totalInvested,
        totalProfitPaid,
        pendingWithdrawals: 0, // Will be updated by other listener
      });
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Subscribe to pending deposits
  useEffect(() => {
    if (!isAdmin) {
      setPendingDeposits([]);
      return;
    }

    const q = query(
      collection(db, 'deposits'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const deposits = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          // Get user info
          const userDocRef = doc(db, 'users', data.userId);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data() as any;
          
          return {
            id: docSnapshot.id,
            ...data,
            userEmail: userData?.email || 'Unknown',
            userName: userData?.username || 'Unknown',
            createdAt: data.createdAt?.toDate(),
          } as PendingDeposit;
        })
      );

      setPendingDeposits(deposits);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Subscribe to pending withdrawals
  useEffect(() => {
    if (!isAdmin) {
      setPendingWithdrawals([]);
      return;
    }

    const q = query(
      collection(db, 'withdrawals'),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const withdrawals = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          const userDocRef = doc(db, 'users', data.userId);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data() as any;
          
          return {
            id: docSnapshot.id,
            ...data,
            userEmail: userData?.email || 'Unknown',
            userName: userData?.username || 'Unknown',
            requestedAt: data.requestedAt?.toDate(),
          } as PendingWithdrawal;
        })
      );

      setPendingWithdrawals(withdrawals);
      setStats(prev => ({ ...prev, pendingWithdrawals: withdrawals.length }));
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const approveDeposit = useCallback(async (depositId: string, userId: string, amount: number) => {
    // Update deposit status
    await updateDoc(doc(db, 'deposits', depositId), {
      status: 'confirmed',
      confirmedAt: serverTimestamp(),
      confirmedBy: user?.uid,
    });

    // Create investment
    await addDoc(collection(db, 'investments'), {
      userId,
      amount,
      status: 'confirmed',
      isActive: true,
      startDate: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    // Update user balance
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'balance.invested': amount,
      'balance.total': amount,
      'plan.investedAmount': amount,
      'plan.isActive': true,
      updatedAt: serverTimestamp(),
    });
  }, [user]);

  const rejectDeposit = useCallback(async (depositId: string, reason: string) => {
    await updateDoc(doc(db, 'deposits', depositId), {
      status: 'rejected',
      rejectionReason: reason,
      processedAt: serverTimestamp(),
      processedBy: user?.uid,
    });
  }, [user]);

  const approveWithdrawal = useCallback(async (withdrawalId: string, transactionHash?: string) => {
    await updateDoc(doc(db, 'withdrawals', withdrawalId), {
      status: 'completed',
      processedAt: serverTimestamp(),
      processedBy: user?.uid,
      transactionHash,
    });
  }, [user]);

  const rejectWithdrawal = useCallback(async (withdrawalId: string, reason: string) => {
    await updateDoc(doc(db, 'withdrawals', withdrawalId), {
      status: 'rejected',
      rejectionReason: reason,
      processedAt: serverTimestamp(),
      processedBy: user?.uid,
    });
  }, [user]);

  return {
    isAdmin,
    users,
    pendingDeposits,
    pendingWithdrawals,
    stats,
    isLoading,
    approveDeposit,
    rejectDeposit,
    approveWithdrawal,
    rejectWithdrawal,
  };
}
