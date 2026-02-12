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
  plan: string;
  createdAt: any;
  photoUrl?: string;
}

interface ExtendedUser {
  uid: string;
  email: string;
  username: string;
  plan: string;
  photoUrl?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, plan: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithTelegram: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  loginWithTelegram: async () => {},
  logout: async () => {},
  error: null,
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserFromFirestore = async (uid: string): Promise<ExtendedUser | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        return {
          uid: userData.uid,
          email: userData.email,
          username: userData.username,
          plan: userData.plan,
          photoUrl: userData.photoUrl
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching user:', err);
      return null;
    }
  };

  const createDefaultUser = (uid: string, email: string): ExtendedUser => {
    return {
      uid: uid,
      email: email,
      username: email.split('@')[0],
      plan: 'basic'
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userData = await getUserFromFirestore(firebaseUser.uid);
        
        if (!userData) {
          userData = createDefaultUser(firebaseUser.uid, firebaseUser.email || '');
        }
        
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      console.log('Intentando login con:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login exitoso, uid:', result.user.uid);
      
      let userData = await getUserFromFirestore(result.user.uid);
      
      if (!userData) {
        console.log('Usuario no existe en Firestore, creando...');
        userData = createDefaultUser(result.user.uid, email);
        
        const userProfile: UserProfile = {
          uid: result.user.uid,
          email: email,
          username: email.split('@')[0],
          plan: 'basic',
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', result.user.uid), userProfile);
      }
      
      setUser(userData);
    } catch (err: any) {
      console.error('Error de login:', err.code, err.message);
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (email: string, password: string, username: string, plan: string) => {
    setError(null);
    try {
      console.log('Intentando registro con:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registro exitoso, uid:', result.user.uid);
      
      const userProfile: UserProfile = {
        uid: result.user.uid,
        email: email,
        username: username,
        plan: plan,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', result.user.uid), userProfile);

      setUser({
        uid: result.user.uid,
        email: email,
        username: username,
        plan: plan
      });
    } catch (err: any) {
      console.error('Error de registro:', err.code, err.message);
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      let userData = await getUserFromFirestore(result.user.uid);
      
      if (!userData) {
        const userProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email || '',
          username: result.user.displayName || result.user.email?.split('@')[0] || 'User',
          plan: 'basic',
          photoUrl: result.user.photoURL || undefined,
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', result.user.uid), userProfile);
        userData = {
          uid: result.user.uid,
          email: result.user.email || '',
          username: result.user.displayName || 'User',
          plan: 'basic',
          photoUrl: result.user.photoURL || undefined
        };
      }
      
      setUser(userData);
    } catch (err: any) {
      console.error('Error Google login:', err.code, err.message);
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginWithTelegram = async () => {
    setError(null);
    try {
      const telegramUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      
      if (telegramUser) {
        const telegramId = telegramUser.id.toString();
        let userData = await getUserFromFirestore(telegramId);
        
        if (!userData) {
          const newUser: ExtendedUser = {
            uid: telegramId,
            email: `${telegramId}@telegram.com`,
            username: telegramUser.username || telegramUser.first_name || 'Telegram User',
            plan: 'basic',
            photoUrl: telegramUser.photo_url
          };
          
          const userProfile: UserProfile = {
            uid: telegramId,
            email: newUser.email,
            username: newUser.username,
            plan: 'basic',
            photoUrl: telegramUser.photo_url,
            createdAt: serverTimestamp()
          };
          
          await setDoc(doc(db, 'users', telegramId), userProfile);
          userData = newUser;
        }
        
        setUser(userData);
      } else {
        setUser({
          uid: 'telegram_demo',
          email: 'demo@telegram.com',
          username: 'Telegram User',
          plan: 'basic'
        });
      }
    } catch (err: any) {
      console.error('Telegram login error:', err);
      setUser({
        uid: 'telegram_demo',
        email: 'demo@telegram.com',
        username: 'Telegram User',
        plan: 'basic'
      });
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
