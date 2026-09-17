import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Trash2,
  Send,
  Phone,
  Search,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Check,
  Filter
} from 'lucide-react';
import { StockNotificationRequest } from '../../types';
import { triggerHaptic } from '../../lib/telegram';

export const AdminStockRequests: React.FC = () => {
  const [requests, setRequests] = useState<StockNotificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'notified'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stock-notifications');
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (e) {
      console.error('Failed to load stock requests:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleToggleStatus = async (request: StockNotificationRequest) => {
    const nextStatus = request.status === 'pending' ? 'notified' : 'pending';
    setActionLoadingId(request.id);
    triggerHaptic('medium');

    try {
      const res = await fetch(`/api/stock-notifications/${request.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.map(r => (r.id === request.id ? data.request : r)));
        triggerHaptic('success');
      }
    } catch (e) {
      console.error(e);
      triggerHaptic('error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту заявку из листа ожидания?')) return;
    setActionLoadingId(id);
    triggerHaptic('medium');

    try {
      const res = await fetch(`/api/stock-notifications/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.filter(r => r.id !== id));
        triggerHaptic('success');
      }
    } catch (e) {
      console.error(e);
      triggerHaptic('error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = requests.filter(r => {
    const matchesSearch =
      r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customer_contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#242532] border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#c5a880]/15 text-[#c5a880] border border-[#c5a880]/30">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">Лист ожидания и запросы на наличие</h2>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Клиенты, запросившие уведомление при поступлении закончившейся парфюмерии
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            Ожидают связи: <strong>{pendingCount}</strong>
          </span>
          <button
            onClick={() => {
              triggerHaptic('light');
              fetchRequests();
            }}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors"
            title="Обновить список"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по клиенту, контакту, аромату или бренду..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#242532] border border-white/10 focus:border-[#c5a880] rounded-xl text-xs sm:text-sm text-white placeholder-white/30 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#242532] p-1 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => {
              triggerHaptic('select');
              setStatusFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-[#c5a880] text-black font-semibold shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            Все ({requests.length})
          </button>
          <button
            onClick={() => {
              triggerHaptic('select');
              setStatusFilter('pending');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-black font-semibold shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>В ожидании ({pendingCount})</span>
          </button>
          <button
            onClick={() => {
              triggerHaptic('select');
              setStatusFilter('notified');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              statusFilter === 'notified'
                ? 'bg-emerald-500 text-black font-semibold shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Оповещены ({requests.length - pendingCount})</span>
          </button>
        </div>
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-[#242532]/40 rounded-2xl border border-white/5 space-y-3">
          <Bell className="w-10 h-10 mx-auto text-white/20" />
          <p className="text-sm text-[#a1a1aa]">Запросов на уведомление не найдено</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#c5a880] hover:underline"
            >
              Сбросить поисковый запрос
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filtered.map(req => {
            const isPending = req.status === 'pending';
            const isTelegram =
              req.customer_contact.startsWith('@') ||
              req.customer_contact.toLowerCase().includes('t.me');
            const cleanTg = req.customer_contact.replace('@', '').replace('https://t.me/', '');

            return (
              <div
                key={req.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 ${
                  isPending
                    ? 'bg-[#242532] border-white/10 hover:border-amber-500/40 shadow-md shadow-black/20'
                    : 'bg-[#1e1f29]/70 border-white/5 opacity-75 hover:opacity-100'
                }`}
              >
                <div>
                  {/* Status & Date */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPending
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isPending ? (
                        <>
                          <Clock className="w-2.5 h-2.5" />
                          Ожидает поступления
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Оповещён
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-[#a1a1aa]">
                      {new Date(req.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Perfume requested */}
                  <div className="p-2.5 rounded-xl bg-black/25 border border-white/5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#c5a880] uppercase tracking-wider truncate">
                        {req.brand}
                      </p>
                      <h4 className="text-sm font-semibold text-white truncate">
                        {req.product_name}
                      </h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-semibold text-white">
                        {req.volume}
                      </span>
                      <p className="text-[11px] text-[#a1a1aa] mt-0.5">
                        {req.price.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-white/90">
                      <span className="text-[#a1a1aa]">Имя клиента:</span>
                      <span className="font-medium text-white">{req.customer_name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#a1a1aa]">Контакт:</span>
                      <span className="font-medium text-[#c5a880] flex items-center gap-1">
                        {isTelegram ? (
                          <a
                            href={`https://t.me/${cleanTg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            <Send className="w-3 h-3 text-sky-400" />
                            {req.customer_contact}
                            <ExternalLink className="w-2.5 h-2.5 text-white/40" />
                          </a>
                        ) : (
                          <a
                            href={`tel:${req.customer_contact.replace(/[^\d+]/g, '')}`}
                            className="hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-emerald-400" />
                            {req.customer_contact}
                          </a>
                        )}
                      </span>
                    </div>

                    {req.comment && (
                      <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/5 text-[#d4d4d8] italic text-[11px]">
                        "{req.comment}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleToggleStatus(req)}
                    disabled={actionLoadingId === req.id}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      isPending
                        ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isPending ? 'Отметить оповещённым' : 'Вернуть в ожидание'}</span>
                  </button>

                  {isTelegram && (
                    <a
                      href={`https://t.me/${cleanTg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 transition-colors"
                      title="Написать в Telegram"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => handleDelete(req.id)}
                    disabled={actionLoadingId === req.id}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors"
                    title="Удалить заявку"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
