import React, { useState, useEffect } from 'react';
import {
  Send,
  Users,
  History,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Copy,
  ExternalLink,
  Plus,
  Search,
  Eye,
  ShoppingBag,
  Gift,
  Flame,
  MessageSquare,
  Smartphone,
  Check,
  RotateCw,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  BroadcastCampaign,
  BroadcastSubscriber,
  BroadcastAudience,
  BroadcastTemplate,
  StoreSettings
} from '../../types';
import { triggerHaptic } from '../../lib/telegram';

const PRESET_TEMPLATES: BroadcastTemplate[] = [
  {
    id: 'tpl-1',
    name: '🌟 Новинки распива',
    category: 'Новинки',
    title: 'Анонс: Новые поступления в распиве',
    message_text: `✨ <b>НОВОЕ ПОСТУПЛЕНИЕ СЕЛЕКТИВА</b>\n\nМы пополнили коллекцию легендарными ароматами в распиве от 2 мл:\n\n• <b>Marc-Antoine Barrois Ganymede</b> — от 700 ₽\n• <b>Tom Ford Lost Cherry</b> — от 900 ₽\n• <b>Byredo Bal d’Afrique</b> — от 650 ₽\n• <b>Maison Francis Kurkdjian Baccarat 540</b> — от 1 100 ₽\n\n💧 <i>Только 100% оригинальные флаконы. Идеальный способ познакомиться со шлейфом без покупки целого флакона!</i>`,
    image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80',
    button_text: '🛍 Открыть витрину новинок'
  },
  {
    id: 'tpl-2',
    name: '🔥 Закрытый сейл -15%',
    category: 'Скидки',
    title: 'Закрытая распродажа уикенда',
    message_text: `🔥 <b>ЗАКРЫТЫЙ СЕЙЛ ДЛЯ СВОИХ: -15%</b>\n\nТолько в эти выходные дарим скидку <b>15%</b> на весь каталог селективной парфюмерии!\n\n🏷 Промокод: <code>SELECTIVE15</code>\n\nСкидка применяется автоматически в корзине при оформлении заказа. Успейте забрать любимые ароматы!`,
    image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=80',
    button_text: '🔥 Забрать со скидкой 15%'
  },
  {
    id: 'tpl-3',
    name: '🎁 Подарок к заказу',
    category: 'Подарки',
    title: 'Подарочный атомайзер 2мл',
    message_text: `🎁 <b>ПОДАРОК К КАЖДОМУ ЗАКАЗУ ОТ 4 000 ₽</b>\n\nОформите заказ сегодня и получите <b>дорожный спрей 2 мл</b> одного из наших бестселлеров в подарок!\n\n✨ Атомайзеры из премиального стекла защищают парфюм от выветривания и помещаются в любой карман или сумочку.`,
    image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
    button_text: '🎁 Выбрать парфюм с подарком'
  },
  {
    id: 'tpl-4',
    name: '🍂 Осенняя подборка шлейфа',
    category: 'Коллекции',
    title: 'Топ-5 согревающих ароматов осени',
    message_text: `🍂 <b>УЮТНЫЕ ШЛЕЙФОВЫЕ АРОМАТЫ</b>\n\nСобрали для вас лучшие композиции с нотами амбры, ванили, вишни, кожи и редких древесных пород:\n\n1. <b>Tobacco Vanille</b> — тёплый табачный лист и пряности\n2. <b>Angels’ Share</b> — коньяк, дуб и корица\n3. <b>Black Phantom</b> — ром, кофе и темный шоколад\n\nВыберите идеальный спутник на прохладный сезон!`,
    image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80',
    button_text: '✨ Смотреть подборку'
  }
];

const PRESET_IMAGES = [
  { label: 'Флакон 1 (Селектив)', url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Флакон 2 (Ниша)', url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Флакон 3 (Премиум)', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Флакон 4 (Золото)', url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80' },
];

export const AdminBroadcasts: React.FC = () => {
  const [subTab, setSubTab] = useState<'create' | 'history' | 'subscribers'>('create');
  const [broadcasts, setBroadcasts] = useState<BroadcastCampaign[]>([]);
  const [subscribers, setSubscribers] = useState<BroadcastSubscriber[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState<BroadcastAudience>('all');
  const [messageText, setMessageText] = useState(PRESET_TEMPLATES[0].message_text);
  const [imageUrl, setImageUrl] = useState(PRESET_TEMPLATES[0].image_url || '');
  const [buttonText, setButtonText] = useState(PRESET_TEMPLATES[0].button_text || '');
  const [buttonUrl, setButtonUrl] = useState('');

  // Status & Feedback
  const [isSending, setIsSending] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Subscriber search, filter & modal
  const [searchSubscriber, setSearchSubscriber] = useState('');
  const [subscriberFilter, setSubscriberFilter] = useState<'all' | 'active' | 'inactive' | 'buyers'>('all');
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [newSubTgId, setNewSubTgId] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubUsername, setNewSubUsername] = useState('');
  const [newSubPhone, setNewSubPhone] = useState('');

  // Personal messaging modal state
  const [messagingSubscriber, setMessagingSubscriber] = useState<BroadcastSubscriber | null>(null);
  const [personalMessageText, setPersonalMessageText] = useState('');
  const [isSendingPersonal, setIsSendingPersonal] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resBc, resSub, resSet] = await Promise.all([
        fetch('/api/broadcasts').then(r => r.json()),
        fetch('/api/subscribers').then(r => r.json()),
        fetch('/api/settings').then(r => r.json())
      ]);

      if (resBc.success) setBroadcasts(resBc.broadcasts);
      if (resSub.success) setSubscribers(resSub.subscribers);
      if (resSet.success) setSettings(resSet.settings);
    } catch (e) {
      console.error('Failed to load broadcast data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setActionFeedback({ type, message });
    setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
  };

  const handleApplyTemplate = (tpl: BroadcastTemplate) => {
    triggerHaptic('select');
    setTitle(tpl.title);
    setMessageText(tpl.message_text);
    if (tpl.image_url) setImageUrl(tpl.image_url);
    if (tpl.button_text) setButtonText(tpl.button_text);
    showFeedback(`Шаблон «${tpl.name}» применён`);
  };

  // Test send to Admin Telegram
  const handleSendTest = async () => {
    if (!messageText.trim()) {
      showFeedback('Введите текст рассылки для тестирования', 'error');
      return;
    }

    triggerHaptic('medium');
    setIsTesting(true);

    try {
      const res = await fetch('/api/broadcasts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_text: messageText,
          image_url: imageUrl,
          button_text: buttonText,
          button_url: buttonUrl
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerHaptic('success');
        showFeedback(data.message || 'Тестовое сообщение успешно отправлено администратору в Telegram!');
      } else {
        triggerHaptic('error');
        showFeedback(data.error || 'Ошибка отправки тестового сообщения', 'error');
      }
    } catch (e: any) {
      showFeedback(e.message || 'Ошибка сети', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // Launch broadcast
  const handleLaunchBroadcast = async (sendNow = true) => {
    if (!messageText.trim()) {
      showFeedback('Введите текст сообщения для рассылки', 'error');
      return;
    }

    const campaignTitle = title.trim() || `Рассылка от ${new Date().toLocaleDateString('ru-RU')}`;

    if (sendNow) {
      const confirmed = window.confirm(
        `Запустить рассылку «${campaignTitle}»?\n\nПолучатели: ${getAudienceCount(targetAudience)} чел.\nСообщение будет отправлено всем выбранным контактам в Telegram.`
      );
      if (!confirmed) return;
    }

    triggerHaptic('heavy');
    setIsSending(true);

    try {
      const res = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: campaignTitle,
          target_audience: targetAudience,
          message_text: messageText,
          image_url: imageUrl,
          button_text: buttonText,
          button_url: buttonUrl,
          send_now: sendNow
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerHaptic('success');
        showFeedback(data.message || 'Рассылка успешно запущена!');
        loadData();
        setSubTab('history');
      } else {
        triggerHaptic('error');
        showFeedback(data.error || 'Ошибка создания рассылки', 'error');
      }
    } catch (e: any) {
      showFeedback(e.message || 'Ошибка сети', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteBroadcast = async (id: string) => {
    if (!window.confirm('Удалить эту рассылку из истории?')) return;
    triggerHaptic('light');

    const res = await fetch(`/api/broadcasts/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setBroadcasts(prev => prev.filter(b => b.id !== id));
      showFeedback('Рассылка удалена');
    }
  };

  const handleCloneBroadcast = (bc: BroadcastCampaign) => {
    triggerHaptic('select');
    setTitle(`${bc.title} (Копия)`);
    setTargetAudience(bc.target_audience);
    setMessageText(bc.message_text);
    setImageUrl(bc.image_url || '');
    setButtonText(bc.button_text || '');
    setButtonUrl(bc.button_url || '');
    setSubTab('create');
    showFeedback('Рассылка загружена в редактор');
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTgId || !newSubName) {
      showFeedback('Укажите Telegram ID и имя', 'error');
      return;
    }

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: newSubTgId,
          first_name: newSubName,
          username: newSubUsername,
          phone: newSubPhone
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerHaptic('success');
        showFeedback('Клиент успешно добавлен в базу рассылки!');
        setIsAddSubModalOpen(false);
        setNewSubTgId('');
        setNewSubName('');
        setNewSubUsername('');
        setNewSubPhone('');
        loadData();
      } else {
        showFeedback(data.error || 'Ошибка добавления', 'error');
      }
    } catch (err: any) {
      showFeedback(err.message, 'error');
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!window.confirm('Удалить контакт из базы рассылки?')) return;
    const res = await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setSubscribers(prev => prev.filter(s => s.id !== id));
      showFeedback('Клиент удален из базы');
    }
  };

  const handleSendPersonalMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messagingSubscriber || !personalMessageText.trim()) return;
    setIsSendingPersonal(true);
    triggerHaptic('heavy');
    try {
      const res = await fetch(`/api/subscribers/${messagingSubscriber.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_text: personalMessageText })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerHaptic('success');
        showFeedback(data.message || `Сообщение отправлено клиенту ${messagingSubscriber.first_name}!`);
        setMessagingSubscriber(null);
        setPersonalMessageText('');
      } else {
        triggerHaptic('error');
        showFeedback(data.error || 'Ошибка отправки сообщения', 'error');
      }
    } catch (err: any) {
      showFeedback(err.message || 'Ошибка сети', 'error');
    } finally {
      setIsSendingPersonal(false);
    }
  };

  // Helper counts
  const getAudienceCount = (aud: BroadcastAudience): number => {
    if (aud === 'all') return subscribers.filter(s => s.is_active).length;
    if (aud === 'buyers') return subscribers.filter(s => s.is_active && s.orders_count > 0).length;
    if (aud === 'waitlist') return subscribers.length; // Approximate
    return 1;
  };

  const filteredSubscribers = subscribers.filter(s => {
    const q = searchSubscriber.toLowerCase();
    const matchesQuery =
      s.first_name.toLowerCase().includes(q) ||
      (s.username && s.username.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q)) ||
      s.telegram_id.includes(q);

    if (!matchesQuery) return false;

    if (subscriberFilter === 'active') return s.is_active;
    if (subscriberFilter === 'inactive') return !s.is_active;
    if (subscriberFilter === 'buyers') return s.orders_count > 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-[#c5a880]" />
            <span>Рассылки клиентам в Telegram</span>
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Отправляйте закрытые скидки, анонсы новинок и подарки вашей базе покупателей
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#a1a1aa] hover:text-white transition-all text-xs flex items-center gap-1.5"
            title="Обновить данные"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Обновить</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#242532] border border-white/5">
          <div className="flex items-center justify-between text-[#a1a1aa] mb-1">
            <span className="text-[11px] font-medium">База подписчиков</span>
            <Users className="w-4 h-4 text-[#c5a880]" />
          </div>
          <div className="text-xl font-bold text-white">
            {subscribers.length} <span className="text-xs font-normal text-[#a1a1aa]">чел.</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#242532] border border-white/5">
          <div className="flex items-center justify-between text-[#a1a1aa] mb-1">
            <span className="text-[11px] font-medium">Покупатели</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {subscribers.filter(s => s.orders_count > 0).length} <span className="text-xs font-normal text-[#a1a1aa]">клиентов</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#242532] border border-white/5">
          <div className="flex items-center justify-between text-[#a1a1aa] mb-1">
            <span className="text-[11px] font-medium">Отправлено рассылок</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {broadcasts.filter(b => b.status === 'completed').length}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#242532] border border-white/5">
          <div className="flex items-center justify-between text-[#a1a1aa] mb-1">
            <span className="text-[11px] font-medium">Telegram бот</span>
            <Smartphone className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xs font-semibold text-white truncate">
            {settings?.telegram_connected ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Бот активен
              </span>
            ) : (
              <span className="text-amber-400">Требует токен</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 transition-all ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            triggerHaptic('select');
            setSubTab('create');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            subTab === 'create'
              ? 'bg-[#c5a880] text-black shadow-md shadow-[#c5a880]/15'
              : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Конструктор рассылки</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('select');
            setSubTab('history');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 relative ${
            subTab === 'history'
              ? 'bg-[#c5a880] text-black shadow-md shadow-[#c5a880]/15'
              : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>История кампаний ({broadcasts.length})</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('select');
            setSubTab('subscribers');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            subTab === 'subscribers'
              ? 'bg-[#c5a880] text-black shadow-md shadow-[#c5a880]/15'
              : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>База клиентов ({subscribers.length})</span>
        </button>
      </div>

      {/* TAB 1: CREATE / BUILDER */}
      {subTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Builder Form (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1-Click Templates Carousel */}
            <div className="p-4 rounded-2xl bg-[#242532] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>Готовые шаблоны в 1 клик</span>
                </span>
                <span className="text-[10px] text-[#71717a]">Нажмите для быстрой вставки</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#c5a880]/10 hover:border-[#c5a880]/30 transition-all text-left group"
                  >
                    <div className="text-[11px] font-medium text-white group-hover:text-[#c5a880] truncate">
                      {tpl.name}
                    </div>
                    <div className="text-[9px] text-[#71717a] mt-0.5">{tpl.category}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Form Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#242532] border border-white/5 space-y-4">
              {/* Campaign Title */}
              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">
                  Название кампании (для вас):
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Например: Закрытая скидка 15% на выходные"
                  className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">
                  Целевая аудитория:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetAudience('all')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      targetAudience === 'all'
                        ? 'border-[#c5a880] bg-[#c5a880]/10 text-white font-medium'
                        : 'border-white/5 bg-[#1e2029] text-[#a1a1aa] hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>Все клиенты</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white">
                        {getAudienceCount('all')}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#71717a] mt-0.5">Вся база Telegram</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience('buyers')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      targetAudience === 'buyers'
                        ? 'border-[#c5a880] bg-[#c5a880]/10 text-white font-medium'
                        : 'border-white/5 bg-[#1e2029] text-[#a1a1aa] hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>Покупатели</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white">
                        {getAudienceCount('buyers')}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#71717a] mt-0.5">Сделали заказы</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience('waitlist')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      targetAudience === 'waitlist'
                        ? 'border-[#c5a880] bg-[#c5a880]/10 text-white font-medium'
                        : 'border-white/5 bg-[#1e2029] text-[#a1a1aa] hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>Лист ожидания</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white">
                        {getAudienceCount('waitlist')}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#71717a] mt-0.5">Ждущие ароматы</div>
                  </button>
                </div>
              </div>

              {/* Message Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-[#a1a1aa]">
                    Текст сообщения (HTML поддерживается):
                  </label>
                  <span className="text-[10px] text-[#71717a]">
                    Поддерживает &lt;b&gt;, &lt;i&gt;, &lt;code&gt;
                  </span>
                </div>
                <textarea
                  rows={7}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Введите текст рассылки..."
                  className="w-full bg-[#1e2029] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-[#71717a] font-mono focus:outline-none focus:border-[#c5a880] leading-relaxed"
                />
              </div>

              {/* Banner Image URL */}
              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">
                  Ссылка на изображение (баннер):
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
                />

                {/* Preset image chips */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-1">
                  <span className="text-[10px] text-[#71717a] shrink-0">Пресеты:</span>
                  {PRESET_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImageUrl(img.url)}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-[#a1a1aa] hover:text-white shrink-0"
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inline Action Button (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">
                    Текст кнопки в Telegram:
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={e => setButtonText(e.target.value)}
                    placeholder="Например: 🛍 Открыть витрину"
                    className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">
                    Ссылка кнопки (URL):
                  </label>
                  <input
                    type="text"
                    value={buttonUrl}
                    onChange={e => setButtonUrl(e.target.value)}
                    placeholder="По умолчанию ссылка на магазин"
                    className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  disabled={isTesting || !messageText.trim()}
                  onClick={handleSendTest}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-medium text-white flex items-center justify-center gap-2 transition-all"
                >
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isTesting ? 'Отправка теста...' : 'Тест себе в Telegram'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSending || !messageText.trim()}
                  onClick={() => handleLaunchBroadcast(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-medium text-white flex items-center justify-center gap-2 transition-all"
                >
                  <span>Сохранить черновик</span>
                </button>

                <button
                  type="button"
                  disabled={isSending || !messageText.trim()}
                  onClick={() => handleLaunchBroadcast(true)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#c5a880] hover:bg-[#d8bf9b] disabled:opacity-40 text-black text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#c5a880]/15 transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Рассылка выполняется...' : `Запустить рассылку (${getAudienceCount(targetAudience)} чел.)`}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Live Telegram Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-28 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#229ED9]" />
                  <span>Telegram Live Preview</span>
                </span>
                <span className="text-[10px] text-[#229ED9] bg-[#229ED9]/10 px-2 py-0.5 rounded-full font-medium">
                  Как увидят клиенты
                </span>
              </div>

              {/* Telegram App Container Simulation */}
              <div className="rounded-2xl bg-[#17212b] border border-[#242f3d] p-3.5 shadow-2xl overflow-hidden font-sans">
                {/* Telegram Bot Header */}
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#242f3d]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#c5a880] to-[#e4d4c0] flex items-center justify-center text-black font-bold text-xs shadow">
                    PS
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>PARFUM.SELECTIVE</span>
                      <span className="text-[9px] text-[#6c7883] font-normal">bot</span>
                    </div>
                    <div className="text-[10px] text-[#6c7883]">селективная парфюмерия</div>
                  </div>
                </div>

                {/* Telegram Message Bubble */}
                <div className="mt-3.5 max-w-[95%] bg-[#182533] rounded-2xl rounded-tl-sm p-3 border border-[#2b394a] space-y-2.5 shadow-md">
                  {/* Photo Banner if provided */}
                  {imageUrl && (
                    <div className="rounded-xl overflow-hidden bg-black/40 border border-white/5 aspect-video relative">
                      <img
                        src={imageUrl}
                        alt="Broadcast banner"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Message Content (Formatted HTML Rendering) */}
                  <div
                    className="text-xs text-[#e4ecf2] whitespace-pre-wrap leading-relaxed space-y-1 select-text"
                    dangerouslySetInnerHTML={{
                      __html: messageText || '<i>Введите текст сообщения...</i>'
                    }}
                  />

                  {/* Timestamp & checkmarks */}
                  <div className="flex items-center justify-end gap-1 text-[10px] text-[#6c7883] pt-1">
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <Check className="w-3 h-3 text-[#229ED9]" />
                  </div>
                </div>

                {/* Inline Button (Attached directly beneath bubble) */}
                {buttonText && (
                  <div className="mt-1.5 max-w-[95%]">
                    <div className="w-full py-2.5 px-3 rounded-xl bg-[#2b5278]/60 hover:bg-[#2b5278] border border-[#3b6691]/50 text-center text-xs font-semibold text-[#6ab2f2] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                      <span>{buttonText}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </div>
                  </div>
                )}
              </div>

              {/* Help hint */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-[#a1a1aa] space-y-1">
                <div className="flex items-center gap-1 text-white font-medium text-xs">
                  <Info className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>Совет по рассылкам</span>
                </div>
                <p>
                  Перед массовой отправкой всем клиентам обязательно отправьте себе тест по кнопке <strong>«Тест себе в Telegram»</strong>, чтобы оценить переносы строк и форматирование.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BROADCAST HISTORY */}
      {subTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#a1a1aa]">
              Всего кампаний: <strong>{broadcasts.length}</strong>
            </span>
            <button
              onClick={() => {
                triggerHaptic('select');
                setSubTab('create');
              }}
              className="px-3 py-1.5 rounded-xl bg-[#c5a880] text-black font-semibold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать новую</span>
            </button>
          </div>

          {broadcasts.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#242532] border border-white/5 text-center text-xs text-[#71717a]">
              История рассылок пуста. Создайте первую рассылку во вкладке «Конструктор рассылки».
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map(bc => {
                const isComplete = bc.status === 'completed';
                const isDraft = bc.status === 'draft';
                const isSendingNow = bc.status === 'sending';
                const isFailed = bc.status === 'failed';

                return (
                  <div
                    key={bc.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#242532] border border-white/5 space-y-3 hover:border-white/10 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isComplete
                              ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                              : isSendingNow
                              ? 'bg-amber-400 animate-ping'
                              : isDraft
                              ? 'bg-[#71717a]'
                              : 'bg-rose-400'
                          }`}
                        />
                        <h4 className="text-sm font-bold text-white">{bc.title}</h4>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[#a1a1aa] text-[11px]">
                          {bc.target_audience === 'all'
                            ? 'Все клиенты'
                            : bc.target_audience === 'buyers'
                            ? 'Покупатели'
                            : 'Лист ожидания'}
                        </span>
                        <span className="text-[11px] text-[#71717a]">
                          {new Date(bc.sent_at || bc.created_at).toLocaleString('ru-RU')}
                        </span>
                      </div>
                    </div>

                    {/* Stats & Message Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div className="md:col-span-2 p-3 rounded-xl bg-[#1e2029] border border-white/5 text-xs text-[#d4d4d8] max-h-24 overflow-y-auto font-mono text-[11px]">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: bc.message_text.substring(0, 250) + (bc.message_text.length > 250 ? '...' : '')
                          }}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-[#1e2029] border border-white/5 flex flex-col justify-between text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[#a1a1aa]">Статус:</span>
                          <span
                            className={`font-semibold ${
                              isComplete
                                ? 'text-emerald-400'
                                : isSendingNow
                                ? 'text-amber-400'
                                : isDraft
                                ? 'text-[#a1a1aa]'
                                : 'text-rose-400'
                            }`}
                          >
                            {isComplete ? 'Доставлено' : isSendingNow ? 'Отправляется' : isDraft ? 'Черновик' : 'Ошибка'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#a1a1aa]">Успешно:</span>
                          <span className="font-bold text-white">
                            {bc.sent_count} / {bc.total_recipients || bc.sent_count}
                          </span>
                        </div>

                        {bc.button_text && (
                          <div className="text-[10px] text-[#c5a880] truncate">
                            Кнопка: {bc.button_text}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => handleCloneBroadcast(bc)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#a1a1aa] hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Копировать в редактор</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteBroadcast(bc.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-[#71717a] hover:text-rose-400 transition-all"
                        title="Удалить"
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
      )}

      {/* TAB 3: SUBSCRIBERS / CUSTOMERS LIST */}
      {subTab === 'subscribers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
              <input
                type="text"
                value={searchSubscriber}
                onChange={e => setSearchSubscriber(e.target.value)}
                placeholder="Поиск по имени, @username, телефону..."
                className="w-full pl-9 pr-3 py-2 bg-[#242532] border border-white/5 rounded-xl text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <button
              onClick={() => {
                triggerHaptic('select');
                setIsAddSubModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#c5a880] text-black font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#c5a880]/15"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить контакт</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <button
              type="button"
              onClick={() => setSubscriberFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                subscriberFilter === 'all'
                  ? 'bg-white/10 text-white font-semibold border border-white/20'
                  : 'bg-white/5 text-[#a1a1aa] hover:text-white'
              }`}
            >
              Все клиенты ({subscribers.length})
            </button>
            <button
              type="button"
              onClick={() => setSubscriberFilter('active')}
              className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                subscriberFilter === 'active'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                  : 'bg-white/5 text-[#a1a1aa] hover:text-white'
              }`}
            >
              🟢 Активные ({subscribers.filter(s => s.is_active).length})
            </button>
            <button
              type="button"
              onClick={() => setSubscriberFilter('buyers')}
              className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                subscriberFilter === 'buyers'
                  ? 'bg-[#c5a880]/20 text-[#d8bf9b] font-semibold border border-[#c5a880]/30'
                  : 'bg-white/5 text-[#a1a1aa] hover:text-white'
              }`}
            >
              🛍 Покупатели ({subscribers.filter(s => s.orders_count > 0).length})
            </button>
            <button
              type="button"
              onClick={() => setSubscriberFilter('inactive')}
              className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                subscriberFilter === 'inactive'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                  : 'bg-white/5 text-[#a1a1aa] hover:text-white'
              }`}
            >
              ⚫ Неактивные ({subscribers.filter(s => !s.is_active).length})
            </button>
          </div>

          {filteredSubscribers.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#242532] border border-white/5 text-center text-xs text-[#71717a]">
              {searchSubscriber ? 'Ничего не найдено по запросу' : 'База клиентов пока пуста'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSubscribers.map(sub => {
                const regDate = sub.created_at ? new Date(sub.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Н/Д';
                const isActive = sub.is_active !== false;

                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl bg-[#242532] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-white truncate">
                          {sub.first_name} {sub.last_name || ''}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 shrink-0 ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-[#71717a]'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-[#71717a]'}`} />
                          {isActive ? 'Активен' : 'Неактивен'}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#a1a1aa] space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Telegram ID:</span>
                          <code className="text-[#c5a880] font-mono">{sub.telegram_id}</code>
                        </div>

                        {sub.username && (
                          <div className="flex items-center justify-between">
                            <span>Юзернейм:</span>
                            <a
                              href={`https://t.me/${sub.username.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#229ED9] hover:underline font-medium"
                            >
                              @{sub.username.replace('@', '')}
                            </a>
                          </div>
                        )}

                        {sub.phone && (
                          <div className="flex items-center justify-between">
                            <span>Телефон:</span>
                            <span className="text-white font-mono">{sub.phone}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[#71717a] pt-1 border-t border-white/5">
                          <span>Регистрация:</span>
                          <span className="text-white">{regDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <div>
                        Заказов: <strong className="text-white">{sub.orders_count}</strong>
                        {sub.total_spent > 0 && (
                          <span className="ml-1 text-emerald-400 font-semibold">
                            ({sub.total_spent.toLocaleString('ru-RU')} ₽)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('select');
                            setMessagingSubscriber(sub);
                            setPersonalMessageText(`✨ ${sub.first_name}, здравствуйте!\n\nС Днем рождения! 🎉 Дарим вам персональную скидку 10% на любой селективный аромат в нашем каталоге по промокоду BIRTHDAY10. Ждем вас! 🤍`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] text-[11px] font-semibold flex items-center gap-1 transition-all"
                          title="Написать личное сообщение в Telegram"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Написать</span>
                        </button>

                        <button
                          onClick={() => handleDeleteSubscriber(sub.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-[#71717a] hover:text-rose-400 transition-colors"
                          title="Удалить контакт"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD SUBSCRIBER */}
      {isAddSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#242532] border border-white/10 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#c5a880]" />
                <span>Добавить контакт в базу рассылки</span>
              </h3>
              <button
                onClick={() => setIsAddSubModalOpen(false)}
                className="text-[#71717a] hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#a1a1aa] mb-1 font-medium">
                  Telegram Chat ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSubTgId}
                  onChange={e => setNewSubTgId(e.target.value)}
                  placeholder="Например: 123456789 или @username"
                  className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="block text-[#a1a1aa] mb-1 font-medium">
                  Имя клиента <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                  placeholder="Иван"
                  className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="block text-[#a1a1aa] mb-1 font-medium">
                  Telegram @username (опционально)
                </label>
                <input
                  type="text"
                  value={newSubUsername}
                  onChange={e => setNewSubUsername(e.target.value)}
                  placeholder="@username"
                  className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="block text-[#a1a1aa] mb-1 font-medium">
                  Телефон (опционально)
                </label>
                <input
                  type="tel"
                  value={newSubPhone}
                  onChange={e => setNewSubPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full bg-[#1e2029] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#a1a1aa] font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#c5a880] hover:bg-[#d8bf9b] text-black font-bold"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEND PERSONAL MESSAGE */}
      {messagingSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#242532] border border-white/10 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#229ED9]" />
                <span>Написать клиенту: {messagingSubscriber.first_name}</span>
              </h3>
              <button
                onClick={() => setMessagingSubscriber(null)}
                className="text-[#71717a] hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendPersonalMessage} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-white/5 text-[11px] text-[#a1a1aa] space-y-1">
                <div>Получатель: <strong className="text-white">{messagingSubscriber.first_name} {messagingSubscriber.last_name || ''}</strong></div>
                <div>Telegram ID: <code className="text-[#c5a880] font-mono">{messagingSubscriber.telegram_id}</code></div>
                {messagingSubscriber.username && (
                  <div>Юзернейм: <span className="text-[#229ED9]">@{messagingSubscriber.username.replace('@', '')}</span></div>
                )}
              </div>

              <div>
                <label className="block text-[#a1a1aa] mb-1 font-medium">
                  Текст личного сообщения (поддерживает HTML):
                </label>
                <textarea
                  rows={6}
                  required
                  value={personalMessageText}
                  onChange={e => setPersonalMessageText(e.target.value)}
                  placeholder="Введите текст сообщения (например: С Днем рождения, дарим скидку 10%!)..."
                  className="w-full bg-[#1e2029] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-[#71717a] font-mono focus:outline-none focus:border-[#c5a880] leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMessagingSubscriber(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSendingPersonal || !personalMessageText.trim()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#229ED9] hover:bg-[#1d8abf] disabled:opacity-40 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#229ED9]/20 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingPersonal ? 'Отправка...' : 'Отправить в Telegram'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
