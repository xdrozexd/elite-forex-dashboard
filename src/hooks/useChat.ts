import { useState, useCallback } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { useAuth } from './useAuth';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: 'user' | 'admin';
  message: string;
  type: 'text' | 'image';
  imageUrl?: string;
  timestamp: Date;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  status: 'active' | 'closed';
  createdAt: Date;
}

export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Para usuarios: obtener mensajes de su chat
  const subscribeToUserChat = useCallback(() => {
    if (!user?.uid) return () => {};

    setIsLoading(true);
    
    // Obtener o crear sala de chat del usuario
    const chatQuery = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(chatQuery, async (snapshot) => {
      if (snapshot.empty) {
        // Crear sala de chat si no existe
        await addDoc(collection(db, 'chats'), {
          userId: user.uid,
          userName: user.username || user.email?.split('@')[0] || 'Usuario',
          userEmail: user.email,
          lastMessage: '',
          lastMessageAt: serverTimestamp(),
          unreadCount: 0,
          status: 'active',
          createdAt: serverTimestamp()
        });
        setMessages([]);
        setIsLoading(false);
        return;
      }

      const chatDoc = snapshot.docs[0];
      
      // Suscribirse a mensajes de esta sala
      const messagesQuery = query(
        collection(db, 'chats', chatDoc.id, 'messages'),
        orderBy('timestamp', 'asc')
      );

      const unsubscribeMessages = onSnapshot(messagesQuery, (messagesSnapshot) => {
        const msgs = messagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        })) as ChatMessage[];

        setMessages(msgs);
        
        // Contar mensajes no leídos del admin
        const unread = msgs.filter(m => m.userRole === 'admin' && !m.read).length;
        setUnreadCount(unread);
        setIsLoading(false);
      });

      return () => unsubscribeMessages();
    });

    return () => unsubscribe();
  }, [user]);

  // Para admin: obtener todas las salas de chat
  const subscribeToAllChats = useCallback(() => {
    if (!user?.uid || user.role !== 'admin') return () => {};

    setIsLoading(true);

    const chatsQuery = query(
      collection(db, 'chats'),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageAt: doc.data().lastMessageAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as ChatRoom[];

      setChatRooms(rooms);
      
      // Contar chats con mensajes no leídos
      const totalUnread = rooms.reduce((acc, room) => acc + (room.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Enviar mensaje
  const sendMessage = useCallback(async (chatId: string, message: string, type: 'text' | 'image' = 'text', imageUrl?: string) => {
    if (!user?.uid) return;

    try {
      // Agregar mensaje
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        userId: user.uid,
        userName: user.username || user.email?.split('@')[0] || 'Usuario',
        userRole: user.role || 'user',
        message,
        type,
        imageUrl,
        timestamp: serverTimestamp(),
        read: false
      });

      // Actualizar último mensaje en la sala
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: type === 'image' ? '📷 Imagen' : message,
        lastMessageAt: serverTimestamp(),
        unreadCount: user.role === 'user' ? 1 : 0
      });

      // Si es admin, marcar mensajes del usuario como leídos
      if (user.role === 'admin') {
        const messagesQuery = query(
          collection(db, 'chats', chatId, 'messages'),
          where('userRole', '==', 'user'),
          where('read', '==', false)
        );

        const unreadMessages = await getDocs(messagesQuery);
        const batch = writeBatch(db);

        unreadMessages.docs.forEach(msgDoc => {
          batch.update(msgDoc.ref, { read: true });
        });

        await batch.commit();

        // Actualizar contador de no leídos
        await updateDoc(doc(db, 'chats', chatId), {
          unreadCount: 0
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [user]);

  // Marcar mensajes como leídos
  const markAsRead = useCallback(async (chatId: string) => {
    if (!user?.uid) return;

    try {
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        where('userRole', '!=', user.role),
        where('read', '==', false)
      );

      const unreadMessages = await getDocs(messagesQuery);
      const batch = writeBatch(db);

      unreadMessages.docs.forEach(msgDoc => {
        batch.update(msgDoc.ref, { read: true });
      });

      await batch.commit();

      if (user.role === 'admin') {
        await updateDoc(doc(db, 'chats', chatId), {
          unreadCount: 0
        });
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [user]);

  // Obtener mensajes de una sala específica (para admin)
  const getChatMessages = useCallback((chatId: string, callback: (msgs: ChatMessage[]) => void) => {
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })) as ChatMessage[];

      callback(msgs);
    });
  }, []);

  // Cerrar chat
  const closeChat = useCallback(async (chatId: string) => {
    await updateDoc(doc(db, 'chats', chatId), {
      status: 'closed',
      updatedAt: serverTimestamp()
    });
  }, []);

  return {
    messages,
    chatRooms,
    unreadCount,
    isLoading,
    subscribeToUserChat,
    subscribeToAllChats,
    sendMessage,
    markAsRead,
    getChatMessages,
    closeChat
  };
}
