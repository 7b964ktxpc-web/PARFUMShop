import React from 'react';
import { Package, ShoppingCart, TrendingUp, AlertTriangle, Clock, Send, Check } from 'lucide-react';
import { AdminStats, Order } from '../../types';

interface AdminDashboardProps {
  stats: AdminStats | null;
  recentOrders: Order[];
  onNavigateToOrders: () => void;
  onNavigateToProducts: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  recentOrders,
  onNavigateToOrders,
  onNavigateToProducts
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Orders */}
        <div
          onClick={onNavigateToOrders}
          className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#c5a880]/30 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-[#a1a1aa] mb-1">
            <span>Всего заказов</span>
            <ShoppingCart className="w-4 h-4 text-[#c5a880]" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats?.totalOrders ?? 0}
          </div>
        </div>

        {/* New Orders */}
        <div
          onClick={onNavigateToOrders}
          className="p-4 rounded-2xl bg-[#c5a880]/10 border border-[#c5a880]/30 hover:bg-[#c5a880]/15 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-[#c5a880] mb-1 font-medium">
            <span>Новые заказы</span>
            <Clock className="w-4 h-4 text-[#c5a880]" />
          </div>
          <div className="text-2xl font-bold text-[#c5a880]">
            {stats?.newOrders ?? 0}
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center justify-between text-xs text-[#a1a1aa] mb-1">
            <span>Сумма заказов</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white truncate">
            {(stats?.totalRevenue ?? 0).toLocaleString('ru-RU')} ₽
          </div>
        </div>

        {/* Products */}
        <div
          onClick={onNavigateToProducts}
          className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-[#a1a1aa] mb-1">
            <span>Товаров в каталоге</span>
            <Package className="w-4 h-4 text-[#d4d4d8]" />
          </div>
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <span>{stats?.totalProducts ?? 0}</span>
            {Boolean(stats?.outOfStockProducts) && (
              <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-normal">
                {stats?.outOfStockProducts} без наличия
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="p-5 rounded-2xl bg-[#262835] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-white">
            Последние заказы
          </h3>
          <button
            onClick={onNavigateToOrders}
            className="text-xs text-[#c5a880] hover:underline"
          >
            Смотреть все →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#71717a]">
            Заказов пока нет
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentOrders.slice(0, 5).map(order => (
              <div
                key={order.id}
                onClick={onNavigateToOrders}
                className="py-3 flex items-center justify-between text-xs cursor-pointer hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{order.order_number}</span>
                    {order.telegram_notified ? (
                      <span
                        className="inline-flex items-center gap-0.5 text-emerald-400 text-[10px]"
                        title="Уведомление в Telegram доставлено"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center text-[#52525b] text-[10px]"
                        title="Уведомление в Telegram не отправлялось"
                      >
                        <Send className="w-2.5 h-2.5 opacity-40" />
                      </span>
                    )}
                    <span className="text-[#a1a1aa]">{order.customer_name}</span>
                  </div>
                  <div className="text-[11px] text-[#71717a] mt-0.5">
                    {order.items.length} поз. • {new Date(order.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-[#c5a880]">
                    {order.total.toLocaleString('ru-RU')} ₽
                  </div>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-0.5 ${
                    order.status === 'Новый'
                      ? 'bg-[#c5a880]/20 text-[#c5a880]'
                      : order.status === 'Принят'
                      ? 'bg-blue-500/20 text-blue-300'
                      : order.status === 'Готов' || order.status === 'Выдан'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-white/10 text-white/70'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
