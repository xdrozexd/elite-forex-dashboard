import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'green' | 'yellow' | 'blue' | 'purple' | 'none';
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  hover = true,
  glow = 'none',
  delay = 0 
}) => {
  const glowColors = {
    green: 'hover:shadow-[0_0_40px_-10px_rgba(34,197,94,0.5)] hover:border-green-500/50',
    yellow: 'hover:shadow-[0_0_40px_-10px_rgba(250,204,21,0.5)] hover:border-yellow-500/50',
    blue: 'hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] hover:border-blue-500/50',
    purple: 'hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] hover:border-purple-500/50',
    none: ''
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { 
        y: -8,
        transition: { duration: 0.3 }
      } : undefined}
      className={cn(
        'relative p-6 rounded-2xl backdrop-blur-xl border border-white/10',
        'bg-gradient-to-br from-white/10 to-white/5',
        'shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]',
        'transition-all duration-500',
        hover && 'hover:border-white/20',
        glowColors[glow],
        className
      )}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Border gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
      
      {children}
    </motion.div>
  );
};
