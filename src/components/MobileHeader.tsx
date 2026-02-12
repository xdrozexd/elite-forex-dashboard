import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Eye, EyeOff, LogOut, Settings, User, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MobileHeaderProps {
  user: { username?: string; email?: string } | null;
  balance: number;
  notifications: number;
  onLogout: () => void;
  onShowNotifications: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  user,
  balance,
  notifications,
  onLogout,
  onShowNotifications,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0a0f1c]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <span className="font-bold text-sm">E</span>
            </div>
          </div>

          {/* Center - Balance */}
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5"
          >
            <span className="text-xs text-gray-400">Balance</span>
            <span className="font-bold text-sm">
              {showBalance ? formatCurrency(balance) : '****'}
            </span>
            {showBalance ? (
              <EyeOff className="w-3.5 h-3.5 text-gray-500" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-gray-500" />
            )}
          </button>

          {/* Right - Notifications & Avatar */}
          <div className="flex items-center gap-2">
            <button
              onClick={onShowNotifications}
              className="relative w-9 h-9 rounded-full bg-white/5 flex items-center justify-center active:scale-95 transition-transform"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowMenu(true)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-sm active:scale-95 transition-transform"
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </button>
          </div>
        </div>
      </header>

      {/* User Menu Modal */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#1e293b] rounded-t-3xl overflow-hidden"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1 bg-white/20 rounded-full" />
              </div>

              {/* User Info */}
              <div className="p-6 text-center border-b border-white/10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h3 className="font-bold text-lg">{user?.username || 'Usuario'}</h3>
                <p className="text-sm text-gray-400">{user?.email || 'user@example.com'}</p>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-1">
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 active:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <span>Mi Perfil</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>

                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 active:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-gray-400" />
                    <span>Configuración</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-red-500/10 text-red-400 active:bg-red-500/20 transition-colors mt-4"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                  </div>
                </button>
              </div>

              {/* Safe area padding */}
              <div className="h-safe" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
