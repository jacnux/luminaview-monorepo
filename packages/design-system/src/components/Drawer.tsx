import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'left',
  className = '',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const slideVariants = {
    closed: {
      x: position === 'left' ? '-100%' : '100%',
      opacity: 0,
    },
    open: {
      x: '0%',
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Content Panel */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={slideVariants}
            className={cn(
              'relative z-10 w-full max-w-sm h-full bg-stone-950/95 border-stone-800/80 shadow-2xl flex flex-col',
              position === 'left' ? 'border-r mr-auto' : 'border-l ml-auto',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-800/60">
              {title ? (
                <h3 className="text-lg font-semibold text-stone-100">{title}</h3>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-white hover:bg-stone-800/50 rounded-full transition-colors cursor-pointer"
                aria-label="Fermer le menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
