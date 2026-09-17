import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Send, Loader2, ShoppingBag, ShieldCheck, Tag, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { getTelegramUser, isInsideTelegram, triggerHaptic } from '../lib/telegram';
import { Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess
}) => {
  const { items, totalAmount, clearCart } = useCart();
  const tgUser = getTelegramUser();
  const inTg = isInsideTelegram();

  const [name, setName] = useState('');
  const [phoneOrTelegram, setPhoneOrTelegram] = useState('');
  const [comment, setComment] = useState('');

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Auto-fill from Telegram WebApp if available
  useEffect(() => {
    if (tgUser) {
      if (!name && tgUser.first_name) {
        const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
        setName(fullName);
      }
      if (!phoneOrTelegram && tgUser.username) {
        setPhoneOrTelegram(`@${tgUser.username}`);
      }
    }
  }, [tgUser]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen]);

  const finalTotal = Math.max(0, totalAmount - discountAmount);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    setIsValidatingPromo(true);
    setPromoMessage(null);
    triggerHaptic('select');

    try {
      const res = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCodeInput.trim(),
          cart_total: totalAmount,
          telegram_id: tgUser?.id
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAppliedPromo(data.promoCode);
        setDiscountAmount(data.discount_amount);
        setPromoMessage({ type: 'success', text: data.message });
        triggerHaptic('success');
      } else {
        setAppliedPromo(null);
        setDiscountAmount(0);
        setPromoMessage({ type: 'error', text: data.error || 'Недействительный промокод' });
        triggerHaptic('error');
      }
    } catch (err: any) {
      setPromoMessage({ type: 'error', text: err.message || 'Ошибка проверки промокода' });
      triggerHaptic('error');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    triggerHaptic('light');
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoCodeInput('');
    setPromoMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Пожалуйста, укажите ваше имя');
      return;
    }
    if (!phoneOrTelegram.trim()) {
      setErrorMessage('Пожалуйста, укажите контакт для связи (телефон или ник в Telegram)');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Корзина пуста');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      const orderPayload = {
        customer_name: name.trim(),
        customer_phone: phoneOrTelegram.trim(),
        customer_telegram: phoneOrTelegram.startsWith('@')
          ? phoneOrTelegram.trim()
          : tgUser?.username
          ? `@${tgUser.username}`
          : undefined,
        comment: comment.trim() || undefined,
        items: items.map(item => ({
          id: item.id,
          product_id: item.productId,
          product_name: item.productName,
          brand: item.brand,
          volume: item.volume,
          price: item.price,
          quantity: item.quantity,
          image_url: item.imageUrl
        })),
        total: finalTotal,
        discount_amount: discountAmount > 0 ? discountAmount : undefined,
        promo_code: appliedPromo ? appliedPromo.code : undefined
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Не удалось создать заказ');
      }

      triggerHaptic('success');
      clearCart();
      setCreatedOrder(data.order);
      onOrderSuccess(data.order);
    } catch (err: any) {
      console.error('Order submission error:', err);
      triggerHaptic('error');
      setErrorMessage(err.message || 'Ошибка оформления заказа. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="checkout-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md"
          onClick={() => {
            if (!createdOrder) {
              triggerHaptic('light');
              onClose();
            }
          }}
        >
          <motion.div
            key="checkout-card"
            initial={{ opacity: 0, scale: 0.9, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              mass: 0.75
            }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#242532] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl max-h-[90dvh] sm:max-h-[92vh] overflow-y-auto smooth-scroll shadow-black/90 transform-gpu origin-center"
          >
            {/* Close Button (if not completed) */}
            {!createdOrder && (
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {createdOrder ? (
              /* SUCCESS VIEW */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="w-16 h-16 bg-[#c5a880]/20 border border-[#c5a880]/30 rounded-full flex items-center justify-center mx-auto text-[#c5a880]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] font-medium">
                    Заказ успешно создан
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-white mt-1">
                    Спасибо за заказ! №{createdOrder.id.slice(-6)}
                  </h2>
                  <p className="text-xs text-[#a1a1aa] mt-1.5 max-w-xs mx-auto">
                    Мы получили вашу заявку и отправили уведомление продавцу. В ближайшее время с вами свяжутся для подтверждения.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-left space-y-2 max-w-sm mx-auto text-xs">
                  <div className="text-[11px] text-[#71717a] font-medium uppercase tracking-wider mb-1">
                    Состав заказа:
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {createdOrder.items.map((i, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2">
                        <span className="text-[#d4d4d8] truncate">
                          {i.brand} {i.product_name} ({i.volume}) × {i.quantity}
                        </span>
                        <span className="font-medium text-white whitespace-nowrap">
                          {(i.price * i.quantity).toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    ))}
                  </div>

                  {createdOrder.discount_amount && createdOrder.discount_amount > 0 ? (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-emerald-400">
                      <span>Скидка по промокоду ({createdOrder.promo_code}):</span>
                      <span>-{createdOrder.discount_amount.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  ) : null}

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between font-bold text-white">
                    <span>Итого к оплате:</span>
                    <span className="text-[#c5a880]">{createdOrder.total.toLocaleString('ru-RU')} ₽</span>
                  </div>

                  <div className="pt-2 border-t border-white/5 text-[11px] text-[#8e8e93]">
                    Клиент: <span className="text-white">{createdOrder.customer_name}</span> • {createdOrder.customer_phone}
                  </div>
                </div>

                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setCreatedOrder(null);
                    onClose();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#c5a880] hover:bg-[#d8bf9b] text-black font-semibold text-sm transition-all shadow-md active:scale-95"
                >
                  Вернуться к каталогу
                </button>
              </motion.div>
            ) : (
              /* CHECKOUT FORM */
              <div>
                <div className="mb-4">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] font-medium">
                    Быстрое оформление
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-white mt-0.5">
                    Оформление заказа
                  </h2>
                  <p className="text-xs text-[#8e8e93] mt-1">
                    Без обязательной регистрации. Продавец получит заказ в Telegram мгновенно.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-[#d4d4d8] mb-1">
                      Ваше имя <span className="text-[#c5a880]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Например: Дмитрий"
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-base sm:text-sm text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880] transition-colors"
                    />
                  </div>

                  {/* Contact: Phone or Telegram */}
                  <div>
                    <label className="block text-xs font-medium text-[#d4d4d8] mb-1">
                      Телефон или ник в Telegram <span className="text-[#c5a880]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={phoneOrTelegram}
                      onChange={e => setPhoneOrTelegram(e.target.value)}
                      placeholder="+7 (999) 000-00-00 или @username"
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-base sm:text-sm text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880] transition-colors"
                    />
                    {inTg && tgUser?.username && (
                      <p className="text-[10px] text-[#229ED9] mt-1 flex items-center gap-1 truncate">
                        <Send className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">Подставлен контакт из Telegram (@{tgUser.username})</span>
                      </p>
                    )}
                  </div>

                  {/* PROMO CODE SECTION */}
                  <div className="pt-1">
                    <label className="block text-xs font-medium text-[#d4d4d8] mb-1 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#c5a880]" />
                      <span>Промокод или купон</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                          disabled={Boolean(appliedPromo)}
                          placeholder="например: SELECTIVE20"
                          className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white uppercase font-mono placeholder-[#71717a] focus:outline-none focus:border-[#c5a880] disabled:opacity-50"
                        />
                      </div>
                      {appliedPromo ? (
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium rounded-xl text-xs transition-colors shrink-0"
                        >
                          Удалить
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={isValidatingPromo || !promoCodeInput.trim()}
                          className="px-4 py-2 bg-[#c5a880] hover:bg-[#b59870] disabled:opacity-40 text-black font-bold rounded-xl text-xs transition-all shrink-0 flex items-center gap-1"
                        >
                          {isValidatingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Применить</span>}
                        </button>
                      )}
                    </div>
                    {promoMessage && (
                      <p className={`text-[11px] mt-1 flex items-center gap-1 ${promoMessage.type === 'success' ? 'text-emerald-400 font-medium' : 'text-rose-400'}`}>
                        {promoMessage.type === 'success' ? <Check className="w-3 h-3 shrink-0" /> : <AlertCircle className="w-3 h-3 shrink-0" />}
                        <span>{promoMessage.text}</span>
                      </p>
                    )}
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-medium text-[#d4d4d8] mb-1">
                      Комментарий к заказу <span className="text-[#71717a] font-normal">(по желанию)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Например: Заберу сегодня вечером или упаковать в подарочный бокс"
                      className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-base sm:text-sm text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880] transition-colors resize-none"
                    />
                  </div>

                  {/* Order summary mini-card */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 mt-3">
                    <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
                      <span>Позиций в заказе:</span>
                      <span className="font-semibold text-white">{items.length} шт.</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
                      <span>Сумма товаров:</span>
                      <span className="text-white">{totalAmount.toLocaleString('ru-RU')} ₽</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
                        <span>Скидка ({appliedPromo?.code}):</span>
                        <span>-{discountAmount.toLocaleString('ru-RU')} ₽</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-[#a1a1aa] pt-1 border-t border-white/5">
                      <span>Итого к оплате:</span>
                      <span className="text-sm font-bold text-[#c5a880]">
                        {finalTotal.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="w-full mt-3.5 py-3.5 px-4 rounded-xl bg-[#c5a880] hover:bg-[#d8bf9b] text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#c5a880]/15 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span className="truncate">Отправляем заказ...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span className="truncate">Подтвердить заказ • {finalTotal.toLocaleString('ru-RU')} ₽</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
