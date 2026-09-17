import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { Eye, CheckCircle, RefreshCw, XCircle, Package, Send, Check } from 'lucide-react';
import { triggerHaptic } from '../../lib/telegram';

interface AdminOrdersProps {
  orders: Order[];
  onRefresh: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

const STATUS_FILTERS: (OrderStatus | 'Все')[] = [
  'Все',
  'Новый',
  'Принят',
  'Собирается',
  'Готов',
  'Выдан',
  'Отменён'
];

const ALL_STATUSES: OrderStatus[] = [
  'Новый',
  'Принят',
  'Собирается',
  'Готов',
  'Выдан',
  'Отменён'
];

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  onRefresh,
  onUpdateStatus
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'Все'>('Все');
  const [activeOrderModal, setActiveOrderModal] = useState<Order | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter(o =>
    selectedStatus === 'Все' ? true : o.status === selectedStatus
  );

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    triggerHaptic('medium');
    setLoadingOrderId(orderId);
    try {
      await onUpdateStatus(orderId, newStatus);
      if (activeOrderModal && activeOrderModal.id === orderId) {
        setActiveOrderModal(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } finally {
      setLoadingOrderId(null);
    }
  };

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'Новый':
        return 'bg-[#c5a880]/20 text-[#c5a880] border-[#c5a880]/30';
      case 'Принят':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Собирается':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Готов':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Выдан':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Отменён':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-white/10 text-white border-white/10';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header and status filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {STATUS_FILTERS.map(st => (
            <button
              key={st}
              onClick={() => {
                triggerHaptic('select');
                setSelectedStatus(st);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-[#c5a880] text-black font-semibold'
                  : 'bg-white/5 text-[#a1a1aa] hover:text-white border border-white/5'
              }`}
            >
              {st} {st !== 'Все' && `(${orders.filter(o => o.status === st).length})`}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            onRefresh();
          }}
          className="self-end sm:self-auto p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#a1a1aa] hover:text-white border border-white/5 transition-colors flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Обновить</span>
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#262835] border border-white/10 text-[#71717a] text-xs">
          Заказов с таким статусом не найдено
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="p-4 rounded-2xl bg-[#262835] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Order primary info */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-base font-bold text-white">
                    {order.order_number}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getStatusBadgeStyle(order.status)}`}>
                    {order.status}
                  </span>
                  {order.telegram_notified ? (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm"
                      title="Уведомление успешно отправлено в Telegram"
                    >
                      <Send className="w-2.5 h-2.5" />
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span className="text-[10px]">TG отправлено</span>
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-[#71717a] border border-white/10"
                      title="Уведомление в Telegram не отправлялось"
                    >
                      <Send className="w-2.5 h-2.5 opacity-40" />
                      <span className="text-[10px]">TG не отправлено</span>
                    </span>
                  )}
                </div>

                <div className="text-xs text-[#d4d4d8]">
                  <span className="font-semibold text-white">{order.customer_name}</span> •{' '}
                  <span className="text-[#a1a1aa]">{order.customer_phone}</span>
                </div>

                <div className="text-[11px] text-[#71717a]">
                  {new Date(order.created_at).toLocaleString('ru-RU')} • {order.items.length} поз.
                </div>

                {order.comment && (
                  <div className="text-xs text-[#c5a880] italic bg-white/[0.02] p-2 rounded-lg border border-white/5">
                    «{order.comment}»
                  </div>
                )}
              </div>

              {/* Order actions & status select */}
              <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                <div className="text-left md:text-right">
                  <div className="text-xs text-[#71717a]">Итого</div>
                  <div className="text-base font-bold text-[#c5a880]">
                    {order.total.toLocaleString('ru-RU')} ₽
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Dropdown/Selector */}
                  <select
                    value={order.status}
                    disabled={loadingOrderId === order.id}
                    onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#c5a880] cursor-pointer"
                  >
                    {ALL_STATUSES.map(st => (
                      <option key={st} value={st} className="bg-[#242532] text-white">
                        {st}
                      </option>
                    ))}
                  </select>

                  {/* View Details Button */}
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveOrderModal(order);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-colors"
                    title="Посмотреть состав заказа"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-[#242532] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto smooth-scroll"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#71717a]">
                  Детали заказа
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="font-mono text-xl font-bold text-white">
                    {activeOrderModal.order_number}
                  </h3>
                  {activeOrderModal.telegram_notified ? (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                      title="Уведомление успешно отправлено в Telegram"
                    >
                      <Send className="w-2.5 h-2.5" />
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>TG доставлено</span>
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-[#71717a] border border-white/10"
                      title="Уведомление в Telegram не отправлялось"
                    >
                      <Send className="w-2.5 h-2.5 opacity-40" />
                      <span>TG не отправлено</span>
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveOrderModal(null)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white"
              >
                Закрыть
              </button>
            </div>

            {/* Customer Info */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs space-y-1.5">
              <div>
                <span className="text-[#71717a]">Клиент: </span>
                <span className="font-semibold text-white">{activeOrderModal.customer_name}</span>
              </div>
              <div>
                <span className="text-[#71717a]">Телефон: </span>
                <span className="font-semibold text-[#c5a880]">{activeOrderModal.customer_phone}</span>
              </div>
              {activeOrderModal.customer_telegram && (
                <div>
                  <span className="text-[#71717a]">Telegram: </span>
                  <span className="text-[#229ED9]">{activeOrderModal.customer_telegram}</span>
                </div>
              )}
              {activeOrderModal.comment && (
                <div className="pt-1 border-t border-white/5">
                  <span className="text-[#71717a]">Комментарий: </span>
                  <span className="text-white italic">{activeOrderModal.comment}</span>
                </div>
              )}
              <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-[#71717a]">Уведомление в бота:</span>
                {activeOrderModal.telegram_notified ? (
                  <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    Успешно отправлено {activeOrderModal.telegram_message_id ? `(ID: ${activeOrderModal.telegram_message_id})` : ''}
                  </span>
                ) : (
                  <span className="text-[#71717a] inline-flex items-center gap-1">
                    Не отправлено
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#71717a] pt-1">
                Создан: {new Date(activeOrderModal.created_at).toLocaleString('ru-RU')}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Содержимое корзины
              </span>
              <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden bg-white/[0.02]">
                {activeOrderModal.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-white">{item.product_name}</div>
                      <div className="text-[11px] text-[#a1a1aa]">
                        {item.brand} • <span className="text-[#c5a880]">{item.volume}</span> × {item.quantity} шт.
                      </div>
                    </div>
                    <div className="font-bold text-white">
                      {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-white px-2 pt-1">
                <span>Итого к оплате:</span>
                <span className="text-[#c5a880]">{activeOrderModal.total.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="pt-2 border-t border-white/5">
              <span className="text-xs text-[#71717a] block mb-2">Изменить статус:</span>
              <div className="grid grid-cols-3 gap-2">
                {ALL_STATUSES.map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(activeOrderModal.id, st)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                      activeOrderModal.status === st
                        ? 'bg-[#c5a880] text-black font-semibold'
                        : 'bg-white/5 hover:bg-white/10 text-[#d4d4d8] border border-white/5'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
