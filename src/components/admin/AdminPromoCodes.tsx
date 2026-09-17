import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Percent,
  DollarSign,
  UserCheck,
  Globe,
  Lock,
  Search,
  AlertCircle,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { PromoCode, PromoCodeType, DiscountType } from '../../types';
import { triggerHaptic } from '../../lib/telegram';

export const AdminPromoCodes: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'general' | 'unique' | 'registration'>('all');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Modal State for creating promo code
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [code, setCode] = useState('');
  const [type, setType] = useState<PromoCodeType>('general');
  const [discountType, setDiscountType] = useState<DiscountType>('percent');
  const [discountValue, setDiscountValue] = useState<string>('15');
  const [minOrderAmount, setMinOrderAmount] = useState<string>('0');
  const [expiresAt, setExpiresAt] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [maxUses, setMaxUses] = useState<string>('100');
  const [assignedTelegramId, setAssignedTelegramId] = useState('');
  const [assignedName, setAssignedName] = useState('');

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const loadPromoCodes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/promo-codes');
      const data = await res.json();
      if (res.ok && data.success) {
        setPromoCodes(data.promoCodes);
      }
    } catch (err) {
      console.error('Failed to load promo codes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      showFeedback('Укажите промокод и значение скидки', 'error');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      const payload = {
        code: code.trim(),
        type,
        discount_type: discountType,
        discount_value: Number(discountValue) || 0,
        min_order_amount: Number(minOrderAmount) || 0,
        expires_at: expiresAt ? new Date(expiresAt + 'T23:59:59').toISOString() : undefined,
        max_uses: Number(maxUses) || 0,
        assigned_to_telegram_id: assignedTelegramId.trim() || undefined,
        assigned_to_name: assignedName.trim() || undefined,
        is_active: true
      };

      const res = await fetch('/api/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        triggerHaptic('success');
        showFeedback(`Промокод "${code.toUpperCase()}" успешно создан!`);
        setIsModalOpen(false);
        // Reset form
        setCode('');
        setType('general');
        setDiscountType('percent');
        setDiscountValue('15');
        setMinOrderAmount('0');
        setMaxUses('100');
        setAssignedTelegramId('');
        setAssignedName('');
        loadPromoCodes();
      } else {
        triggerHaptic('error');
        showFeedback(data.error || 'Ошибка создания промокода', 'error');
      }
    } catch (err: any) {
      showFeedback(err.message || 'Ошибка сети', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (promo: PromoCode) => {
    triggerHaptic('light');
    try {
      const res = await fetch(`/api/promo-codes/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !promo.is_active })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPromoCodes(promoCodes.map(p => (p.id === promo.id ? data.promoCode : p)));
      }
    } catch (err) {
      console.error('Failed to toggle promo code:', err);
    }
  };

  const handleDelete = async (id: string, codeStr: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить промокод "${codeStr}"?`)) return;
    triggerHaptic('medium');
    try {
      const res = await fetch(`/api/promo-codes/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerHaptic('success');
        setPromoCodes(promoCodes.filter(p => p.id !== id));
        showFeedback('Промокод удален');
      }
    } catch (err) {
      console.error('Failed to delete promo code:', err);
    }
  };

  const handleCopyCode = (promo: PromoCode) => {
    navigator.clipboard.writeText(promo.code);
    setCopiedCodeId(promo.id);
    triggerHaptic('light');
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const filteredPromoCodes = promoCodes.filter(p => {
    const matchesSearch = p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.assigned_to_name && p.assigned_to_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.assigned_to_telegram_id && p.assigned_to_telegram_id.includes(searchQuery));

    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#c5a880]" />
            <span>Управление промокодами и скидками</span>
          </h2>
          <p className="text-xs text-[#71717a] mt-0.5">
            Создавайте общие, уникальные и поздравительные промокоды с ограничением по сроку и сумме
          </p>
        </div>

        <button
          onClick={() => {
            triggerHaptic('select');
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#c5a880] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#c5a880]/20 hover:bg-[#b59870] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Создать промокод</span>
        </button>
      </div>

      {/* Feedback Notification */}
      {actionFeedback && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-fadeIn ${actionFeedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
          {actionFeedback.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по коду или имени клиента..."
            className="w-full pl-9 pr-3 py-2 bg-[#242532] border border-white/5 rounded-xl text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${filterType === 'all' ? 'bg-white/10 text-white font-semibold border border-white/20' : 'bg-white/5 text-[#a1a1aa] hover:text-white'}`}
          >
            Все ({promoCodes.length})
          </button>
          <button
            onClick={() => setFilterType('general')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${filterType === 'general' ? 'bg-[#c5a880]/20 text-[#d8bf9b] font-semibold border border-[#c5a880]/30' : 'bg-white/5 text-[#a1a1aa] hover:text-white'}`}
          >
            🌐 Общие ({promoCodes.filter(p => p.type === 'general').length})
          </button>
          <button
            onClick={() => setFilterType('unique')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${filterType === 'unique' ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30' : 'bg-white/5 text-[#a1a1aa] hover:text-white'}`}
          >
            👤 Уникальные ({promoCodes.filter(p => p.type === 'unique').length})
          </button>
          <button
            onClick={() => setFilterType('registration')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${filterType === 'registration' ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30' : 'bg-white/5 text-[#a1a1aa] hover:text-white'}`}
          >
            🎁 За регистрацию ({promoCodes.filter(p => p.type === 'registration').length})
          </button>
        </div>
      </div>

      {/* Promo Codes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[#71717a]">
          <Loader2 className="w-6 h-6 animate-spin text-[#c5a880]" />
        </div>
      ) : filteredPromoCodes.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#242532] border border-white/5 text-center text-xs text-[#71717a]">
          {searchQuery ? 'Не найдено промокодов по вашему запросу' : 'Список промокодов пуст'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPromoCodes.map(promo => {
            const isExpired = promo.expires_at ? new Date(promo.expires_at).getTime() < Date.now() : false;
            const expiryStr = promo.expires_at ? new Date(promo.expires_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Бессрочно';

            return (
              <div
                key={promo.id}
                className={`p-4 rounded-2xl bg-[#242532] border transition-all flex flex-col justify-between space-y-3 relative ${
                  !promo.is_active || isExpired ? 'opacity-60 border-white/5' : 'border-white/10 hover:border-white/20 shadow-lg shadow-black/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold tracking-wider text-white px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                        {promo.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(promo)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#a1a1aa] hover:text-white transition-colors"
                        title="Копировать код"
                      >
                        {copiedCodeId === promo.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      promo.type === 'general' ? 'bg-[#c5a880]/15 text-[#d8bf9b]' : promo.type === 'unique' ? 'bg-purple-500/15 text-purple-300' : 'bg-emerald-500/15 text-emerald-300'
                    }`}>
                      {promo.type === 'general' ? '🌐 Общий' : promo.type === 'unique' ? '👤 Уникальный' : '🎁 Регистрация'}
                    </span>
                  </div>

                  {/* Discount & Details */}
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-xl font-extrabold text-[#c5a880]">
                      {promo.discount_type === 'percent' ? `-${promo.discount_value}%` : `-${promo.discount_value.toLocaleString('ru-RU')} ₽`}
                    </span>
                    <span className="text-[11px] text-[#71717a]">
                      {promo.discount_type === 'percent' ? 'скидка на заказ' : 'фиксированная скидка'}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#a1a1aa] space-y-1 pt-1 border-t border-white/5">
                    {promo.min_order_amount ? (
                      <div className="flex items-center justify-between">
                        <span>Мин. сумма заказа:</span>
                        <span className="text-white font-medium">{promo.min_order_amount.toLocaleString('ru-RU')} ₽</span>
                      </div>
                    ) : null}

                    {promo.assigned_to_name && (
                      <div className="flex items-center justify-between">
                        <span>Клиент:</span>
                        <span className="text-emerald-400 font-semibold">{promo.assigned_to_name}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span>Использований:</span>
                      <span className="text-white font-medium">
                        {promo.times_used} {promo.max_uses ? `/ ${promo.max_uses}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Срок действия:</span>
                      <span className={`${isExpired ? 'text-rose-400 font-bold' : 'text-white'}`}>
                        {isExpired ? '⚠️ Истек (' + expiryStr + ')' : expiryStr}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={promo.is_active}
                      onChange={() => handleToggleActive(promo)}
                      className="w-3.5 h-3.5 accent-[#c5a880] rounded cursor-pointer"
                    />
                    <span className={`text-[11px] font-medium ${promo.is_active ? 'text-emerald-400' : 'text-[#71717a]'}`}>
                      {promo.is_active ? 'Активен' : 'Отключен'}
                    </span>
                  </label>

                  <button
                    onClick={() => handleDelete(promo.id, promo.code)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-[#71717a] hover:text-rose-400 transition-colors"
                    title="Удалить промокод"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CREATE PROMO CODE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#242532] border border-white/10 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#c5a880]" />
                <span>Создание нового промокода</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#71717a] hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePromoCode} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#a1a1aa] mb-1 font-medium">Код промокода *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="например: SELECTIVE20 или BDAY-ANNA"
                    className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#71717a] font-mono tracking-wider uppercase focus:outline-none focus:border-[#c5a880]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const randomCode = 'PROMO-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                      setCode(randomCode);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[#c5a880]"
                  >
                    Случайный
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] mb-1 font-medium">Тип промокода</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as PromoCodeType)}
                    className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                  >
                    <option value="general">🌐 Общий (для всех)</option>
                    <option value="unique">👤 Уникальный (персональный)</option>
                    <option value="registration">🎁 За регистрацию</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#a1a1aa] mb-1 font-medium">Тип скидки</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as DiscountType)}
                    className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                  >
                    <option value="percent">Процент (%)</option>
                    <option value="fixed">Фиксированная (₽)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] mb-1 font-medium">
                    Размер скидки ({discountType === 'percent' ? '%' : '₽'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={discountType === 'percent' ? '100' : '100000'}
                    value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label className="block text-[#a1a1aa] mb-1 font-medium">Мин. сумма заказа (₽)</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={e => setMinOrderAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] mb-1 font-medium">Срок действия (дата)</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={e => setExpiresAt(e.target.value)}
                    className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label className="block text-[#a1a1aa] mb-1 font-medium">Лимит использований</label>
                  <input
                    type="number"
                    min="0"
                    value={maxUses}
                    onChange={e => setMaxUses(e.target.value)}
                    placeholder="0 - безлимит"
                    className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              {(type === 'unique' || type === 'registration') && (
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <div>
                    <label className="block text-[#a1a1aa] mb-1 font-medium">Имя клиента (для кого)</label>
                    <input
                      type="text"
                      value={assignedName}
                      onChange={e => setAssignedName(e.target.value)}
                      placeholder="например: Люба"
                      className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a1a1aa] mb-1 font-medium">Telegram ID клиента (опционально)</label>
                    <input
                      type="text"
                      value={assignedTelegramId}
                      onChange={e => setAssignedTelegramId(e.target.value)}
                      placeholder="например: 123456789"
                      className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !code.trim()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#c5a880] hover:bg-[#b59870] disabled:opacity-40 text-black font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#c5a880]/20 transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Создать промокод</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
