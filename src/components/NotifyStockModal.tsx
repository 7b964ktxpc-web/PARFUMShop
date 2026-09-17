import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle2, User, Send, Phone, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ProductVariant } from '../types';
import { getTelegramUser, triggerHaptic } from '../lib/telegram';

interface NotifyStockModalProps {
  isOpen: boolean;
  product: Product | null;
  variant: ProductVariant | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const NotifyStockModal: React.FC<NotifyStockModalProps> = ({
  isOpen,
  product,
  variant,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill from Telegram WebApp user or localStorage
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setError(null);
      
      const tgUser = getTelegramUser();
      const savedName = localStorage.getItem('parfume_customer_name') || '';
      const savedPhone = localStorage.getItem('parfume_customer_phone') || '';
      const savedTg = localStorage.getItem('parfume_customer_telegram') || '';

      if (tgUser) {
        const tgFullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
        setName(tgFullName || savedName || '');
        if (tgUser.username) {
          setContact(`@${tgUser.username}`);
        } else if (savedPhone || savedTg) {
          setContact(savedPhone || savedTg);
        }
      } else {
        setName(savedName);
        setContact(savedPhone || savedTg);
      }
    }
  }, [isOpen]);

  if (!isOpen || !product || !variant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Пожалуйста, укажите ваше имя');
      triggerHaptic('error');
      return;
    }

    if (!contact.trim()) {
      setError('Укажите ваш контакт (Telegram @username, телефон или WhatsApp)');
      triggerHaptic('error');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      // Save info for next visits
      localStorage.setItem('parfume_customer_name', name.trim());
      if (contact.trim().startsWith('@') || !contact.trim().match(/^[+\d\s()-]+$/)) {
        localStorage.setItem('parfume_customer_telegram', contact.trim());
      } else {
        localStorage.setItem('parfume_customer_phone', contact.trim());
      }

      const tgUser = getTelegramUser();

      const res = await fetch('/api/stock-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name,
          brand: product.brand,
          variant_id: variant.id,
          volume: variant.volume,
          price: variant.price,
          customer_name: name.trim(),
          customer_contact: contact.trim(),
          customer_telegram_id: tgUser?.id ? String(tgUser.id) : undefined,
          comment: comment.trim() || undefined
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Не удалось сохранить запрос');
      }

      triggerHaptic('success');
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(`Мы уведомим вас о поступлении ${product.name} (${variant.volume})`);
      }

      setTimeout(() => {
        onClose();
      }, 2400);
    } catch (err: any) {
      triggerHaptic('error');
      setError(err.message || 'Произошла ошибка при отправке запроса');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#242532] border border-[#c5a880]/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/80 overflow-hidden text-white"
        >
          {/* Close button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">
                  Запрос принят!
                </h3>
                <p className="text-sm text-[#a1a1aa] mt-2 max-w-xs mx-auto leading-relaxed">
                  Мы сохранили ваш запрос и свяжемся с вами в Telegram или по телефону сразу же, как только <span className="text-[#c5a880] font-medium">{product.name} ({variant.volume})</span> появится в наличии.
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                  <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
                  Спасибо за интерес к нашей коллекции
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header */}
              <div className="pr-8">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Bell className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                    Лист ожидания
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                  Уведомить о наличии
                </h3>
                <p className="text-xs text-[#a1a1aa] mt-1">
                  Оставьте контакты, и мы персонально напишем вам при новом поступлении.
                </p>
              </div>

              {/* Product Preview Card */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#1c1d27] border border-white/10">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-[#c5a880] tracking-widest uppercase truncate">
                    {product.brand}
                  </p>
                  <p className="text-sm font-semibold text-white truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-medium text-white/90">
                      {variant.volume}
                    </span>
                    <span className="text-xs text-[#a1a1aa]">
                      {variant.price.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="ml-auto text-[10px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      Нет на складе
                    </span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {error && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                    Ваше имя *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Как к вам обращаться"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#1a1b24] border border-white/15 focus:border-[#c5a880] rounded-xl text-sm text-white placeholder-white/30 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                    Telegram (@username) или номер телефона *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="@username или +7 (999) 000-00-00"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#1a1b24] border border-white/15 focus:border-[#c5a880] rounded-xl text-sm text-white placeholder-white/30 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
                    Пожелания или заметка <span className="text-white/40">(необязательно)</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Например, нужен флакон целиком или другой объём"
                      rows={2}
                      className="w-full pl-10 pr-3.5 py-2 bg-[#1a1b24] border border-white/15 focus:border-[#c5a880] rounded-xl text-sm text-white placeholder-white/30 outline-none resize-none transition-colors"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-white/40 leading-tight">
                  🔒 Мы не рассылаем спам. Сообщение придёт только один раз при поступлении выбранного аромата.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#c5a880] to-[#b39366] hover:from-[#d1b68e] hover:to-[#c5a880] active:scale-[0.99] text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#c5a880]/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Сохранение...</span>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>Сообщить о поступлении</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
