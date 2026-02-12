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
  logout: async () => {},
  error: null,
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setUser({
              uid: userData.uid,
              email: userData.email,
              username: userData.username,
              plan: userData.plan,
              photoUrl: userData.photoUrl
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              username: firebaseUser.email?.split('@')[0] || 'User',
              plan: 'basic'
            });
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            username: firebaseUser.email?.split('@')[0] || 'User',
            plan: 'basic'
          });
        }
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
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setUser({
          uid: userData.uid,
          email: userData.email,
          username: userData.username,
          plan: userData.plan,
          photoUrl: userData.photoUrl
        });
      }
    } catch (err: any) {
      const errorMessage = err.code === 'auth/user-not-found' 
        ? 'Usuario no encontrado' 
        : err.code === 'auth/wrong-password'
        ? 'Contraseña incorrecta'
        : err.code === 'auth/invalid-email'
        ? 'Email inválido'
        : 'Error al iniciar sesión';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (email: string, password: string, username: string, plan: string) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
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
      const errorMessage = err.code === 'auth/email-already-in-use'
        ? 'El email ya está registrado'
        : err.code === 'auth/invalid-email'
        ? 'Email inválido'
        : err.code === 'auth/weak-password'
        ? 'La contraseña debe tener al menos 6 caracteres'
        : 'Error al registrar';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        const userProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email || '',
          username: result.user.displayName || result.user.email?.split('@')[0] || 'User',
          plan: 'basic',
          photoUrl: result.user.photoURL || undefined,
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', result.user.uid), userProfile);
      }

      const userData = userDoc.data() as UserProfile;
      setUser({
        uid: result.user.uid,
        email: result.user.email || '',
        username: userData?.username || result.user.displayName || 'User',
        plan: userData?.plan || 'basic',
        photoUrl: result.user.photoURL || undefined
      });
    } catch (err: any) {
      const errorMessage = 'Error con Google';
      setError(errorMessage);
      throw new Error(errorMessage);
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

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      loginWithGoogle,
      logout,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
