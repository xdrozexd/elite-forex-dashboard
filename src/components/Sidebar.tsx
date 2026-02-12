import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  key: string;
  badge?: number;
}

interface SidebarProps {
  items: SidebarItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  activeKey,
  onSelect,
  collapsed = false,
}) => {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'fixed left-0 top-0 h-full z-40',
        'bg-[#0a0f1c]/95 backdrop-blur-xl border-r border-white/10',
        'flex flex-col',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shrink-0">
          <span className="text-xl font-bold">E</span>
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-lg">Elite Forex</h1>
            <p className="text-xs text-gray-500">Trading Pro</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {items.map((item, i) => (
            <motion.button
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelect(item.key)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                'hover:bg-white/5 group relative',
                activeKey === item.key
                  ? 'bg-gradient-to-r from-green-500/20 to-transparent border-l-2 border-green-500'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              <span className={cn(
                'transition-colors',
                activeKey === item.key ? 'text-green-400' : 'group-hover:text-white'
              )}>
                {item.icon}
              </span>
              
              {!collapsed && (
                <>
                  <span className="font-medium flex-1 text-left">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              
              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-500 rounded-full">{item.badge}</span>
                  )}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/10">
        <div className={cn(
          'p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20',
          collapsed && 'flex justify-center'
        )}>
          {!collapsed ? (
            <>
              <p className="text-xs text-gray-400 mb-2">Tu Plan</p>
              <p className="font-bold text-green-400">Intermedio</p>
              <p className="text-xs text-gray-500 mt-1">0.85% / día</p>
            </>
          ) : (
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          )}
        </div>
      </div>
    </motion.aside>
  );
};
