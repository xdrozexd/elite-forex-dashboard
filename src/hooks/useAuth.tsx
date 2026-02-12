import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { init } from '@tma.js/sdk';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
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
            });
          }
        }
      } catch (error) {
        console.log('Running in browser mode (not Telegram)');
        setUser({
          id: 'demo_user_123',
          username: 'demo_user',
          firstName: 'Demo',
          lastName: 'User',
          photoUrl: undefined,
          isPremium: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    initTMA();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
