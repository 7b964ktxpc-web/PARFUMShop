import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { triggerHaptic } from '../lib/telegram';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    totalAmount,
    totalCount
  } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop click to close */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => {
              triggerHaptic('light');
              setIsCartOpen(false);
            }}
          />

          <motion.div
            key="cart-drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            onClick={e => e.stopPropagation()}
            className="relative z-10 w-full sm:max-w-md h-full bg-[#242532] border-l border-white/10 flex flex-col shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#1e2029]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#c5a880]" />
                <h2 className="font-serif text-xl font-bold text-white tracking-wide">
                  Корзина
                </h2>
                {totalCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#d4d4d8]">
                    {totalCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {items.length > 0 && (
                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      if (confirm('Очистить корзину?')) {
                        clearCart();
                      }
                    }}
                    className="text-[11px] text-[#71717a] hover:text-[#ef4444] transition-colors"
                  >
                    Очистить
                  </button>
                )}
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setIsCartOpen(false);
                  }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body: Items list */}
            <div className="flex-1 overflow-y-auto smooth-scroll p-4 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#71717a]">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-7 h-7 text-[#71717a]" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-white mb-1">
                    Ваша корзина пуста
                  </h3>
                  <p className="text-xs text-[#a1a1aa] max-w-[240px] leading-relaxed">
                    Выберите нишевый аромат в каталоге и добавьте желаемый объём
                  </p>
                </div>
              ) : (
                items.map(item => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-lg bg-[#1e2029] overflow-hidden flex-shrink-0 border border-white/5">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#a1a1aa] font-medium truncate block">
                          {item.brand}
                        </span>
                        <h4 className="font-serif text-sm font-semibold text-white truncate">
                          {item.productName}
                        </h4>
                        <span className="inline-block mt-0.5 text-[11px] px-1.5 py-0.5 rounded bg-[#c5a880]/15 text-[#c5a880] font-medium">
                          {item.volume}
                        </span>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded bg-white/5 hover:bg-white/15 flex items-center justify-center text-[#d4d4d8] text-xs transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold text-white w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded bg-white/5 hover:bg-white/15 flex items-center justify-center text-[#d4d4d8] text-xs transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[#c5a880]">
                            {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#71717a] hover:text-[#ef4444] transition-colors p-1"
                            aria-label="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {items.length > 0 && (
              <div className="p-4 sm:p-5 bg-[#1e2029] border-t border-white/10 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="space-y-1.5 text-xs text-[#a1a1aa]">
                  <div className="flex justify-between items-center">
                    <span>Товары ({totalCount} шт.)</span>
                    <span className="font-medium text-white">{totalAmount.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="truncate">Уведомление</span>
                    <span className="text-emerald-400 font-medium truncate text-right">В Telegram</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm font-semibold text-white">
                    <span className="font-serif text-base truncate">Итого к оплате</span>
                    <span className="text-base text-[#c5a880] whitespace-nowrap">
                      {totalAmount.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>

                <button
                  id="btn-checkout-proceed"
                  onClick={() => {
                    triggerHaptic('medium');
                    setIsCartOpen(false);
                    onProceedToCheckout();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#c5a880] hover:bg-[#d8bf9b] text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#c5a880]/15 active:scale-98 transition-all"
                >
                  <span className="truncate">Оформить заказ</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
