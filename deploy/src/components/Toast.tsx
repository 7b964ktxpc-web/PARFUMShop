import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Sparkles, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed top-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:left-auto z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#1e2029]/95 border border-[#c5a880]/50 text-white shadow-2xl shadow-black/80 backdrop-blur-md max-w-sm pointer-events-auto"
      >
        {toast.type === 'error' ? (
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-[#c5a880] shrink-0" />
        )}
        <span className="text-xs font-medium text-[#f4f4f5]">{toast.text}</span>
      </motion.div>
    </AnimatePresence>
  );
};
