import React, { useState, useEffect } from 'react';
import { Package, Gift, Copy, Check, Info, Heart } from 'lucide-react';
import { getTelegramUser, triggerHaptic } from '../../lib/telegram';
import { useFavorites } from '../../context/FavoritesContext';
import { Product } from '../../types';
import { ProductCard } from '../ProductCard';

interface ProfileData {
  orders: any[];
  promoCodes: any[];
}

interface ProfileLayoutProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({ products, onOpenDetails }) => {
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const { favoriteIds } = useFavorites();
  const [activeTab, setActiveTab] = useState<'favorites' | 'orders' | 'promocodes'>('favorites');

  useEffect(() => {
    const fetchProfile = async () => {
      const user = getTelegramUser();
      if (!user || !user.id) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/profile/${user.id}`);
        const result = await res.json();
        if (result.success) {
          setData({
            orders: result.orders || [],
            promoCodes: result.promoCodes || []
          });
        }
      } catch (e) {
        console.error('Failed to fetch profile', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    triggerHaptic('success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-white/5 rounded-xl w-full" />
          <div className="h-32 bg-white/5 rounded-2xl" />
          <div className="h-32 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-[#a1a1aa]">Ошибка загрузки профиля.</p>
      </div>
    );
  }

  const favoriteProducts = products.filter(p => favoriteIds.includes(p.id));

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-6">
      
      {/* Tabs */}
      <div className="flex bg-[#242532] p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'favorites' ? 'bg-[#1e2029] text-white shadow-sm' : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${activeTab === 'favorites' ? 'fill-red-500 text-red-500' : ''}`} />
          Избранное
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'orders' ? 'bg-[#1e2029] text-white shadow-sm' : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          Заказы
        </button>
        <button
          onClick={() => setActiveTab('promocodes')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'promocodes' ? 'bg-[#1e2029] text-white shadow-sm' : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          Промокоды
        </button>
      </div>

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 px-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-lg font-serif font-semibold text-white">Избранное</h2>
          </div>
          
          {favoriteProducts.length === 0 ? (
            <div className="bg-[#242532] border border-white/5 rounded-2xl p-6 text-center">
              <p className="text-sm text-[#a1a1aa]">Вы еще не добавляли товары в избранное.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {favoriteProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={onOpenDetails}
                />
              ))}
            </div>
          )}
        </section>
      )}
      
      {/* Promo Codes Tab */}
      {activeTab === 'promocodes' && (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 px-2">
            <Gift className="w-5 h-5 text-[#c5a880]" />
            <h2 className="text-lg font-serif font-semibold text-white">Мои промокоды</h2>
          </div>
          
          {data.promoCodes.length === 0 ? (
            <div className="bg-[#242532] border border-white/5 rounded-2xl p-6 text-center">
              <p className="text-sm text-[#a1a1aa]">У вас пока нет доступных промокодов.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.promoCodes.map((promo) => (
                <div key={promo.id} className="bg-[#242532] border border-[#c5a880]/30 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#c5a880]/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a880] font-bold">
                        {promo.type === 'registration' ? 'Подарок за регистрацию' : 'Персональная скидка'}
                      </span>
                      <span className="text-xs text-white/50">{promo.times_used}/{promo.max_uses}</span>
                    </div>
                    <div className="text-2xl font-serif font-bold text-white mb-2">
                      Скидка {promo.discount_type === 'percent' ? `${promo.discount_value}%` : `${promo.discount_value} ₽`}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between bg-black/20 p-2 pl-4 rounded-xl border border-white/5">
                    <span className="font-mono font-bold text-[#c5a880] tracking-wider">{promo.code}</span>
                    <button
                      onClick={() => handleCopy(promo.code)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors active:scale-95"
                      title="Скопировать"
                    >
                      {copiedCode === promo.code ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 px-2">
            <Package className="w-5 h-5 text-[#c5a880]" />
            <h2 className="text-lg font-serif font-semibold text-white">История заказов</h2>
          </div>

          {data.orders.length === 0 ? (
            <div className="bg-[#242532] border border-white/5 rounded-2xl p-6 text-center">
              <p className="text-sm text-[#a1a1aa]">Вы еще не оформляли заказы.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((order) => (
                <div key={order.id} className="bg-[#242532] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-white">{order.order_number}</div>
                      <div className="text-xs text-[#a1a1aa] mt-0.5">{new Date(order.created_at).toLocaleDateString('ru-RU')}</div>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-[#c5a880]/10 border border-[#c5a880]/20 text-[#c5a880] text-xs font-medium">
                      {order.status}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-[#d4d4d8] truncate pr-4">{item.brand} — {item.product_name} ({item.volume}) x{item.quantity}</span>
                        <span className="text-white font-medium shrink-0">{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="text-sm text-[#a1a1aa]">Итого:</span>
                    <span className="text-base font-bold text-[#c5a880]">{order.total.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  );
};
