import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, Sparkles, Shield, Droplets, Flame, Percent, Share2, Bell, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { triggerHaptic } from '../lib/telegram';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onShare?: (product: Product) => void;
  onNotifyStock?: (product: Product, variant: ProductVariant) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onShare,
  onNotifyStock
}) => {
  const { addItem, setIsCartOpen } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const isFav = product ? isFavorite(product.id) : false;

  // Sync selected variant when product changes
  useEffect(() => {
    if (product) {
      const avail = product.variants.filter(v => v.is_available);
      setSelectedVariant(avail[0] || product.variants[0]);
      setQuantity(1);
      setIsAdded(false);
    }
  }, [product]);

  // Lock body scroll
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant || !selectedVariant.is_available) return;
    addItem(product, selectedVariant, quantity);
    setIsAdded(true);
    triggerHaptic('success');
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const isAvailable = selectedVariant?.is_available;
  const totalPrice = (selectedVariant?.price || 0) * quantity;
  const totalOldPrice = (selectedVariant?.old_price || 0) * quantity;

  const discountBadge = product?.special_offer_badge || (
    product?.discount_percent
      ? `-${product.discount_percent}%`
      : selectedVariant?.old_price && selectedVariant.old_price > selectedVariant.price
      ? `-${Math.round(((selectedVariant.old_price - selectedVariant.price) / selectedVariant.old_price) * 100)}%`
      : null
  );

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          key="product-detail-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md"
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
        >
          <motion.div
            key={`product-detail-card-${product.id}`}
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
            className="relative w-full max-w-lg bg-[#242532] border border-white/10 rounded-2xl sm:rounded-3xl max-h-[90dvh] sm:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl shadow-black/90 transform-gpu origin-center"
          >
            {/* Top Right Action buttons (Share & Close) */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleFavorite(product.id);
                    if (!isFav) {
                      setIsHeartAnimating(true);
                      setTimeout(() => setIsHeartAnimating(false), 300);
                    }
                  }}
                  className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-white/80 hover:text-red-500 backdrop-blur-md border border-white/10 transition-all active:scale-95 shrink-0 group"
                  aria-label="Избранное"
                  title={isFav ? "Убрать из избранного" : "Добавить в избранное"}
                >
                  <Heart 
                    className={`w-5 h-5 transition-all duration-300 ${isFav ? 'fill-red-500 text-red-500' : 'group-hover:text-red-500'} ${isHeartAnimating ? 'scale-150' : 'scale-100'}`} 
                  />
                </button>
                {onShare && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      onShare(product);
                    }}
                    className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-white/80 hover:text-[#c5a880] backdrop-blur-md border border-white/10 transition-all active:scale-95 shrink-0"
                    aria-label="Поделиться"
                    title="Поделиться ароматом"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    onClose();
                  }}
                  className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all active:scale-95 shrink-0"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Badges in modal */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex flex-wrap gap-1.5 items-center max-w-[calc(100%-64px)]">
              {(product.is_special_offer || discountBadge) && (
                <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider uppercase bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg shadow-black/70 border border-white/20 shrink-0">
                  <Percent className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                  <span>{discountBadge || 'SALE'}</span>
                </span>
              )}
              {product.is_popular && (
                <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase bg-[#1e2029]/90 text-[#f5dfb8] backdrop-blur-md border border-[#c5a880]/60 shadow-lg shadow-black/70 shrink-0">
                  <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c5a880] fill-[#c5a880]" />
                  <span>Хит продаж</span>
                </span>
              )}
              {product.is_new && (
                <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#c5a880] text-black shadow-lg shadow-black/70 shrink-0">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black" />
                  <span>Новинка</span>
                </span>
              )}
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto smooth-scroll flex-1 pb-6">
              {/* Hero Image */}
              <div className="relative w-full aspect-[16/10] bg-[#1e2029]">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#242532] via-transparent to-black/30" />
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 min-w-0">
                  <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#c5a880] font-medium truncate block">
                    {product.brand}
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-white mt-0.5 leading-tight break-words line-clamp-2">
                    {product.name}
                  </h2>
                </div>
              </div>

              <div className="px-3.5 sm:px-5 pt-3">
                {/* Direction & Gender */}
                <div className="flex items-center justify-between py-2 border-b border-white/5 text-xs text-[#a1a1aa] gap-2">
                  <span className="font-serif italic text-[#d4d4d8] truncate">{product.direction}</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 uppercase text-[10px] tracking-wider shrink-0">
                    {product.gender === 'men'
                      ? 'Мужской'
                      : product.gender === 'women'
                      ? 'Женский'
                      : 'Унисекс'}
                  </span>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <p className="text-sm text-[#d4d4d8] leading-relaxed font-light">
                    {product.description}
                  </p>
                </div>

                {/* Pyramid Notes */}
                <div className="mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#c5a880] uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ольфакторная пирамида</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {product.notes.top && product.notes.top.length > 0 && (
                      <div>
                        <span className="text-[#71717a] font-medium">Верхние ноты: </span>
                        <span className="text-[#f4f4f5]">{product.notes.top.join(', ')}</span>
                      </div>
                    )}
                    {product.notes.heart && product.notes.heart.length > 0 && (
                      <div>
                        <span className="text-[#71717a] font-medium">Ноты сердца: </span>
                        <span className="text-[#f4f4f5]">{product.notes.heart.join(', ')}</span>
                      </div>
                    )}
                    {product.notes.base && product.notes.base.length > 0 && (
                      <div>
                        <span className="text-[#71717a] font-medium">Базовые ноты: </span>
                        <span className="text-[#f4f4f5]">{product.notes.base.join(', ')}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[#71717a] font-medium">Ключевые аккорды: </span>
                      <span className="text-[#c5a880] font-medium">{product.notes.main.join(' • ')}</span>
                    </div>
                  </div>
                </div>

                {/* Volume Selection */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2.5 gap-2">
                    <span className="text-xs font-semibold text-[#f4f4f5] uppercase tracking-wider truncate">
                      Выберите объём
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-[#71717a] flex items-center gap-1 shrink-0">
                      <Droplets className="w-3 h-3 text-[#c5a880]" />
                      Распив / флакон
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                    {product.variants.map(variant => {
                      const isSelected = selectedVariant?.id === variant.id;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => {
                            triggerHaptic('select');
                            setSelectedVariant(variant);
                          }}
                          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all relative min-w-0 ${
                            isSelected
                              ? variant.is_available
                                ? 'border-[#c5a880] bg-[#c5a880]/15 shadow-sm'
                                : 'border-amber-500/50 bg-amber-500/10 shadow-sm'
                              : !variant.is_available
                              ? 'opacity-40 border-white/5 bg-white/5 hover:opacity-75'
                              : 'border-white/5 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="text-xs font-bold text-white truncate">{variant.volume}</div>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-xs sm:text-sm font-semibold text-[#c5a880] whitespace-nowrap">
                              {variant.price.toLocaleString('ru-RU')} ₽
                            </span>
                            {variant.old_price && (
                              <span className="text-[10px] text-[#71717a] line-through font-normal whitespace-nowrap">
                                {variant.old_price.toLocaleString('ru-RU')} ₽
                              </span>
                            )}
                          </div>
                          {!variant.is_available && (
                            <div className="text-[9px] text-amber-300 font-medium mt-0.5 truncate flex items-center gap-1">
                              <Bell className="w-2.5 h-2.5 shrink-0" />
                              <span>Под заказ</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity Selector or Out of stock message */}
                {isAvailable ? (
                  <div className="mt-5 flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-xs font-medium text-[#a1a1aa]">Количество:</span>
                    <div className="flex items-center gap-3">
                      <button
                        disabled={quantity <= 1}
                        onClick={() => {
                          triggerHaptic('light');
                          setQuantity(q => Math.max(1, q - 1));
                        }}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-semibold text-white w-5 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          setQuantity(q => q + 1);
                        }}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2.5 text-xs text-amber-200">
                    <Bell className="w-4 h-4 shrink-0 text-amber-300" />
                    <span>
                      Объём <strong>{selectedVariant?.volume}</strong> временно закончился. Нажмите кнопку ниже, чтобы получить уведомление о новом поступлении.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer sticky action */}
            <div className="p-3 sm:p-4 bg-[#1e2029] border-t border-white/10 flex items-center gap-2.5 sm:gap-3">
              <div className="flex flex-col shrink-0">
                <span className="text-[9px] sm:text-[10px] uppercase text-[#71717a] font-medium tracking-wider">
                  {isAvailable ? 'Итого' : 'Цена'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base sm:text-lg font-bold text-[#c5a880] whitespace-nowrap">
                    {totalPrice.toLocaleString('ru-RU')} ₽
                  </span>
                  {totalOldPrice > totalPrice && (
                    <span className="text-xs text-[#71717a] line-through font-normal whitespace-nowrap">
                      {totalOldPrice.toLocaleString('ru-RU')} ₽
                    </span>
                  )}
                </div>
              </div>

              {!isAvailable ? (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    if (onNotifyStock && product && selectedVariant) {
                      onNotifyStock(product, selectedVariant);
                    }
                  }}
                  className="flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/30 hover:from-amber-500/30 hover:to-amber-600/40 text-amber-300 border border-amber-500/40 transition-all duration-200 active:scale-95 min-w-0 shadow-lg shadow-amber-500/10"
                >
                  <Bell className="w-4 h-4 shrink-0" />
                  <span className="truncate">Уведомить о наличии</span>
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 active:scale-95 min-w-0 ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#c5a880] hover:bg-[#d8bf9b] text-black shadow-lg shadow-[#c5a880]/15'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 shrink-0" />
                      <span className="truncate">Добавлено</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 shrink-0" />
                      <span className="truncate">Добавить • {selectedVariant?.volume || ''}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
