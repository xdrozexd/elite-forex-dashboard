import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { db, storage } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  type: 'initial' | 'topup' | 'plan_upgrade';
  paymentMethod: 'bank_transfer_rd' | 'crypto_usdt';
  status: 'pending' | 'confirmed' | 'rejected';
  proofImage?: string;
  previousPlanId?: string;
  newPlanId?: string;
  notes?: string;
  createdAt: Date;
  confirmedAt?: Date;
}

export function useDeposits() {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDeposits([]);
      setPendingDeposits([]);
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'deposits'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        confirmedAt: doc.data().confirmedAt?.toDate(),
      })) as Deposit[];

      setDeposits(data);
      setPendingDeposits(data.filter(d => d.status === 'pending'));
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching deposits:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createDeposit = useCallback(async (
    amount: number,
    type: Deposit['type'],
    paymentMethod: Deposit['paymentMethod'],
    proofFile?: File,
    planData?: { previousPlanId?: string; newPlanId?: string }
  ) => {
    if (!user) throw new Error('No user');

    let proofUrl = '';

    // Upload proof image if provided
    if (proofFile) {
      const storageRef = ref(storage, `deposits/${user.uid}/${Date.now()}_${proofFile.name}`);
      await uploadBytes(storageRef, proofFile);
      proofUrl = await getDownloadURL(storageRef);
    }

    const newDeposit = {
      userId: user.uid,
      amount,
      type,
      paymentMethod,
      status: 'pending',
      proofImage: proofUrl,
      ...planData,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'deposits'), newDeposit);
    return docRef.id;
  }, [user]);

  return {
    deposits,
    pendingDeposits,
    isLoading,
    createDeposit,
  };
}
