import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BellRing,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Send,
  Sparkles,
  Bell,
  Tag
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminNotifications } from './AdminNotifications';
import { AdminStories } from './AdminStories';
import { AdminStockRequests } from './AdminStockRequests';
import { AdminBroadcasts } from './AdminBroadcasts';
import { AdminPromoCodes } from './AdminPromoCodes';
import { Product, Order, StoreSettings, AdminStats, OrderStatus, Story } from '../../types';
import { triggerHaptic, getTelegramUser } from '../../lib/telegram';

interface AdminLayoutProps {
  onBackToShop: () => void;
  onPreviewStory?: (story: Story) => void;
}

type AdminTab = 'dashboard' | 'products' | 'stories' | 'orders' | 'broadcasts' | 'waitlist' | 'notifications' | 'promos';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToShop, onPreviewStory }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tgUser = getTelegramUser();

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [resStats, resOrders, resProducts, resSettings, resStories] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/stories').then(r => r.json()).catch(() => ({ success: false, stories: [] }))
      ]);

      if (resStats.success) setStats(resStats.stats);
      if (resOrders.success) setOrders(resOrders.orders);
      if (resProducts.success) setProducts(resProducts.products);
      if (resSettings.success) setSettings(resSettings.settings);
      if (resStories.success) setStories(resStories.stories);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      setOrders(prev => prev.map(o => (o.id === orderId ? data.order : o)));
      // Refresh stats
      fetch('/api/stats')
        .then(r => r.json())
        .then(s => s.success && setStats(s.stats));
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    const isEdit = Boolean(productData.id);
    const url = isEdit ? `/api/products/${productData.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка при сохранении парфюма');
    }
    fetchAllData();
  };

  const handleDeleteProduct = async (productId: string) => {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      alert(data.error || 'Ошибка удаления товара');
      return;
    }
    setProducts(prev => prev.filter(p => p.id !== productId));
    // Refresh stats
    fetch('/api/stats')
      .then(r => r.json())
      .then(s => s.success && setStats(s.stats));
  };

  const handleUpdateSettings = async (newSettings: Partial<StoreSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка при обновлении настроек');
    }
    setSettings(data.settings);
  };

  const handleSaveStory = async (storyData: Partial<Story>) => {
    const isEdit = Boolean(storyData.id);
    const url = isEdit ? `/api/stories/${storyData.id}` : '/api/stories';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storyData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка при сохранении истории');
    }
    fetchAllData();
  };

  const handleDeleteStory = async (storyId: string) => {
    const res = await fetch(`/api/stories/${storyId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      alert(data.error || 'Ошибка удаления истории');
      return;
    }
    setStories(prev => prev.filter(s => s.id !== storyId));
  };

  const handleResetStories = async () => {
    const res = await fetch('/api/stories/reset', {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      alert(data.error || 'Ошибка при сбросе историй');
      return;
    }
    setStories(data.stories);
  };

  return (
    <div className="min-h-screen bg-[#1e2029] text-[#f4f4f5] pb-12">
      {/* Admin Nav Bar */}
      <div className="border-b border-white/5 bg-[#242532]/80 sticky top-14 z-30 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between overflow-x-auto no-scrollbar gap-2 smooth-scroll">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                triggerHaptic('select');
                setActiveTab('dashboard');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-[#c5a880] text-black font-semibold'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('select');
                setActiveTab('orders');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all relative shrink-0 whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-[#c5a880] text-black font-semibold'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Заказы</span>
              {Boolean(stats?.newOrders) && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => {
                triggerHaptic('select');
                setActiveTab('products');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-[#c5a880] text-black font-semibold'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Товары</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('select');
                setActiveTab('stories');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'stories'
                  ? 'bg-[#c5a880] text-black font-semibold'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Истории</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('select');
                setActiveTab('broadcasts');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'broadcasts'
                  ? 'bg-[#c5a880] text-black font-semibold'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Рассылки</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('select');
                setActiveTab('waitlist');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'waitlist'
                  ? 'bg-[#c5a880] text-black font-semibold'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Лист ожидания</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('select');
                setActiveTab('notifications');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'bg-[#c5a880] text-black font-semibold'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Уведомления</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('select');
                setActiveTab('promos');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'promos'
                  ? 'bg-[#c5a880] text-black font-semibold'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Промокоды</span>
            </button>
          </div>

          <button
            onClick={fetchAllData}
            className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-white/5 shrink-0"
            title="Обновить данные"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Architecture Alert (Section 8: Будущая авторизация админки) */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px] text-[#8e8e93]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>
              <strong>Архитектура доступа:</strong> Тестовый режим (открыт). В продакшене активируется фильтр по <code>ADMIN_TELEGRAM_IDS</code>.
            </span>
          </div>
          {tgUser && (
            <span className="text-[#229ED9]">
              Ваш Telegram ID: {tgUser.id}
            </span>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-4xl mx-auto px-4 pt-4">
        {isLoading && !stats ? (
          <div className="py-20 text-center text-xs text-[#71717a]">
            Загрузка панели управления...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <AdminDashboard
                stats={stats}
                recentOrders={orders}
                onNavigateToOrders={() => setActiveTab('orders')}
                onNavigateToProducts={() => setActiveTab('products')}
              />
            )}

            {activeTab === 'orders' && (
              <AdminOrders
                orders={orders}
                onRefresh={fetchAllData}
                onUpdateStatus={handleUpdateOrderStatus}
              />
            )}

            {activeTab === 'products' && (
              <AdminProducts
                products={products}
                onRefresh={fetchAllData}
                onSaveProduct={handleSaveProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeTab === 'stories' && (
              <AdminStories
                stories={stories}
                products={products}
                onRefresh={fetchAllData}
                onSaveStory={handleSaveStory}
                onDeleteStory={handleDeleteStory}
                onResetStories={handleResetStories}
                onPreviewStory={onPreviewStory}
              />
            )}

            {activeTab === 'broadcasts' && (
              <AdminBroadcasts />
            )}

            {activeTab === 'waitlist' && (
              <AdminStockRequests />
            )}

            {activeTab === 'notifications' && (
              <AdminNotifications
                settings={settings}
                onRefresh={fetchAllData}
                onUpdateSettings={handleUpdateSettings}
              />
            )}

            {activeTab === 'promos' && (
              <AdminPromoCodes />
            )}
          </>
        )}
      </main>
    </div>
  );
};
