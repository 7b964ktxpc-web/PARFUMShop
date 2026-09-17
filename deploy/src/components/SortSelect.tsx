import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpDown, 
  Flame, 
  Sparkles, 
  ArrowDownNarrowWide, 
  ArrowUpWideNarrow, 
  ArrowDownAZ, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import { SortOption } from '../types';
import { triggerHaptic } from '../lib/telegram';

interface SortSelectProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

interface SortItemConfig {
  id: SortOption;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

export const SORT_CONFIG: SortItemConfig[] = [
  {
    id: 'popular',
    label: 'По популярности',
    shortLabel: 'Популярные',
    icon: <Flame className="w-3.5 h-3.5 text-[#c5a880] fill-[#c5a880]" />
  },
  {
    id: 'price_asc',
    label: 'Цена: от меньшей к большей',
    shortLabel: 'Сначала дешевле',
    icon: <ArrowDownNarrowWide className="w-3.5 h-3.5 text-[#c5a880]" />
  },
  {
    id: 'price_desc',
    label: 'Цена: от большей к меньшей',
    shortLabel: 'Сначала дороже',
    icon: <ArrowUpWideNarrow className="w-3.5 h-3.5 text-[#c5a880]" />
  },
  {
    id: 'newest',
    label: 'По новизне',
    shortLabel: 'Новинки',
    icon: <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
  },
  {
    id: 'name_asc',
    label: 'По названию (А–Я)',
    shortLabel: 'А–Я',
    icon: <ArrowDownAZ className="w-3.5 h-3.5 text-[#c5a880]" />
  }
];

export const SortSelect: React.FC<SortSelectProps> = ({
  currentSort,
  onSortChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeItem = SORT_CONFIG.find((item) => item.id === currentSort) || SORT_CONFIG[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (sortId: SortOption) => {
    triggerHaptic('select');
    onSortChange(sortId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer select-none active:scale-95 ${
          isOpen
            ? 'bg-[#c5a880]/15 text-[#f4f4f5] border border-[#c5a880]/50 shadow-md'
            : currentSort !== 'popular'
            ? 'bg-[#c5a880]/10 text-[#c5a880] border border-[#c5a880]/30 hover:border-[#c5a880]/50 hover:bg-[#c5a880]/15'
            : 'bg-white/5 text-[#a1a1aa] hover:text-white hover:bg-white/10 border border-white/5'
        }`}
        title="Выбрать сортировку"
      >
        <span className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3 h-3 text-[#c5a880]" />
          <span className="text-[#71717a] hidden xs:inline">Сортировка:</span>
          <span className="font-semibold text-white truncate max-w-[130px] sm:max-w-none">
            {activeItem.shortLabel}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#a1a1aa] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 mt-1.5 w-60 sm:w-64 bg-[#262835] border border-white/15 rounded-2xl shadow-2xl shadow-black/80 z-30 overflow-hidden py-1.5 backdrop-blur-xl"
          >
            <div className="px-3 py-1.5 border-b border-white/5 text-[10px] uppercase font-semibold tracking-wider text-[#71717a] flex items-center justify-between">
              <span>Сортировать товары</span>
              <ArrowUpDown className="w-3 h-3 text-[#c5a880]" />
            </div>

            <div className="p-1 space-y-0.5">
              {SORT_CONFIG.map((item) => {
                const isSelected = currentSort === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer select-none active:scale-[0.98] ${
                      isSelected
                        ? 'bg-[#c5a880] text-black font-semibold'
                        : 'text-[#d4d4d8] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isSelected ? 'text-black' : ''}>
                        {React.cloneElement(item.icon as React.ReactElement, {
                          className: `w-3.5 h-3.5 ${
                            isSelected
                              ? 'text-black fill-black'
                              : 'text-[#c5a880]'
                          }`
                        })}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 stroke-[2.5] text-black" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
