import { useState, useCallback } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  type: 'deposit' | 'withdrawal' | 'chat' | 'user' | 'system';
  title: string;
  message: string;
  userId?: string;
  userName?: string;
  amount?: number;
  read: boolean;
  createdAt: Date;
  actionRequired?: boolean;
  actionType?: 'approve_deposit' | 'approve_withdrawal' | 'view_chat';
  relatedId?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalInvested: number;
  totalProfitPaid: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  activeInvestments: number;
  todaysProfit: number;
  unreadMessages: number;
  newUsersToday: number;
}

export function useAdminNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalInvested: 0,
    totalProfitPaid: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    activeInvestments: 0,
    todaysProfit: 0,
    unreadMessages: 0,
    newUsersToday: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Suscribirse a notificaciones del admin
  const subscribeToNotifications = useCallback(() => {
    if (!user?.uid || user.role !== 'admin') return () => {};

    setIsLoading(true);

    const notificationsQuery = query(
      collection(db, 'admin_notifications', 'global', 'items'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Notification[];

      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Crear notificación
  const createNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    try {
      await addDoc(collection(db, 'admin_notifications', 'global', 'items'), {
        ...notification,
        read: false,
        createdAt: serverTimestamp()
      });

      // Actualizar contador global
      await updateDoc(doc(db, 'admin_notifications', 'global'), {
        unreadCount: unreadCount + 1,
        lastUpdatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }, [unreadCount]);

  // Marcar notificación como leída
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await updateDoc(
        doc(db, 'admin_notifications', 'global', 'items', notificationId),
        { read: true }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadQuery = query(
        collection(db, 'admin_notifications', 'global', 'items'),
        where('read', '==', false)
      );

      const unreadDocs = await getDocs(unreadQuery);
      const batch = writeBatch(db);

      unreadDocs.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();

      await updateDoc(doc(db, 'admin_notifications', 'global'), {
        unreadCount: 0
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  // Obtener estadísticas en tiempo real
  const subscribeToStats = useCallback(() => {
    if (!user?.uid || user.role !== 'admin') return () => {};

    // Usuarios
    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newUsersToday = snapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt?.toDate();
        return createdAt && createdAt >= today;
      }).length;

      setStats(prev => ({
        ...prev,
        totalUsers: snapshot.size,
        newUsersToday
      }));
    });

    // Inversiones activas
    const investmentsQuery = query(
      collection(db, 'investments'),
      where('isActive', '==', true)
    );
    
    const investmentsUnsubscribe = onSnapshot(investmentsQuery, (snapshot) => {
      const totalInvested = snapshot.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0);
      
      setStats(prev => ({
        ...prev,
        activeInvestments: snapshot.size,
        totalInvested
      }));
    });

    // Depósitos pendientes
    const depositsQuery = query(
      collection(db, 'deposits'),
      where('status', '==', 'pending')
    );

    const depositsUnsubscribe = onSnapshot(depositsQuery, (snapshot) => {
      setStats(prev => ({
        ...prev,
        pendingDeposits: snapshot.size
      }));
    });

    // Retiros pendientes
    const withdrawalsQuery = query(
      collection(db, 'withdrawals'),
      where('status', '==', 'pending')
    );

    const withdrawalsUnsubscribe = onSnapshot(withdrawalsQuery, (snapshot) => {
      setStats(prev => ({
        ...prev,
        pendingWithdrawals: snapshot.size
      }));
    });

    // Mensajes no leídos
    const chatsQuery = query(
      collection(db, 'chats'),
      where('unreadCount', '>', 0)
    );

    const chatsUnsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const totalUnread = snapshot.docs.reduce((acc, doc) => acc + (doc.data().unreadCount || 0), 0);
      
      setStats(prev => ({
        ...prev,
        unreadMessages: totalUnread
      }));
    });

    return () => {
      usersUnsubscribe();
      investmentsUnsubscribe();
      depositsUnsubscribe();
      withdrawalsUnsubscribe();
      chatsUnsubscribe();
    };
  }, [user]);

  // Crear notificación automática al recibir depósito
  const notifyNewDeposit = useCallback(async (depositId: string, userId: string, userName: string, amount: number) => {
    await createNotification({
      type: 'deposit',
      title: 'Nuevo Depósito Pendiente',
      message: `${userName} ha enviado un depósito de $${amount}`,
      userId,
      userName,
      amount,
      actionRequired: true,
      actionType: 'approve_deposit',
      relatedId: depositId
    });
  }, [createNotification]);

  // Crear notificación automática al recibir retiro
  const notifyNewWithdrawal = useCallback(async (withdrawalId: string, userId: string, userName: string, amount: number) => {
    await createNotification({
      type: 'withdrawal',
      title: 'Nuevo Retiro Pendiente',
      message: `${userName} solicita retirar $${amount}`,
      userId,
      userName,
      amount,
      actionRequired: true,
      actionType: 'approve_withdrawal',
      relatedId: withdrawalId
    });
  }, [createNotification]);

  // Notificación de nuevo mensaje
  const notifyNewMessage = useCallback(async (userId: string, userName: string, chatId: string) => {
    await createNotification({
      type: 'chat',
      title: 'Nuevo Mensaje de Soporte',
      message: `${userName} ha enviado un mensaje`,
      userId,
      userName,
      actionRequired: true,
      actionType: 'view_chat',
      relatedId: chatId
    });
  }, [createNotification]);

  // Notificación de nuevo usuario
  const notifyNewUser = useCallback(async (userId: string, userName: string) => {
    await createNotification({
      type: 'user',
      title: 'Nuevo Usuario Registrado',
      message: `${userName} se ha registrado en la plataforma`,
      userId,
      userName
    });
  }, [createNotification]);

  return {
    notifications,
    unreadCount,
    stats,
    isLoading,
    subscribeToNotifications,
    subscribeToStats,
    createNotification,
    markAsRead,
    markAllAsRead,
    notifyNewDeposit,
    notifyNewWithdrawal,
    notifyNewMessage,
    notifyNewUser
  };
}
