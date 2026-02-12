import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { init } from '@tma.js/sdk';
import { User } from '../types';

interface ExtendedUser extends User {
  email?: string;
  plan?: string;
  loginMethod?: 'telegram' | 'credentials';
}

interface AuthContextType {
  user: ExtendedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: { username: string; email: string; plan: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initTMA = async () => {
      try {
        const initDataRaw = await init();
        
        if (initDataRaw && 'user' in initDataRaw) {
          const userData = (initDataRaw as { user?: { id: { toString(): string }; username?: string; firstName: string; lastName?: string; photoUrl?: string; isPremium?: boolean } }).user;
          if (userData) {
            setUser({
              id: userData.id.toString(),
              username: userData.username || '',
              firstName: userData.firstName,
              lastName: userData.lastName,
              photoUrl: userData.photoUrl,
              isPremium: userData.isPremium,
              loginMethod: 'telegram',
            });
          }
        }
      } catch (error) {
        const savedUser = localStorage.getItem('elite_forex_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } finally {
        setIsLoading(false);
      }
    };

    initTMA();
  }, []);

  const login = (userData: { username: string; email: string; plan: string }) => {
    const newUser: ExtendedUser = {
      id: `user_${Date.now()}`,
      username: userData.username,
      firstName: userData.username,
      email: userData.email,
      plan: userData.plan,
      loginMethod: 'credentials',
    };
    setUser(newUser);
    localStorage.setItem('elite_forex_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elite_forex_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
