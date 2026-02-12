import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MobileStatCardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  change?: number;
  icon: React.ReactNode;
  color?: 'green' | 'blue' | 'purple' | 'orange';
  delay?: number;
  onClick?: () => void;
}

export const MobileStatCard: React.FC<MobileStatCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  change,
  icon,
  color = 'green',
  delay = 0,
  onClick,
}) => {
  const colors = {
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  };

  const theme = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'p-4 rounded-2xl border backdrop-blur-sm',
        'bg-gradient-to-br from-white/5 to-transparent',
        theme.border,
        onClick && 'active:scale-95 transition-transform cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', theme.bg)}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={cn('text-xs font-medium', change >= 0 ? 'text-green-400' : 'text-red-400')}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      
      <p className="text-2xl font-bold tracking-tight mb-0.5">
        {prefix}{value}{suffix}
      </p>
      
      <p className="text-xs text-gray-400">{title}</p>
    </motion.div>
  );
};
