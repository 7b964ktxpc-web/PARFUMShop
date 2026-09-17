import React, { useRef, useState, useEffect } from 'react';
import { triggerHaptic } from '../lib/telegram';
import { Flame, Sparkles } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Все' },
  { id: 'popular', label: 'Хиты', isPopular: true },
  { id: 'new', label: 'Новинки', isNew: true },
  { id: 'decant', label: 'Распив' },
  { id: 'bottles', label: 'Флаконы' },
  { id: 'men', label: 'Мужские' },
  { id: 'women', label: 'Женские' },
  { id: 'unisex', label: 'Унисекс' }
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const getMaskStyle = () => {
    if (canScrollLeft && canScrollRight) {
      return {
        maskImage: 'linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 28px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 28px), transparent 100%)'
      };
    }
    if (canScrollLeft && !canScrollRight) {
      return {
        maskImage: 'linear-gradient(to right, transparent 0%, black 24px)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 24px)'
      };
    }
    if (!canScrollLeft && canScrollRight) {
      return {
        maskImage: 'linear-gradient(to right, black calc(100% - 28px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 28px), transparent 100%)'
      };
    }
    return {};
  };

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        style={getMaskStyle()}
        className="w-full overflow-x-auto no-scrollbar py-2 px-4 flex items-center gap-2 select-none"
      >
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic('select');
                onSelectCategory(cat.id);
              }}
              className={`whitespace-nowrap px-3.5 py-2 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-[#c5a880] text-black shadow-md font-semibold'
                  : 'bg-white/5 text-[#a1a1aa] hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat.isPopular && (
                <Flame
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-black fill-black' : 'text-[#c5a880] fill-[#c5a880]'
                  }`}
                />
              )}
              {cat.isNew && (
                <Sparkles
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-black' : 'text-[#c5a880]'
                  }`}
                />
              )}
              <span>{cat.label}</span>
            </button>
          );
        })}
        {/* End breathing space */}
        <div className="w-1 shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
};
