import React, { useState } from 'react';
import { X, Send, Share2, Copy, Check, ExternalLink, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShareData, openTelegramShare, openWhatsAppShare, copyShareLink, executeNativeShare } from '../lib/share';
import { triggerHaptic } from '../lib/telegram';

interface ShareModalProps {
  isOpen: boolean;
  data: ShareData | null;
  onClose: () => void;
  onToast?: (message: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  data,
  onClose,
  onToast
}) => {
  const [copied, setCopied] = useState(false);
  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  if (!isOpen || !data) return null;

  const handleCopy = async () => {
    const success = await copyShareLink(data);
    if (success) {
      setCopied(true);
      if (onToast) onToast('Ссылка и описание скопированы!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTelegram = () => {
    openTelegramShare(data);
    if (onToast) onToast('Открываем Telegram...');
    onClose();
  };

  const handleWhatsApp = () => {
    openWhatsAppShare(data);
    if (onToast) onToast('Открываем WhatsApp...');
    onClose();
  };

  const handleNative = async () => {
    const shared = await executeNativeShare(data);
    if (shared) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-sm bg-[#1e2029] border border-[#c5a880]/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/80 z-10 text-white overflow-hidden"
        >
          {/* Ambient background glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#c5a880]/10 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-rose-600/10 rounded-full blur-2xl pointer-events-none -ml-6 -mb-6" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#c5a880]/15 text-[#c5a880]">
                <Share2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-white">Поделиться</h3>
                <p className="text-[11px] text-[#a1a1aa]">Отправить друзьям или в чаты</p>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#a1a1aa] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preview Snippet */}
          <div className="my-4 p-3 rounded-2xl bg-[#171821] border border-white/5 flex gap-3 items-center relative z-10">
            {data.imageUrl && (
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 shrink-0 border border-white/10">
                <img
                  src={data.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-serif text-xs font-bold text-[#f4f4f5] truncate">
                {data.title}
              </h4>
              <p className="text-[11px] text-[#71717a] truncate mt-0.5 line-clamp-1">
                {data.text.split('\n')[0]}
              </p>
              <div className="text-[10px] text-[#c5a880] truncate mt-0.5 opacity-80">
                {data.url}
              </div>
            </div>
          </div>

          {/* Share Action Buttons */}
          <div className="space-y-2 relative z-10">
            {/* Telegram Share Button */}
            <button
              type="button"
              onClick={handleTelegram}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#229ED9] to-[#1E88E5] hover:brightness-110 text-white text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg shadow-[#229ED9]/20 active:scale-[0.98] transition-all"
            >
              <span className="flex items-center gap-2.5">
                <Send className="w-4 h-4 fill-white" />
                <span>Отправить в Telegram</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>

            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] text-xs sm:text-sm font-semibold flex items-center justify-between active:scale-[0.98] transition-all"
            >
              <span className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 fill-[#25D366]" />
                <span>Отправить в WhatsApp</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>

            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopy}
              className={`w-full py-2.5 px-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between active:scale-[0.98] transition-all ${
                copied
                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              }`}
            >
              <span className="flex items-center gap-2.5">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#c5a880]" />}
                <span>{copied ? 'Скопировано в буфер!' : 'Скопировать ссылку'}</span>
              </span>
              <span className="text-[10px] text-[#71717a]">{copied ? 'Готово' : 'Текст + URL'}</span>
            </button>

            {/* Native OS Share if available */}
            {hasNativeShare && (
              <button
                type="button"
                onClick={handleNative}
                className="w-full py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#d4d4d8] text-xs font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-[#a1a1aa]" />
                <span>Другие приложения (системное меню)</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
