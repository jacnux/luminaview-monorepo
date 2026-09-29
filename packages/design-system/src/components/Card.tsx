import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../utils';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'gradient';
  hoverEffect?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  hoverEffect = true,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl overflow-hidden transition-all duration-300';

  const variants = {
    glass: 'glass-card',
    solid: 'bg-stone-900 border border-stone-800 text-stone-100 shadow-md',
    gradient: 'bg-gradient-to-br from-stone-900/90 via-stone-900/50 to-stone-950/90 border border-amber-500/20 text-stone-100 shadow-xl',
  };

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4, scale: 1.015 } : undefined}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
