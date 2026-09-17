import React from 'react';
import { ShoppingBag, ShieldCheck, ArrowLeft, Send, Share2, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { isInsideTelegram, getTelegramUser, triggerHaptic } from '../lib/telegram';

interface HeaderProps {
  currentView: 'shop' | 'admin' | 'profile';
  onViewChange: (view: 'shop' | 'admin' | 'profile') => void;
  onShareStore?: () => void;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, onShareStore, isAdmin }) => {
  const { totalCount, setIsCartOpen } = useCart();
  const tgUser = getTelegramUser();
  const inTg = isInsideTelegram();

  return (
    <header className="sticky top-0 z-40 bg-[#1e2029]/90 backdrop-blur-md border-b border-white/5 transition-colors">
      <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {currentView !== 'shop' ? (
            <button
              onClick={() => {
                triggerHaptic('light');
                onViewChange('shop');
              }}
              className="flex items-center gap-1.5 text-xs text-[#c5a880] hover:text-[#d8bf9b] transition-colors py-1 px-2.5 rounded-lg bg-white/5 border border-white/10 active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>В магазин</span>
            </button>
          ) : (
            <div
              onClick={() => {
                triggerHaptic('light');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="cursor-pointer group flex flex-col min-w-0"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="font-serif tracking-[0.14em] sm:tracking-[0.22em] text-base sm:text-lg font-semibold text-[#f4f4f5] uppercase group-hover:text-[#c5a880] transition-colors truncate">
                  PARFUM.SELECTIVE
                </span>
                {inTg && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] bg-[#229ED9]/15 text-[#229ED9] border border-[#229ED9]/30 font-medium">
                    <Send className="w-2.5 h-2.5" />
                    Mini App
                  </span>
                )}
              </div>
              <span className="text-[8.5px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#8e8e93] font-light truncate">
                Нишевая парфюмерия • Распив
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {currentView === 'shop' && (
            <>
              {/* Share Store Button */}
              {onShareStore && (
                <button
                  id="btn-share-store"
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onShareStore();
                  }}
                  className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs text-[#d4d4d8] hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-1.5 active:scale-95"
                  title="Поделиться бутиком"
                >
                  <Share2 className="w-4 h-4 text-[#c5a880]" />
                  <span className="hidden sm:inline">Поделиться</span>
                </button>
              )}

              {/* Profile button */}
              <button
                id="btn-profile-switch"
                onClick={() => {
                  triggerHaptic('light');
                  onViewChange('profile');
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs text-[#a1a1aa] hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-1.5 active:scale-95"
                title="Личный кабинет"
              >
                <User className="w-3.5 h-3.5 text-[#c5a880]" />
                <span className="hidden sm:inline">Профиль</span>
              </button>

              {/* Admin toggle button (Only for admins) */}
              {isAdmin && (
                <button
                  id="btn-admin-switch"
                  onClick={() => {
                    triggerHaptic('light');
                    onViewChange('admin');
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs text-[#a1a1aa] hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-1.5 active:scale-95"
                  title="Панель администратора"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span className="hidden sm:inline">Админка</span>
                </button>
              )}

              {/* Cart Button */}
              <button
                id="btn-open-cart"
                onClick={() => {
                  triggerHaptic('medium');
                  setIsCartOpen(true);
                }}
                className="relative flex items-center justify-center p-2 rounded-xl bg-[#c5a880] hover:bg-[#d8bf9b] text-black font-medium transition-all active:scale-95 shadow-md shadow-[#c5a880]/10"
                aria-label="Корзина"
              >
                <ShoppingBag className="w-5 h-5 text-black" />
                {totalCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#e11d48] text-white text-[11px] font-bold flex items-center justify-center border-2 border-[#1e2029] animate-in zoom-in-50">
                    {totalCount}
                  </span>
                )}
              </button>
            </>
          )}

          {currentView === 'admin' && (
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#c5a880]/10 text-[#c5a880] border border-[#c5a880]/20 font-medium">
                Администратор
              </span>
            </div>
          )}

          {currentView === 'profile' && (
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#c5a880]/10 text-[#c5a880] border border-[#c5a880]/20 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Личный кабинет</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

