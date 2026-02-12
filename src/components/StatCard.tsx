import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  gradient?: 'green' | 'blue' | 'purple' | 'orange';
  delay?: number;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  change,
  changeLabel = 'vs mes anterior',
  icon,
  trend = 'neutral',
  gradient = 'green',
  delay = 0,
  className,
}) => {
  const gradients = {
    green: 'from-green-500/20 via-emerald-500/10 to-transparent border-green-500/30',
    blue: 'from-blue-500/20 via-cyan-500/10 to-transparent border-blue-500/30',
    purple: 'from-purple-500/20 via-pink-500/10 to-transparent border-purple-500/30',
    orange: 'from-orange-500/20 via-amber-500/10 to-transparent border-orange-500/30',
  };

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        'relative p-6 rounded-2xl backdrop-blur-xl border overflow-hidden',
        'bg-gradient-to-br',
        gradients[gradient],
        className
      )}
    >
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
            {icon}
          </div>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 text-sm font-medium', trendColors[trend])}>
              <span>{trendIcons[trend]}</span>
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold tracking-tight">
          {prefix}{value}{suffix}
        </p>
        
        {changeLabel && (
          <p className="text-xs text-gray-500 mt-2">{changeLabel}</p>
        )}
      </div>
    </motion.div>
  );
};
