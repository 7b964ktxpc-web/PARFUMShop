import React, { useState, useEffect } from 'react';
import { StoreSettings } from '../../types';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Users,
  User,
  BellRing,
  Bot,
  Layers,
  Copy,
  Check,
  Radio,
  ShieldCheck,
  UserPlus,
  Trash2
} from 'lucide-react';
import { getTelegramUser, isInsideTelegram, triggerHaptic } from '../../lib/telegram';

interface AdminNotificationsProps {
  settings: StoreSettings | null;
  onRefresh: () => void;
  onUpdateSettings: (settings: Partial<StoreSettings>) => Promise<void>;
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({
  settings,
  onRefresh,
  onUpdateSettings
}) => {
  const tgUser = getTelegramUser();
  const inTg = isInsideTelegram();

  // Settings State
  const [botToken, setBotToken] = useState(settings?.telegram_bot_token || '');
  const [botUsername, setBotUsername] = useState(settings?.telegram_bot_username || 'PARFUM_SELECTIVEBOT');
  const [recipientId, setRecipientId] = useState(settings?.telegram_recipient_id || '');
  const [managerName, setManagerName] = useState(settings?.telegram_manager_name || '');
  const [groupId, setGroupId] = useState(settings?.telegram_group_id || '');
  const [groupTitle, setGroupTitle] = useState(settings?.telegram_group_title || '');
  const [notifyManager, setNotifyManager] = useState(settings?.telegram_notify_manager !== false);
  const [notifyGroup, setNotifyGroup] = useState(settings?.telegram_notify_group !== false);
  const [notifyWaitlist, setNotifyWaitlist] = useState(settings?.telegram_notify_waitlist !== false);
  const [adminIds, setAdminIds] = useState<string[]>(settings?.admin_telegram_ids || []);
  const [newAdminIdInput, setNewAdminIdInput] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; target?: string } | null>(null);
  const [testingTarget, setTestingTarget] = useState<'manager' | 'group' | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Sync state if settings prop changes
  useEffect(() => {
    if (settings) {
      setBotToken(settings.telegram_bot_token || '');
      setBotUsername(settings.telegram_bot_username || 'PARFUM_SELECTIVEBOT');
      setRecipientId(settings.telegram_recipient_id || '');
      setManagerName(settings.telegram_manager_name || '');
      setGroupId(settings.telegram_group_id || '');
      setGroupTitle(settings.telegram_group_title || '');
      setNotifyManager(settings.telegram_notify_manager !== false);
      setNotifyGroup(settings.telegram_notify_group !== false);
      setNotifyWaitlist(settings.telegram_notify_waitlist !== false);
      setAdminIds(settings.admin_telegram_ids || []);
    }
  }, [settings]);

  const isManagerConnected = Boolean((settings?.telegram_recipient_id || recipientId).trim());
  const isGroupConnected = Boolean((settings?.telegram_group_id || groupId).trim());
  const activeBotName = (botUsername || settings?.telegram_bot_username || 'PARFUM_SELECTIVEBOT').replace('@', '').trim();
  const botDeepLink = `https://t.me/${activeBotName}?start=admin_connect`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    triggerHaptic('light');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddAdminId = () => {
    const trimmed = newAdminIdInput.trim();
    if (!trimmed) return;
    if (!/^\d+$/.test(trimmed)) {
      setTestResult({ success: false, message: 'Telegram ID должен содержать только числовые цифры' });
      triggerHaptic('error');
      return;
    }
    if (adminIds.includes(trimmed)) {
      setTestResult({ success: false, message: 'Этот Telegram ID уже добавлен в список админов' });
      triggerHaptic('error');
      return;
    }
    const updated = [...adminIds, trimmed];
    setAdminIds(updated);
    setNewAdminIdInput('');
    setTestResult({ success: true, message: `Администратор с ID ${trimmed} добавлен в список (нажмите "Сохранить все настройки")` });
    triggerHaptic('success');
  };

  const handleRemoveAdminId = (idToRemove: string) => {
    const updated = adminIds.filter(id => id !== idToRemove);
    setAdminIds(updated);
    setTestResult({ success: true, message: `Администратор с ID ${idToRemove} удален (нажмите "Сохранить все настройки")` });
    triggerHaptic('medium');
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    triggerHaptic('medium');
    try {
      await onUpdateSettings({
        telegram_bot_token: botToken.trim() || undefined,
        telegram_bot_username: activeBotName || 'PARFUM_SELECTIVEBOT',
        telegram_recipient_id: recipientId.trim() || undefined,
        telegram_manager_name: managerName.trim() || undefined,
        telegram_group_id: groupId.trim() || undefined,
        telegram_group_title: groupTitle.trim() || undefined,
        telegram_notify_manager: notifyManager,
        telegram_notify_group: notifyGroup,
        telegram_notify_waitlist: notifyWaitlist,
        admin_telegram_ids: adminIds
      });
      setTestResult({
        success: true,
        message: 'Настройки уведомлений и список администраторов успешно сохранены'
      });
      onRefresh();
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Ошибка сохранения' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectCurrentTgUser = async () => {
    if (!tgUser?.id) return;
    triggerHaptic('success');
    const newId = String(tgUser.id);
    const fullName = `${tgUser.first_name} ${tgUser.last_name || ''}`.trim();
    setRecipientId(newId);
    setManagerName(fullName);
    await onUpdateSettings({
      telegram_recipient_id: newId,
      telegram_manager_name: fullName,
      telegram_notify_manager: true
    });
    onRefresh();
    setTestResult({
      success: true,
      message: `Ваш личный Telegram ID (${newId}) успешно привязан!`
    });
  };

  const handleSendTestMessage = async (target: 'manager' | 'group') => {
    setTestingTarget(target);
    setTestResult(null);
    triggerHaptic('medium');
    try {
      const targetChatId = target === 'manager'
        ? (recipientId || settings?.telegram_recipient_id)
        : (groupId || settings?.telegram_group_id);

      if (!targetChatId) {
        setTestResult({
          success: false,
          message: target === 'manager'
            ? 'Личный Chat ID менеджера не указан'
            : 'Chat ID группы не указан',
          target
        });
        return;
      }

      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: targetChatId,
          targetType: target
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerHaptic('success');
        setTestResult({
          success: true,
          message: target === 'manager'
            ? 'Тестовое уведомление успешно отправлено в личные сообщения менеджеру!'
            : 'Тестовое уведомление успешно отправлено в группу Telegram!',
          target
        });
      } else {
        triggerHaptic('error');
        setTestResult({
          success: false,
          message: data.error || 'Не удалось отправить. Проверьте правильность токена и Chat ID.',
          target
        });
      }
    } catch (err: any) {
      triggerHaptic('error');
      setTestResult({
        success: false,
        message: err.message || 'Ошибка подключения к серверу',
        target
      });
    } finally {
      setTestingTarget(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
      {/* Bot & Status Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#262835] to-[#1c1d27] border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a880]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#c5a880]/20 text-[#c5a880] text-[10px] font-bold uppercase tracking-wider">
                Telegram Bot
              </span>
              <span className="text-xs text-[#71717a]">•</span>
              <a
                href={`https://t.me/${activeBotName}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#229ED9] hover:underline font-mono inline-flex items-center gap-1 font-semibold"
              >
                @{activeBotName} <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h2 className="font-serif text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-[#c5a880]" />
              Центр уведомлений о заказах
            </h2>
            <p className="text-xs text-[#a1a1aa] mt-1 max-w-xl leading-relaxed">
              Мгновенные оповещения обо всех заказах клиентов с сайта и Telegram Mini App, а также запросах на распив из листа ожидания.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="self-start sm:self-center p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#a1a1aa] hover:text-white border border-white/10 transition-all active:scale-95"
            title="Обновить данные"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Status Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-white/10 relative z-10">
          {/* Manager PM Status */}
          <div className="p-3.5 rounded-xl bg-black/25 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isManagerConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">В личные сообщения</div>
                <div className="text-[11px] text-[#71717a]">
                  {isManagerConnected ? (
                    <span className="text-emerald-400">Подключен (ID: {recipientId})</span>
                  ) : (
                    <span className="text-rose-400">Не настроен</span>
                  )}
                </div>
              </div>
            </div>
            {isManagerConnected && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
            )}
          </div>

          {/* Group Status */}
          <div className="p-3.5 rounded-xl bg-black/25 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isGroupConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">В группу / чат команды</div>
                <div className="text-[11px] text-[#71717a]">
                  {isGroupConnected ? (
                    <span className="text-emerald-400">{groupTitle ? `«${groupTitle}»` : `ID: ${groupId}`}</span>
                  ) : (
                    <span className="text-rose-400">Не настроена</span>
                  )}
                </div>
              </div>
            </div>
            {isGroupConnected && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
            )}
          </div>
        </div>
      </div>

      {/* Test feedback notification */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 animate-in fade-in duration-150 ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          )}
          <span className="flex-1 font-medium">{testResult.message}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">

        {/* SECTION 1: ЛИЧНЫЕ СООБЩЕНИЯ МЕНЕДЖЕРУ */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#262835] border border-white/10 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#c5a880]/10 border border-[#c5a880]/20 flex items-center justify-center text-[#c5a880]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  1. Личные сообщения менеджеру
                </h3>
                <p className="text-xs text-[#a1a1aa]">
                  Уведомления о каждом заказе с кнопками быстрой смены статуса прямо в Telegram
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={notifyManager}
                onChange={e => setNotifyManager(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c5a880]"></div>
            </label>
          </div>

          {/* Telegram User One-Click Connect */}
          {tgUser && (
            <div className="p-3.5 rounded-xl bg-[#229ED9]/10 border border-[#229ED9]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-[#d4d4d8]">
                Ваш текущий профиль: <strong className="text-white">{tgUser.first_name} {tgUser.last_name || ''}</strong> (ID: <code className="text-[#229ED9]">{tgUser.id}</code>)
              </div>
              <button
                type="button"
                onClick={handleConnectCurrentTgUser}
                className="px-3.5 py-2 rounded-xl bg-[#229ED9] hover:bg-[#1f8ec4] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 flex-shrink-0 shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Привязать мой ID в 1 клик</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#a1a1aa] mb-1.5 text-xs font-medium">
                Telegram Chat ID менеджера
              </label>
              <input
                type="text"
                value={recipientId}
                onChange={e => setRecipientId(e.target.value)}
                placeholder="Например: 123456789"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#c5a880]"
              />
              <p className="text-[10px] text-[#71717a] mt-1">
                Числовой ID пользователя в Telegram (можно узнать у @userinfobot или @myidbot)
              </p>
            </div>

            <div>
              <label className="block text-[#a1a1aa] mb-1.5 text-xs font-medium">
                Имя менеджера / ответственного
              </label>
              <input
                type="text"
                value={managerName}
                onChange={e => setManagerName(e.target.value)}
                placeholder="Менеджер бутика"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#c5a880]"
              />
              <p className="text-[10px] text-[#71717a] mt-1">
                Отображается в админке для удобства
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <a
              href={botDeepLink}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#229ED9] flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Открыть диалог с @{activeBotName}</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>

            {isManagerConnected && (
              <button
                type="button"
                onClick={() => handleSendTestMessage('manager')}
                disabled={testingTarget === 'manager'}
                className="px-4 py-2 rounded-xl bg-[#c5a880]/15 hover:bg-[#c5a880]/25 border border-[#c5a880]/30 text-xs text-[#d8bf9b] font-medium flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>{testingTarget === 'manager' ? 'Отправка...' : 'Тест в ЛС менеджеру'}</span>
              </button>
            )}
          </div>
        </div>

        {/* SECTION 2: УВЕДОМЛЕНИЯ В ГРУППУ / ЧАТ КОМАНДЫ */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#262835] border border-white/10 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#229ED9]/10 border border-[#229ED9]/20 flex items-center justify-center text-[#229ED9]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  2. Уведомления в группу / чат команды
                </h3>
                <p className="text-xs text-[#a1a1aa]">
                  Общий чат сотрудников, где вся команда видит новые заказы и статусы
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={notifyGroup}
                onChange={e => setNotifyGroup(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#229ED9]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#a1a1aa] mb-1.5 text-xs font-medium">
                Telegram Chat ID группы (-100...)
              </label>
              <input
                type="text"
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
                placeholder="-1001234567890"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#229ED9]"
              />
              <p className="text-[10px] text-[#71717a] mt-1">
                ID группы всегда начинается с минуса (например: <code>-1002345678901</code>)
              </p>
            </div>

            <div>
              <label className="block text-[#a1a1aa] mb-1.5 text-xs font-medium">
                Название группы / чата
              </label>
              <input
                type="text"
                value={groupTitle}
                onChange={e => setGroupTitle(e.target.value)}
                placeholder="Заказы Parfum Selective"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#229ED9]"
              />
              <p className="text-[10px] text-[#71717a] mt-1">
                Для наглядности в панели управления
              </p>
            </div>
          </div>

          {/* Step by step Group Connection Guide */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#c5a880] uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Как легко подключить группу Telegram:</span>
            </div>

            <div className="space-y-2 text-[#d4d4d8]">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#c5a880]/20 text-[#c5a880] flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  Откройте настройки вашей группы в Telegram и добавьте бота{' '}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`@${activeBotName}`, 'botname')}
                    className="inline-flex items-center gap-1 text-[#229ED9] hover:underline font-mono font-semibold"
                  >
                    @{activeBotName}
                    {copiedCode === 'botname' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#c5a880]/20 text-[#c5a880] flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  Назначьте бота администратором группы или разрешите ему отправлять сообщения.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#c5a880]/20 text-[#c5a880] flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  Отправьте в группу сообщение <code>/start</code> или введите Chat ID группы в поле выше (узнать ID можно добавив бота <code>@myidbot</code> в группу).
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            {isGroupConnected && (
              <button
                type="button"
                onClick={() => handleSendTestMessage('group')}
                disabled={testingTarget === 'group'}
                className="px-4 py-2 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 border border-[#229ED9]/30 text-xs text-[#229ED9] font-medium flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5 text-[#229ED9]" />
                <span>{testingTarget === 'group' ? 'Отправка...' : 'Тест в группу'}</span>
              </button>
            )}
          </div>
        </div>

        {/* SECTION 3: ТИПЫ СОБЫТИЙ */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#262835] border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-white">
                3. Настройки отправки событий
              </h3>
              <p className="text-xs text-[#a1a1aa]">
                Выберите, какие события отправлять в Telegram
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-all">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white">Новые заказы клиентов</div>
                <div className="text-[11px] text-[#71717a]">
                  Состав заказа, контакты, адрес, сумма и кнопки смены статуса
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-md">
                Всегда включено
              </span>
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-all">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white">Лист ожидания (Waitlist)</div>
                <div className="text-[11px] text-[#71717a]">
                  Запросы клиентов «Уведомить о наличии» на недоступные объёмы
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyWaitlist}
                onChange={e => setNotifyWaitlist(e.target.checked)}
                className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#c5a880] focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* SECTION 4: УПРАВЛЕНИЕ АДМИНИСТРАТОРАМИ ПО TELEGRAM ID */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#262835] border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-white">
                4. Управление администраторами (Telegram ID)
              </h3>
              <p className="text-xs text-[#a1a1aa]">
                Добавление и удаление администраторов магазина строго по числовому Telegram ID
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {/* Add Admin input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newAdminIdInput}
                  onChange={e => setNewAdminIdInput(e.target.value)}
                  placeholder="Введите Telegram ID (например, 123456789)"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAdminId();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddAdminId}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 flex-shrink-0 shadow-md shadow-emerald-500/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>Добавить ID</span>
              </button>
            </div>
            <p className="text-[10px] text-[#71717a]">
              Добавление возможно только по числовому ID (без текстовых юзернеймов). Узнать свой ID можно через бота @userinfobot.
            </p>

            {/* List of admins */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-[#d4d4d8]">Список действующих администраторов ({adminIds.length}):</div>
              {adminIds.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-[#71717a] text-center">
                  Список администраторов пуст. Добавьте хотя бы один Telegram ID.
                </div>
              ) : (
                <div className="space-y-2">
                  {adminIds.map(adminId => (
                    <div
                      key={adminId}
                      className="flex items-center justify-between p-3 rounded-xl bg-black/25 border border-white/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-xs font-bold">
                          #
                        </div>
                        <span className="font-mono text-xs text-white font-medium">{adminId}</span>
                        {tgUser && String(tgUser.id) === adminId && (
                          <span className="px-2 py-0.5 rounded bg-[#229ED9]/20 text-[#229ED9] text-[10px] font-semibold">
                            Это вы
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAdminId(adminId)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
                        title="Удалить администратора"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 5: ПАРАМЕТРЫ TELEGRAM BOT API */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#262835] border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c5a880]/10 border border-[#c5a880]/20 flex items-center justify-center text-[#c5a880]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-white">
                5. Параметры бота в Telegram
              </h3>
              <p className="text-xs text-[#a1a1aa]">
                Данные официального бота магазина
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[#a1a1aa] mb-1 text-xs font-medium">
                Юзернейм бота
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a] font-mono text-xs">
                  @
                </span>
                <input
                  type="text"
                  value={botUsername.replace('@', '')}
                  onChange={e => setBotUsername(e.target.value.replace('@', ''))}
                  placeholder="PARFUM_SELECTIVEBOT"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#c5a880]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#a1a1aa] mb-1 text-xs font-medium">
                Telegram Bot Token (от @BotFather)
              </label>
              <input
                type="password"
                value={botToken}
                onChange={e => setBotToken(e.target.value)}
                placeholder="7890123456:AAH... (из диалога с @BotFather)"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#c5a880]"
              />
              <p className="text-[10px] text-[#71717a] mt-1">
                Токен хранится в защищенном виде на сервере и используется для защищенной отправки сообщений.
              </p>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="sticky bottom-4 p-4 rounded-2xl bg-[#1c1d27]/95 backdrop-blur-md border border-white/15 shadow-2xl flex items-center justify-between gap-4 z-20">
          <div className="text-xs text-[#a1a1aa] hidden sm:block">
            Нажмите кнопку, чтобы применить обновленные маршруты уведомлений
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onRefresh}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#d4d4d8] font-medium transition-all"
            >
              Сбросить
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#d8bf9b] text-black font-bold text-xs transition-all active:scale-95 shadow-lg shadow-[#c5a880]/20 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Сохранение...' : 'Сохранить все настройки'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
