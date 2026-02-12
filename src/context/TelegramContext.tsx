import React, { createContext, useContext, useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramContextType {
  isReady: boolean;
  user: TelegramUser | null;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
}

const TelegramContext = createContext<TelegramContextType>({
  isReady: false,
  user: null,
  platform: 'unknown',
  colorScheme: 'dark',
  themeParams: {},
});

export const useTelegram = () => useContext(TelegramContext);

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [platform, setPlatform] = useState('unknown');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');
  const [themeParams, setThemeParams] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      
      if (tg) {
        setPlatform(tg.platform || 'unknown');
        setColorScheme(tg.colorScheme || 'dark');
        setThemeParams(tg.themeParams || {});

        if (tg.initDataUnsafe?.user) {
          setUser(tg.initDataUnsafe.user);
        }

        tg.ready();
      }
      setIsReady(true);
    } catch (error) {
      console.log('Running outside Telegram:', error);
      setIsReady(true);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ isReady, user, platform, colorScheme, themeParams }}>
      {children}
    </TelegramContext.Provider>
  );
};
