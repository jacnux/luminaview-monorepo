import React from 'react';
import { cn } from '../utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'purple' | 'cyan' | 'slate' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide backdrop-blur-md';

  const variants = {
    gold: 'bg-amber-500/15 border border-amber-500/30 text-amber-400',
    purple: 'bg-purple-500/15 border border-purple-500/30 text-purple-300',
    cyan: 'bg-teal-500/15 border border-teal-500/30 text-teal-300',
    slate: 'bg-stone-800/60 border border-stone-700/50 text-stone-300',
    outline: 'border border-amber-500/40 text-amber-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};
