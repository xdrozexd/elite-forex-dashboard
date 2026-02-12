import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface UserProfile {
  uid: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  hasSelectedPlan: boolean;
  selectedPlanId: string | null;
  plan: {
    currentPlanId: string | null;
    investedAmount: number;
    isActive: boolean;
  };
  balance: {
    total: number;
    available: number;
    invested: number;
    totalProfit: number;
    lastProfitDate: any;
  };
  referralCode: string;
  referredBy: string | null;
  notifications: {
    unreadCount: number;
    lastReadAt: any;
  };
  supportChat: {
    hasUnreadMessages: boolean;
    lastMessageAt: any;
  };
  createdAt: any;
  updatedAt: any;
  photoUrl?: string;
  displayName?: string;
  phone?: string;
  isActive: boolean;
}

interface ExtendedUser {
  uid: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  hasSelectedPlan: boolean;
  plan: {
    currentPlanId: string | null;
    investedAmount: number;
    isActive: boolean;
  };
  balance: {
    total: number;
    available: number;
    invested: number;
    totalProfit: number;
  };
  referralCode: string;
  photoUrl?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<ExtendedUser>;
  register: (email: string, password: string, username: string) => Promise<ExtendedUser>;
  loginWithGoogle: () => Promise<ExtendedUser>;
  loginWithTelegram: () => Promise<ExtendedUser>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ uid: '', email: '', username: '', role: 'user', hasSelectedPlan: false, plan: { currentPlanId: null, investedAmount: 0, isActive: false }, balance: { total: 0, available: 0, invested: 0, totalProfit: 0 }, referralCode: '' }),
  register: async () => ({ uid: '', email: '', username: '', role: 'user', hasSelectedPlan: false, plan: { currentPlanId: null, investedAmount: 0, isActive: false }, balance: { total: 0, available: 0, invested: 0, totalProfit: 0 }, referralCode: '' }),
  loginWithGoogle: async () => ({ uid: '', email: '', username: '', role: 'user', hasSelectedPlan: false, plan: { currentPlanId: null, investedAmount: 0, isActive: false }, balance: { total: 0, available: 0, invested: 0, totalProfit: 0 }, referralCode: '' }),
  loginWithTelegram: async () => ({ uid: '', email: '', username: '', role: 'user', hasSelectedPlan: false, plan: { currentPlanId: null, investedAmount: 0, isActive: false }, balance: { total: 0, available: 0, invested: 0, totalProfit: 0 }, referralCode: '' }),
  logout: async () => {},
  error: null,
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateReferralCode = (username: string) => {
    return `${username.toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  const getUserFromFirestore = async (uid: string): Promise<ExtendedUser | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        return {
          uid: userData.uid,
          email: userData.email,
          username: userData.username,
          role: userData.role || 'user',
          hasSelectedPlan: userData.hasSelectedPlan || false,
          plan: userData.plan || { currentPlanId: null, investedAmount: 0, isActive: false },
          balance: userData.balance || { total: 0, available: 0, invested: 0, totalProfit: 0 },
          referralCode: userData.referralCode || generateReferralCode(userData.username),
          photoUrl: userData.photoUrl
        };
      }
      return null;
    } catch (err: any) {
      console.error('Error fetching user from Firestore:', err.code, err.message);
      if (err.code === 'permission-denied') {
        console.warn('Firestore permission denied - check security rules');
      }
      return null;
    }
  };

  const createNewUserProfile = (uid: string, email: string, username: string, photoUrl?: string): UserProfile => {
    const referralCode = generateReferralCode(username);
    
    return {
      uid,
      email,
      username,
      role: 'user',
      hasSelectedPlan: false,
      selectedPlanId: null,
      plan: {
        currentPlanId: null,
        investedAmount: 0,
        isActive: false
      },
      balance: {
        total: 0,
        available: 0,
        invested: 0,
        totalProfit: 0,
        lastProfitDate: null
      },
      referralCode,
      referredBy: null,
      notifications: {
        unreadCount: 0,
        lastReadAt: serverTimestamp()
      },
      supportChat: {
        hasUnreadMessages: false,
        lastMessageAt: null
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      photoUrl,
      isActive: true
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userData = await getUserFromFirestore(firebaseUser.uid);
        
        if (!userData) {
          // Crear nuevo perfil de usuario
          const newUserProfile = createNewUserProfile(
            firebaseUser.uid,
            firebaseUser.email || '',
            firebaseUser.email?.split('@')[0] || 'User',
            firebaseUser.photoURL || undefined
          );
          
          try {
            await setDoc(doc(db, 'users', firebaseUser.uid), newUserProfile);
            userData = {
              uid: newUserProfile.uid,
              email: newUserProfile.email,
              username: newUserProfile.username,
              role: 'user',
              hasSelectedPlan: false,
              plan: newUserProfile.plan,
              balance: newUserProfile.balance,
              referralCode: newUserProfile.referralCode,
              photoUrl: newUserProfile.photoUrl
            };
          } catch (firestoreError) {
            console.warn('No se pudo crear el documento del usuario:', firestoreError);
          }
        }
        
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<ExtendedUser> => {
    setError(null);
    try {
      console.log('Intentando login con:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Auth exitoso, uid:', result.user.uid);
      
      let userData = await getUserFromFirestore(result.user.uid);
      
      if (!userData) {
        console.log('Usuario no existe en Firestore, creando documento...');
        const newUserProfile = createNewUserProfile(
          result.user.uid,
          email,
          email.split('@')[0]
        );
        
        try {
          await setDoc(doc(db, 'users', result.user.uid), newUserProfile);
          console.log('Usuario creado en Firestore');
          userData = {
            uid: newUserProfile.uid,
            email: newUserProfile.email,
            username: newUserProfile.username,
            role: 'user',
            hasSelectedPlan: false,
            plan: newUserProfile.plan,
            balance: newUserProfile.balance,
            referralCode: newUserProfile.referralCode
          };
        } catch (firestoreError: any) {
          console.error('Error al crear usuario en Firestore:', firestoreError.code);
        }
      }
      
      setUser(userData);
      return userData!;
    } catch (err: any) {
      console.error('Error de login:', err.code, err.message);
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-email') {
        setError(getErrorMessage(err.code));
      } else if (err.code === 'auth/network-request-failed') {
        setError('Error de conexión. Verifica tu internet.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Espera unos minutos.');
      } else {
        setError(err.message || 'Error al iniciar sesión');
      }
      throw new Error(err.message || 'Error al iniciar sesión');
    }
  };

  const register = async (email: string, password: string, username: string): Promise<ExtendedUser> => {
    setError(null);
    try {
      console.log('Intentando registro con:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registro exitoso, uid:', result.user.uid);
      
      const userProfile = createNewUserProfile(result.user.uid, email, username);

      try {
        await setDoc(doc(db, 'users', result.user.uid), userProfile);
        console.log('Usuario guardado en Firestore');
      } catch (firestoreError: any) {
        console.error('Error al guardar en Firestore:', firestoreError.code);
      }

      const userData: ExtendedUser = {
        uid: result.user.uid,
        email: email,
        username: username,
        role: 'user',
        hasSelectedPlan: false,
        plan: userProfile.plan,
        balance: userProfile.balance,
        referralCode: userProfile.referralCode
      };

      setUser(userData);
      return userData;
    } catch (err: any) {
      console.error('Error de registro:', err.code, err.message);
      
      if (err.code === 'auth/email-already-in-use') {
        setError('El email ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email inválido.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Error de conexión. Verifica tu internet.');
      } else {
        setError(err.message || 'Error al registrar');
      }
      throw new Error(err.message || 'Error al registrar');
    }
  };

  const loginWithGoogle = async (): Promise<ExtendedUser> => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      let userData = await getUserFromFirestore(result.user.uid);
      
      if (!userData) {
        const userProfile = createNewUserProfile(
          result.user.uid,
          result.user.email || '',
          result.user.displayName || result.user.email?.split('@')[0] || 'User',
          result.user.photoURL || undefined
        );
        
        try {
          await setDoc(doc(db, 'users', result.user.uid), userProfile);
          userData = {
            uid: result.user.uid,
            email: result.user.email || '',
            username: result.user.displayName || 'User',
            role: 'user',
            hasSelectedPlan: false,
            plan: userProfile.plan,
            balance: userProfile.balance,
            referralCode: userProfile.referralCode,
            photoUrl: result.user.photoURL || undefined
          };
        } catch (firestoreError) {
          console.warn('Error al crear usuario de Google:', firestoreError);
          userData = {
            uid: result.user.uid,
            email: result.user.email || '',
            username: result.user.displayName || 'User',
            role: 'user',
            hasSelectedPlan: false,
            plan: userProfile.plan,
            balance: userProfile.balance,
            referralCode: userProfile.referralCode,
            photoUrl: result.user.photoURL || undefined
          };
        }
      }
      
      setUser(userData);
      return userData;
    } catch (err: any) {
      console.error('Error Google login:', err.code, err.message);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Ventana cerrada.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Error de conexión.');
      } else {
        setError(err.message || 'Error con Google');
      }
      throw new Error(err.message || 'Error con Google');
    }
  };

  const loginWithTelegram = async (): Promise<ExtendedUser> => {
    setError(null);
    try {
      const telegramUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      
      if (telegramUser) {
        const telegramId = telegramUser.id.toString();
        let userData = await getUserFromFirestore(telegramId);
        
        if (!userData) {
          const userProfile = createNewUserProfile(
            telegramId,
            `${telegramId}@telegram.com`,
            telegramUser.username || telegramUser.first_name || 'Telegram User',
            telegramUser.photo_url
          );
          
          try {
            await setDoc(doc(db, 'users', telegramId), userProfile);
            userData = {
              uid: telegramId,
              email: userProfile.email,
              username: userProfile.username,
              role: 'user',
              hasSelectedPlan: false,
              plan: userProfile.plan,
              balance: userProfile.balance,
              referralCode: userProfile.referralCode,
              photoUrl: telegramUser.photo_url
            };
          } catch (firestoreError) {
            console.warn('Error al crear usuario de Telegram:', firestoreError);
            userData = {
              uid: telegramId,
              email: userProfile.email,
              username: userProfile.username,
              role: 'user',
              hasSelectedPlan: false,
              plan: userProfile.plan,
              balance: userProfile.balance,
              referralCode: userProfile.referralCode,
              photoUrl: telegramUser.photo_url
            };
          }
        }
        
        setUser(userData);
        return userData;
      } else {
        const demoUser: ExtendedUser = {
          uid: 'telegram_demo',
          email: 'demo@telegram.com',
          username: 'Telegram User',
          role: 'user',
          hasSelectedPlan: false,
          plan: { currentPlanId: null, investedAmount: 0, isActive: false },
          balance: { total: 0, available: 0, invested: 0, totalProfit: 0 },
          referralCode: 'DEMO1234'
        };
        setUser(demoUser);
        return demoUser;
      }
    } catch (err: any) {
      console.error('Telegram login error:', err);
      const demoUser: ExtendedUser = {
        uid: 'telegram_demo',
        email: 'demo@telegram.com',
        username: 'Telegram User',
        role: 'user',
        hasSelectedPlan: false,
        plan: { currentPlanId: null, investedAmount: 0, isActive: false },
        balance: { total: 0, available: 0, invested: 0, totalProfit: 0 },
        referralCode: 'DEMO1234'
      };
      setUser(demoUser);
      return demoUser;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const clearError = () => setError(null);

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/user-not-found':
        return 'Usuario no encontrado. Regístrate primero.';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta.';
      case 'auth/invalid-email':
        return 'Email inválido.';
      case 'auth/email-already-in-use':
        return 'El email ya está registrado.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/popup-closed-by-user':
        return 'Ventana cerrada.';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu internet.';
      default:
        return `Error: ${code}`;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      loginWithGoogle,
      loginWithTelegram,
      logout,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
