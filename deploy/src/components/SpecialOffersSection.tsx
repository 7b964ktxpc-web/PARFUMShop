import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Percent, ArrowRight, Plus, Check, Clock, ChevronRight, ChevronLeft, Heart } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { triggerHaptic } from '../lib/telegram';

interface SpecialOffersSectionProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
}

export const SpecialOffersSection: React.FC<SpecialOffersSectionProps> = ({
  products,
  onOpenDetails
}) => {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [addedVariants, setAddedVariants] = useState<Record<string, boolean>>({});
  const [animatingHearts, setAnimatingHearts] = useState<Record<string, boolean>>({});

  // Filter products that have special offers or variants with old_price
  const specialOffers = products.filter(
    p => p.is_active && (p.is_special_offer || p.discount_percent || p.variants.some(v => v.old_price && v.old_price > v.price))
  );

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [specialOffers]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      triggerHaptic('light');
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product, variant: ProductVariant) => {
    e.stopPropagation();
    triggerHaptic('medium');
    addItem(product, variant);
    setAddedVariants(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedVariants(prev => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  if (specialOffers.length === 0) {
    return null;
  }

  // Calculate mask style for smooth edge fading
  const getMaskStyle = () => {
    if (canScrollLeft && canScrollRight) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 28px, black calc(100% - 28px), transparent 100%)',
        maskImage: 'linear-gradient(to right, transparent 0, black 28px, black calc(100% - 28px), transparent 100%)'
      };
    } else if (canScrollLeft) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 28px, black 100%)',
        maskImage: 'linear-gradient(to right, transparent 0, black 28px, black 100%)'
      };
    } else if (canScrollRight) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, black 0, black calc(100% - 28px), transparent 100%)',
        maskImage: 'linear-gradient(to right, black 0, black calc(100% - 28px), transparent 100%)'
      };
    }
    return {};
  };

  return (
    <section className="w-full relative my-1">
      {/* Container with soft luxury border & gradient glow */}
      <div className="mx-4 p-4 rounded-3xl bg-gradient-to-b from-[#2b2725] via-[#242532] to-[#20212c] border border-[#c5a880]/30 shadow-xl shadow-black/40 overflow-hidden relative">
        {/* Background decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#c5a880]/10 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-600/10 rounded-full blur-2xl pointer-events-none -ml-8 -mb-8" />

        {/* Section Header */}
        <div className="flex items-center justify-between gap-2 mb-3.5 relative z-10">
          <div>
            <div className="flex items-center gap-1.5 text-[#c5a880] text-[11px] font-bold uppercase tracking-wider">
              <span className="p-1 rounded-md bg-[#c5a880]/20 text-[#c5a880]">
                <Percent className="w-3 h-3 stroke-[2.5]" />
              </span>
              <span>Специальные предложения</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm">
                SALE
              </span>
            </div>
            <p className="text-xs text-[#a1a1aa] mt-0.5 font-light">
              Культовые позиции по временной сниженной цене
            </p>
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`p-1.5 rounded-xl border transition-all ${
                canScrollLeft
                  ? 'bg-white/10 text-white border-white/10 hover:bg-[#c5a880] hover:text-black cursor-pointer'
                  : 'bg-white/5 text-[#52525b] border-white/5 cursor-not-allowed opacity-40'
              }`}
              title="Назад"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`p-1.5 rounded-xl border transition-all ${
                canScrollRight
                  ? 'bg-white/10 text-white border-white/10 hover:bg-[#c5a880] hover:text-black cursor-pointer'
                  : 'bg-white/5 text-[#52525b] border-white/5 cursor-not-allowed opacity-40'
              }`}
              title="Вперед"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edge-to-Edge Cards Carousel */}
        <div
          ref={scrollRef}
          style={getMaskStyle()}
          className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-2 px-2 relative z-10"
        >
          {specialOffers.map((product) => {
            const availableVariants = product.variants.filter(v => v.is_available);
            const activeVariant = availableVariants.find(v => v.old_price && v.old_price > v.price) || availableVariants[0] || product.variants[0];
            const isAdded = addedVariants[product.id];
            const isFav = isFavorite(product.id);
            const isHeartAnimating = animatingHearts[product.id];

            const discountBadge = product.special_offer_badge || (
              activeVariant?.old_price
                ? `-${Math.round(((activeVariant.old_price - activeVariant.price) / activeVariant.old_price) * 100)}%`
                : '-20%'
            );

            return (
              <div
                key={product.id}
                onClick={() => {
                  triggerHaptic('light');
                  onOpenDetails(product);
                }}
                className="group shrink-0 w-[210px] sm:w-[230px] bg-[#1e2029]/90 border border-white/10 rounded-2xl p-3 flex flex-col justify-between hover:border-[#c5a880]/50 hover:bg-[#222430] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl relative overflow-hidden"
              >
                {/* Badges and Actions Layer */}
                <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex justify-between items-start">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-black/50 border border-white/20">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{discountBadge}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                      if (!isFav) {
                        setAnimatingHearts(prev => ({ ...prev, [product.id]: true }));
                        setTimeout(() => {
                          setAnimatingHearts(prev => ({ ...prev, [product.id]: false }));
                        }, 300);
                      }
                    }}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-black/80 text-white/75 hover:text-red-500 backdrop-blur-md border border-white/10 transition-all active:scale-95 shadow-md"
                    title={isFav ? "Убрать из избранного" : "Добавить в избранное"}
                  >
                    <Heart 
                      className={`w-3.5 h-3.5 transition-all duration-300 ${isFav ? 'fill-red-500 text-red-500' : 'group-hover:text-red-500'} ${isHeartAnimating ? 'scale-150' : 'scale-100'}`} 
                    />
                  </button>
                </div>

                {/* Product Image */}
                <div className="relative w-full aspect-square bg-[#171821] rounded-xl overflow-hidden mb-2.5">
                  <img
                    src={product.image_url}
                    alt={`${product.brand} - ${product.name}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                  {/* Volume indicator */}
                  {activeVariant && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-medium text-white/90 border border-white/10">
                      {activeVariant.volume}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-[#a1a1aa] font-medium truncate">
                    {product.brand}
                  </span>
                  <h4 className="font-serif text-sm font-semibold text-white group-hover:text-[#c5a880] transition-colors line-clamp-1 mt-0.5">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-[#71717a] truncate italic font-serif mt-0.5">
                    {product.direction}
                  </p>

                  {/* Temporary Price Highlight */}
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-baseline justify-between gap-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-sm sm:text-base text-[#c5a880]">
                        {activeVariant ? `${activeVariant.price.toLocaleString('ru-RU')} ₽` : '—'}
                      </span>
                      {activeVariant?.old_price && (
                        <span className="text-xs text-[#71717a] line-through font-normal">
                          {activeVariant.old_price.toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Add Button */}
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, product, activeVariant)}
                    className={`mt-2.5 w-full py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/10 text-white hover:bg-[#c5a880] hover:text-black border border-white/10'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Добавлено</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>В корзину • {activeVariant?.volume}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {/* End spacing spacer */}
          <div className="shrink-0 w-2" />
        </div>
      </div>
    </section>
  );
};
