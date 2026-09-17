import React, { useState } from 'react';
import { Plus, Check, Sparkles, Flame, Percent, Share2, Bell, Heart } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { triggerHaptic } from '../lib/telegram';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onShare?: (product: Product) => void;
  onNotifyStock?: (product: Product, variant: ProductVariant) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails, onShare, onNotifyStock }) => {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const isFav = isFavorite(product.id);

  const availableVariants = product.variants.filter(v => v.is_available);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    availableVariants[0] || product.variants[0]
  );
  const [isAdded, setIsAdded] = useState(false);

  const isSelectedAvailable = selectedVariant?.is_available;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSelectedAvailable || !selectedVariant) return;

    addItem(product, selectedVariant);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const discountBadge = product.special_offer_badge || (
    product.discount_percent
      ? `-${product.discount_percent}%`
      : selectedVariant?.old_price && selectedVariant.old_price > selectedVariant.price
      ? `-${Math.round(((selectedVariant.old_price - selectedVariant.price) / selectedVariant.old_price) * 100)}%`
      : null
  );

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group relative flex flex-col bg-[#262835] border border-white/10 rounded-2xl overflow-hidden hover:border-[#c5a880]/40 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl hover:shadow-black/30"
    >
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5 items-center max-w-[70%]">
        {(product.is_special_offer || discountBadge) && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider uppercase bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg shadow-black/50 border border-white/20">
            <Percent className="w-2.5 h-2.5 stroke-[3]" />
            <span>{discountBadge || 'SALE'}</span>
          </span>
        )}
        {product.is_popular && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase bg-[#1e2029]/90 text-[#f5dfb8] backdrop-blur-md border border-[#c5a880]/60 shadow-lg shadow-black/40">
            <Flame className="w-3 h-3 text-[#c5a880] fill-[#c5a880]" />
            <span>Хит</span>
          </span>
        )}
        {product.is_new && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#c5a880] text-black shadow-lg shadow-black/40">
            <Sparkles className="w-3 h-3 text-black" />
            <span>Новинка</span>
          </span>
        )}
      </div>

      {/* Action Buttons Container (Share & Favorite) */}
      <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-2">
        {onShare && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              onShare(product);
            }}
            className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/75 hover:text-[#c5a880] backdrop-blur-md border border-white/10 transition-all active:scale-95 shadow-md"
            title="Поделиться"
            aria-label="Поделиться"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
            if (!isFav) {
              setIsHeartAnimating(true);
              setTimeout(() => setIsHeartAnimating(false), 300);
            }
          }}
          className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/75 hover:text-red-500 backdrop-blur-md border border-white/10 transition-all active:scale-95 shadow-md group"
          title={isFav ? "Убрать из избранного" : "Добавить в избранное"}
          aria-label="Избранное"
        >
          <Heart 
            className={`w-3.5 h-3.5 transition-all duration-300 ${isFav ? 'fill-red-500 text-red-500' : 'group-hover:text-red-500'} ${isHeartAnimating ? 'scale-150' : 'scale-100'}`} 
          />
        </button>
      </div>

      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-square bg-[#1e2029] overflow-hidden">
        <img
          src={product.image_url}
          alt={`${product.brand} - ${product.name}`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#262835] via-transparent to-transparent opacity-80" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4 min-w-0">
        {/* Brand */}
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#a1a1aa] font-medium truncate block">
          {product.brand}
        </span>

        {/* Name */}
        <h3 className="font-serif text-base sm:text-xl font-semibold text-[#f4f4f5] mt-0.5 leading-snug group-hover:text-[#c5a880] transition-colors break-words line-clamp-2">
          {product.name}
        </h3>

        {/* Direction */}
        <p className="text-xs text-[#8e8e93] mt-1 truncate italic font-serif">
          {product.direction}
        </p>

        {/* Notes preview */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {product.notes.main.slice(0, 3).map((note, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-[#d4d4d8] border border-white/5 truncate max-w-full"
            >
              {note}
            </span>
          ))}
        </div>

        {/* Volume & Price selector */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="text-[11px] text-[#71717a] mb-1.5 flex items-center justify-between gap-1">
            <span className="truncate">Выберите объём:</span>
            <div className="flex items-baseline gap-1.5 shrink-0">
              <span className="text-xs font-semibold text-[#c5a880] whitespace-nowrap">
                {selectedVariant ? `${selectedVariant.price.toLocaleString('ru-RU')} ₽` : 'Нет в наличии'}
              </span>
              {selectedVariant?.old_price && (
                <span className="text-[11px] text-[#71717a] line-through font-normal whitespace-nowrap">
                  {selectedVariant.old_price.toLocaleString('ru-RU')} ₽
                </span>
              )}
            </div>
          </div>

          {/* Volume chips */}
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5" onClick={e => e.stopPropagation()}>
            {product.variants.slice(0, 3).map(variant => {
              const isSelected = selectedVariant?.id === variant.id;
              return (
                <button
                  key={variant.id}
                  onClick={() => {
                    triggerHaptic('select');
                    setSelectedVariant(variant);
                  }}
                  className={`py-1.5 px-0.5 sm:px-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all text-center flex flex-col items-center justify-center min-w-0 overflow-hidden ${
                    isSelected
                      ? variant.is_available
                        ? 'bg-[#c5a880] text-black font-semibold shadow-sm'
                        : 'bg-amber-500/20 text-amber-200 border border-amber-500/40 font-semibold'
                      : !variant.is_available
                      ? 'opacity-40 line-through bg-white/5 text-[#71717a] hover:opacity-75'
                      : 'bg-white/5 text-[#d4d4d8] hover:bg-white/10 border border-white/5'
                  }`}
                  title={!variant.is_available ? 'Нет в наличии (нажмите, чтобы запросить уведомление)' : undefined}
                >
                  <span className="truncate w-full px-0.5">{variant.volume}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[8.5px] sm:text-[9px] opacity-90 whitespace-nowrap">
                      {variant.price.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* If there are more variants, e.g. bottle */}
          {product.variants.length > 3 && (
            <button
              onClick={() => onOpenDetails(product)}
              className="mt-1.5 w-full text-center text-[10px] text-[#a1a1aa] hover:text-[#c5a880] transition-colors truncate px-1"
            >
              + флакон {product.variants[3].volume} ({product.variants[3].price.toLocaleString('ru-RU')} ₽)
            </button>
          )}

          {/* Action Button */}
          <div className="mt-3">
            {!isSelectedAvailable ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('medium');
                  if (onNotifyStock && selectedVariant) {
                    onNotifyStock(product, selectedVariant);
                  } else {
                    onOpenDetails(product);
                  }
                }}
                className="w-full py-2.5 px-2.5 sm:px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 shadow-sm"
              >
                <Bell className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Уведомить о наличии</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-2.5 px-2.5 sm:px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
                  isAdded
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-black hover:bg-[#c5a880] hover:text-black shadow-sm'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Добавлено</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">В корзину • {selectedVariant?.price.toLocaleString('ru-RU')} ₽</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
