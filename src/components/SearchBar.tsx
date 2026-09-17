import React from 'react';
import { Search, X } from 'lucide-react';
import { triggerHaptic } from '../lib/telegram';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717a]">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Поиск по названию, бренду или нотам..."
        className="w-full pl-10 pr-9 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-[#f4f4f5] placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]/50 focus:bg-white/[0.07] transition-all"
      />
      {value && (
        <button
          onClick={() => {
            triggerHaptic('light');
            onChange('');
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#71717a] hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
