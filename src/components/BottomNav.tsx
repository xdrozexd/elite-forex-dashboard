import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label: string;
  key: string;
  badge?: number;
}

interface BottomNavProps {
  items: NavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ items, activeKey, onSelect }) => {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0f1c]/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom"
    >
      <div className="flex items-center justify-around h-16 pb-safe">
        {items.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <motion.button
              key={item.key}
              onClick={() => onSelect(item.key)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full relative',
                'transition-colors duration-200',
                isActive ? 'text-green-400' : 'text-gray-500'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 w-8 h-1 bg-green-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              
              {/* Icon */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="relative"
              >
                {isActive && item.activeIcon ? item.activeIcon : item.icon}
                
                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </motion.div>
              
              {/* Label */}
              <motion.span
                animate={{
                  opacity: isActive ? 1 : 0.7,
                  fontWeight: isActive ? 600 : 400
                }}
                className="text-[10px] mt-1"
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};
