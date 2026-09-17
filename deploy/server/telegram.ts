import { Order, OrderStatus, StockNotificationRequest } from '../src/types';
import { db } from './db';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

export function getTelegramConfig() {
  const settings = db.getSettings();
  const token = process.env.TELEGRAM_BOT_TOKEN || settings.telegram_bot_token || '';
  const recipientId = process.env.TELEGRAM_RECIPIENT_ID || settings.telegram_recipient_id || '';
  const groupId = process.env.TELEGRAM_GROUP_ID || settings.telegram_group_id || '';
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || process.env.TELEGRAM_BOT_USERNAME || settings.telegram_bot_username || 'PARFUM_SELECTIVEBOT';
  const notifyManager = settings.telegram_notify_manager !== false;
  const notifyGroup = settings.telegram_notify_group !== false;
  const notifyWaitlist = settings.telegram_notify_waitlist !== false;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || '';

  return {
    token,
    recipientId,
    groupId,
    botUsername,
    notifyManager,
    notifyGroup,
    notifyWaitlist,
    appUrl
  };
}

export function formatOrderTelegramMessage(order: Order, isGroup: boolean = false): string {
  const itemsText = order.items
    .map(item => `▫️ <b>${escapeHtml(item.brand)} — ${escapeHtml(item.product_name)}</b>\n   Объём: ${escapeHtml(item.volume)} × ${item.quantity} шт. = ${(item.price * item.quantity).toLocaleString('ru-RU')} ₽`)
    .join('\n\n');

  const contactLines = [
    `👤 <b>Покупатель:</b> ${escapeHtml(order.customer_name)}`,
    `📞 <b>Телефон:</b> <code>${escapeHtml(order.customer_phone)}</code>`,
    order.customer_telegram ? `✈️ <b>Telegram:</b> ${order.customer_telegram.startsWith('@') ? order.customer_telegram : '@' + escapeHtml(order.customer_telegram)}` : null
  ].filter(Boolean).join('\n');

  const commentText = order.comment ? `\n\n💬 <b>Комментарий:</b> <i>${escapeHtml(order.comment)}</i>` : '';
  const headerPrefix = isGroup ? '📢 <b>НОВЫЙ ЗАКАЗ ДЛЯ КОМАНДЫ' : '🛍 <b>НОВЫЙ ЗАКАЗ';

  return `${headerPrefix} ${order.order_number}</b>\n\n${itemsText}\n\n────────────────\n💰 <b>Итого к оплате: ${order.total.toLocaleString('ru-RU')} ₽</b>\n────────────────\n\n${contactLines}${commentText}\n\n📌 Статус: <b>${order.status}</b>\n⏰ Время: ${new Date(order.created_at).toLocaleString('ru-RU')}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function getOrderInlineKeyboard(orderNumber: string, currentStatus: OrderStatus) {
  const num = orderNumber.replace('#', '');
  
  if (currentStatus === 'Новый') {
    return {
      inline_keyboard: [
        [
          { text: '✅ Принять в работу', callback_data: `status:${num}:Принят` },
          { text: '❌ Отменить заказ', callback_data: `status:${num}:Отменён` }
        ]
      ]
    };
  }

  if (currentStatus === 'Принят') {
    return {
      inline_keyboard: [
        [
          { text: '📦 Собирается', callback_data: `status:${num}:Собирается` },
          { text: '✅ Готов к выдаче', callback_data: `status:${num}:Готов` }
        ],
        [
          { text: '❌ Отменить заказ', callback_data: `status:${num}:Отменён` }
        ]
      ]
    };
  }

  if (currentStatus === 'Собирается') {
    return {
      inline_keyboard: [
        [
          { text: '✅ Готов к выдаче/отправке', callback_data: `status:${num}:Готов` },
          { text: '✔️ Выдан клиенту', callback_data: `status:${num}:Выдан` }
        ]
      ]
    };
  }

  if (currentStatus === 'Готов') {
    return {
      inline_keyboard: [
        [
          { text: '✔️ Выдан клиенту', callback_data: `status:${num}:Выдан` },
          { text: '❌ Отменить', callback_data: `status:${num}:Отменён` }
        ]
      ]
    };
  }

  // Already completed / cancelled
  return {
    inline_keyboard: [
      [
        { text: `Статус: ${currentStatus}`, callback_data: `noop:${num}` }
      ]
    ]
  };
}

export async function sendOrderNotification(order: Order): Promise<{ success: boolean; messageId?: number; groupMessageId?: number; error?: string }> {
  const { token, recipientId, groupId, notifyManager, notifyGroup } = getTelegramConfig();

  const targets: { id: string; type: 'manager' | 'group' }[] = [];
  if (notifyManager && recipientId) {
    targets.push({ id: recipientId, type: 'manager' });
  }
  if (notifyGroup && groupId && groupId !== recipientId) {
    targets.push({ id: groupId, type: 'group' });
  }

  if (!token || targets.length === 0) {
    console.log(`[Telegram] No recipients or bot token configured. Simulated notification for order ${order.order_number}`);
    return {
      success: true,
      error: 'Уведомление симулировано (токен или получатели не настроены)'
    };
  }

  let managerMsgId: number | undefined;
  let groupMsgId: number | undefined;
  let hasSuccess = false;
  let lastError: string | undefined;

  for (const target of targets) {
    try {
      const text = formatOrderTelegramMessage(order, target.type === 'group');
      const replyMarkup = getOrderInlineKeyboard(order.order_number, order.status);

      const res = await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: target.id,
          text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        })
      });

      const data = await res.json();
      if (data.ok) {
        hasSuccess = true;
        const msgId = data.result?.message_id;
        if (target.type === 'manager') {
          managerMsgId = msgId;
        } else {
          groupMsgId = msgId;
        }
      } else {
        lastError = data.description || 'Telegram API error';
        console.error(`[Telegram send error to ${target.type} (${target.id})]:`, data);
      }
    } catch (e: any) {
      lastError = e.message;
      console.error(`[Telegram send exception to ${target.type} (${target.id})]:`, e);
    }
  }

  if (hasSuccess) {
    db.updateOrder(order.id, {
      telegram_notified: true,
      telegram_message_id: managerMsgId,
      telegram_group_message_id: groupMsgId
    });
    return { success: true, messageId: managerMsgId, groupMessageId: groupMsgId };
  }

  return { success: false, error: lastError || 'Ошибка отправки в Telegram' };
}

export async function updateTelegramOrderMessage(order: Order): Promise<boolean> {
  const { token, recipientId, groupId } = getTelegramConfig();
  if (!token) return false;

  let anySuccess = false;

  // Update in Manager PM if exists
  if (recipientId && order.telegram_message_id) {
    try {
      const text = formatOrderTelegramMessage(order, false);
      const replyMarkup = getOrderInlineKeyboard(order.order_number, order.status);
      const res = await fetch(`${TELEGRAM_API_BASE}${token}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: recipientId,
          message_id: order.telegram_message_id,
          text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        })
      });
      const data = await res.json();
      if (data.ok) anySuccess = true;
    } catch (e) {
      console.error('[Telegram Edit Manager Message Error]', e);
    }
  }

  // Update in Group if exists
  if (groupId && order.telegram_group_message_id) {
    try {
      const text = formatOrderTelegramMessage(order, true);
      const replyMarkup = getOrderInlineKeyboard(order.order_number, order.status);
      const res = await fetch(`${TELEGRAM_API_BASE}${token}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: groupId,
          message_id: order.telegram_group_message_id,
          text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        })
      });
      const data = await res.json();
      if (data.ok) anySuccess = true;
    } catch (e) {
      console.error('[Telegram Edit Group Message Error]', e);
    }
  }

  return anySuccess;
}

export async function sendStockNotificationAlert(
  request: StockNotificationRequest
): Promise<{ success: boolean; error?: string }> {
  const { token, recipientId, groupId, notifyManager, notifyGroup, notifyWaitlist } = getTelegramConfig();
  if (!notifyWaitlist) {
    return { success: true };
  }

  const targets: string[] = [];
  if (notifyManager && recipientId) targets.push(recipientId);
  if (notifyGroup && groupId && groupId !== recipientId) targets.push(groupId);

  if (!token || targets.length === 0) {
    return { success: false, error: 'Telegram не настроен для уведомлений' };
  }

  const contactStr = request.customer_contact.startsWith('@')
    ? request.customer_contact
    : escapeHtml(request.customer_contact);

  const text = `🔔 <b>ЗАПРОС НА НАЛИЧИЕ (Лист ожидания)</b>\n\n` +
    `✨ <b>${escapeHtml(request.brand)} — ${escapeHtml(request.product_name)}</b>\n` +
    `💧 Объём: <b>${escapeHtml(request.volume)}</b> (${request.price.toLocaleString('ru-RU')} ₽)\n\n` +
    `👤 Клиент: <b>${escapeHtml(request.customer_name)}</b>\n` +
    `📱 Контакт: <b>${contactStr}</b>` +
    (request.comment ? `\n💬 Комментарий: <i>${escapeHtml(request.comment)}</i>` : '') +
    `\n\n📅 Дата: ${new Date(request.created_at).toLocaleString('ru-RU')}`;

  let sentCount = 0;
  let lastErr = '';

  for (const chatId of targets) {
    try {
      const res = await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML'
        })
      });
      const data = await res.json();
      if (data.ok) {
        sentCount++;
      } else {
        lastErr = data.description || 'Telegram API Error';
      }
    } catch (err: any) {
      lastErr = err.message;
    }
  }

  return { success: sentCount > 0, error: sentCount > 0 ? undefined : lastErr };
}

export async function sendTestTelegramMessage(
  chatId: string,
  targetType: 'manager' | 'group' = 'manager'
): Promise<{ success: boolean; error?: string }> {
  const { token, botUsername } = getTelegramConfig();
  if (!token) {
    return { success: false, error: 'Токен Telegram-бота не указан' };
  }

  const isGroup = targetType === 'group' || chatId.startsWith('-');
  const title = isGroup
    ? '📢 <b>PARFUM.SELECTIVE — Тест уведомлений в группу</b>'
    : '🔔 <b>PARFUM.SELECTIVE — Тест уведомлений менеджеру</b>';

  const text = `${title}\n\n` +
    `✅ Связь с ботом @${botUsername} успешно установлена!\n` +
    `Канал получения: <b>${isGroup ? 'Группа / Чат команды' : 'Личные сообщения менеджера'}</b> (Chat ID: <code>${chatId}</code>)\n\n` +
    `Теперь сюда будут мгновенно приходить все новые заказы с витрины и запросы из листа ожидания с кнопками быстрого управления статусом.\n\n` +
    `⏰ Время проверки: ${new Date().toLocaleTimeString('ru-RU')}`;

  try {
    const res = await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true };
    }
    return { success: false, error: data.description || 'Не удалось отправить сообщение' };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function handleTelegramWebhook(body: any) {
  const { token, recipientId, botUsername } = getTelegramConfig();

  // Handle group addition event (my_chat_member)
  if (body.my_chat_member) {
    const chat = body.my_chat_member.chat;
    const newStatus = body.my_chat_member.new_chat_member?.status;
    if (['member', 'administrator'].includes(newStatus) && ['group', 'supergroup', 'channel'].includes(chat.type)) {
      const groupChatId = String(chat.id);
      const groupTitle = chat.title || 'Группа магазина';

      db.updateSettings({
        telegram_group_id: groupChatId,
        telegram_group_title: groupTitle,
        telegram_group_connected: true
      });

      if (token) {
        await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: groupChatId,
            text: `✨ <b>Бот @${botUsername} успешно подключен к группе «${escapeHtml(groupTitle)}»!</b>\n\nID группы (<code>${groupChatId}</code>) сохранен в настройках магазина. Теперь сюда будут поступать все новые заказы покупателей.`,
            parse_mode: 'HTML'
          })
        });
      }
      return { ok: true, groupConnected: groupChatId };
    }
  }

  // 1. Handle message from users or groups
  if (body.message && body.message.text) {
    const text = body.message.text.trim();
    const chatId = String(body.message.chat.id);
    const chatType = body.message.chat.type; // 'private', 'group', 'supergroup', 'channel'
    const username = body.message.from?.username || '';
    const firstName = body.message.from?.first_name || 'Клиент';
    const lastName = body.message.from?.last_name || '';

    // If message comes from a group
    if (chatType === 'group' || chatType === 'supergroup') {
      const groupTitle = body.message.chat.title || 'Группа';
      if (text.startsWith('/start') || text.startsWith('/connect') || text.includes('connect')) {
        db.updateSettings({
          telegram_group_id: chatId,
          telegram_group_title: groupTitle,
          telegram_group_connected: true
        });

        if (token) {
          await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ <b>Группа «${escapeHtml(groupTitle)}» успешно привязана к магазину PARFUM.SELECTIVE!</b>\n\nID группы: <code>${chatId}</code>\nСюда будут автоматически отправляться уведомления обо всех заказах клиентов.`,
              parse_mode: 'HTML'
            })
          });
        }
        return { ok: true, groupConnected: chatId };
      }
      return { ok: true, groupMessageReceived: chatId };
    }

    // Register / update subscriber if private chat
    try {
      db.upsertSubscriber({
        telegram_id: chatId,
        first_name: firstName,
        last_name: lastName,
        username: username,
        source: 'telegram_bot'
      });
    } catch (e) {
      console.error('Error recording subscriber from telegram webhook:', e);
    }

    if (text.startsWith('/start admin') || (!recipientId && text.startsWith('/start'))) {
      // Connect this chatId as manager recipient
      db.updateSettings({
        telegram_recipient_id: chatId,
        telegram_manager_name: `${firstName} ${lastName}`.trim(),
        telegram_connected: true
      });

      if (token) {
        await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✅ <b>Здравствуйте, ${escapeHtml(firstName)}!</b>\n\nВаш личный Telegram успешно привязан для получения заказов магазина <b>PARFUM.SELECTIVE</b> (ID: <code>${chatId}</code>).\n\nТеперь все новые заказы и запросы на распив будут мгновенно приходить вам в этот чат с кнопками смены статуса.`,
            parse_mode: 'HTML'
          })
        });
      }
      return { ok: true, connected: chatId };
    } else if (text.startsWith('/start')) {
      // Standard client greeting & registration promo code
      const promoCode = db.getOrCreateRegistrationPromoCode(chatId, firstName || 'Клиент');

      if (token) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || '';
        
        await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✨ <b>Добро пожаловать в бутик PARFUM.SELECTIVE!</b>\n\nЗдесь собраны лучшие селективные ароматы в распиве и полноразмерных флаконах: <i>Ganymede, Baccarat Rouge 540, Lost Cherry, Bal d’Afrique</i> и другие.\n\n🎁 <b>Ваш персональный подарок за регистрацию:</b>\nПромокод: <code>${promoCode.code}</code> на скидку <b>${promoCode.discount_value}%</b> на первый заказ!\n\nНажмите кнопку ниже, чтобы открыть онлайн-витрину и применить промокод в корзине.`,
            parse_mode: 'HTML',
            reply_markup: appUrl ? {
              inline_keyboard: [
                [
                  {
                    text: '🛍 Открыть витрину и забрать скидку',
                    web_app: { url: appUrl }
                  }
                ]
              ]
            } : undefined
          })
        });
      }
      return { ok: true, subscriber: chatId };
    }
  }

  // 2. Handle Inline Button Clicks (Callback Queries)
  if (body.callback_query) {
    const callbackQuery = body.callback_query;
    const data = callbackQuery.data; // e.g. "status:1001:Принят"
    const callbackId = callbackQuery.id;

    if (data && data.startsWith('status:')) {
      const parts = data.split(':');
      const orderNum = parts[1];
      const newStatus = parts[2] as OrderStatus;

      const order = db.updateOrderStatus(orderNum, newStatus);

      if (token) {
        // Acknowledge callback query
        await fetch(`${TELEGRAM_API_BASE}${token}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackId,
            text: `Заказ #${orderNum}: статус изменен на "${newStatus}"`,
            show_alert: false
          })
        });

        if (order && callbackQuery.message) {
          const isGroup = callbackQuery.message.chat?.type === 'group' || callbackQuery.message.chat?.type === 'supergroup';
          const updatedText = formatOrderTelegramMessage(order, isGroup);
          const replyMarkup = getOrderInlineKeyboard(order.order_number, newStatus);

          await fetch(`${TELEGRAM_API_BASE}${token}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: callbackQuery.message.chat.id,
              message_id: callbackQuery.message.message_id,
              text: updatedText,
              parse_mode: 'HTML',
              reply_markup: replyMarkup
            })
          });
        }
      }
      return { ok: true, statusUpdated: newStatus };
    }
  }

  return { ok: true };
}

// ==========================================
// BROADCAST DISPATCHER FUNCTIONS
// ==========================================

export interface SendBroadcastParams {
  chatId: string;
  messageText: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export async function sendSingleBroadcastMessage(
  params: SendBroadcastParams
): Promise<{ success: boolean; error?: string }> {
  const { token, appUrl } = getTelegramConfig();
  if (!token) {
    return { success: false, error: 'Telegram-бот не настроен' };
  }

  const { chatId, messageText, imageUrl, buttonText, buttonUrl } = params;

  // Build inline keyboard if button is specified
  let replyMarkup: any = undefined;
  const targetUrl = buttonUrl?.trim() || appUrl || '';

  if (buttonText?.trim()) {
    if (targetUrl) {
      replyMarkup = {
        inline_keyboard: [
          [
            {
              text: buttonText.trim(),
              url: targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`
            }
          ]
        ]
      };
    }
  }

  try {
    if (imageUrl && imageUrl.trim().startsWith('http')) {
      // Send Photo with caption
      const res = await fetch(`${TELEGRAM_API_BASE}${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: imageUrl.trim(),
          caption: messageText,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        })
      });

      const data = await res.json();
      if (data.ok) return { success: true };
      
      // If photo failed (e.g. invalid URL), fallback to plain text message
      console.warn('sendPhoto failed, falling back to sendMessage:', data.description);
    }

    // Send standard text message
    const res = await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
        disable_web_page_preview: false
      })
    });

    const data = await res.json();
    return { success: data.ok === true, error: data.description };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function sendTestBroadcastPreview(params: {
  chatId: string;
  messageText: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const previewPrefix = `📢 <b>[ТЕСТОВОЕ ПРЕВЬЮ РАССЫЛКИ]</b>\n<i>Так сообщение увидят ваши клиенты:</i>\n\n`;
  return sendSingleBroadcastMessage({
    chatId: params.chatId,
    messageText: previewPrefix + params.messageText,
    imageUrl: params.imageUrl,
    buttonText: params.buttonText,
    buttonUrl: params.buttonUrl
  });
}

export async function executeBroadcastCampaign(campaignId: string): Promise<{
  success: boolean;
  sent_count: number;
  failed_count: number;
  total_recipients: number;
  error?: string;
}> {
  const campaign = db.getBroadcast(campaignId);
  if (!campaign) {
    return { success: false, sent_count: 0, failed_count: 0, total_recipients: 0, error: 'Рассылка не найдена' };
  }

  const { token } = getTelegramConfig();
  if (!token) {
    return { success: false, sent_count: 0, failed_count: 0, total_recipients: 0, error: 'Telegram-бот не настроен' };
  }

  // Determine recipients
  let targetChatIds: string[] = [];
  const subscribers = db.getSubscribers().filter(s => s.is_active && s.telegram_id);
  const orders = db.getOrders();
  const waitlist = db.getStockNotifications();

  if (campaign.target_audience === 'all') {
    targetChatIds = Array.from(new Set(subscribers.map(s => s.telegram_id)));
  } else if (campaign.target_audience === 'buyers') {
    // Only subscribers with orders
    const buyers = subscribers.filter(s => s.orders_count > 0 || orders.some(o => o.customer_telegram?.replace('@', '') === s.telegram_id || o.customer_phone === s.phone));
    targetChatIds = Array.from(new Set(buyers.map(s => s.telegram_id)));
  } else if (campaign.target_audience === 'waitlist') {
    // Waitlist contacts with telegram_id
    const waitlistIds = waitlist.map(w => w.customer_telegram_id || w.customer_contact.replace('@', '')).filter(Boolean);
    const matchedSubs = subscribers.filter(s => waitlistIds.includes(s.telegram_id) || (s.username && waitlistIds.includes(s.username)));
    targetChatIds = Array.from(new Set([...waitlistIds, ...matchedSubs.map(s => s.telegram_id)]));
  } else if (campaign.target_audience === 'custom' && campaign.custom_telegram_ids) {
    targetChatIds = campaign.custom_telegram_ids.filter(Boolean);
  }

  if (targetChatIds.length === 0) {
    // Fallback: If no dedicated subscribers yet, send to configured recipient/admin as test
    const { recipientId } = getTelegramConfig();
    if (recipientId) {
      targetChatIds = [recipientId];
    }
  }

  db.updateBroadcast(campaignId, {
    status: 'sending',
    total_recipients: targetChatIds.length,
    sent_count: 0,
    failed_count: 0,
    error_log: []
  });

  let sent = 0;
  let failed = 0;
  const errorLog: string[] = [];

  for (const chatId of targetChatIds) {
    try {
      const res = await sendSingleBroadcastMessage({
        chatId,
        messageText: campaign.message_text,
        imageUrl: campaign.image_url,
        buttonText: campaign.button_text,
        buttonUrl: campaign.button_url
      });

      if (res.success) {
        sent++;
      } else {
        failed++;
        errorLog.push(`Chat ${chatId}: ${res.error || 'Unknown error'}`);
      }
    } catch (e: any) {
      failed++;
      errorLog.push(`Chat ${chatId}: ${e.message}`);
    }

    // Rate limiting delay (75ms between messages)
    await new Promise(resolve => setTimeout(resolve, 75));
  }

  const finalStatus = failed === targetChatIds.length && targetChatIds.length > 0 ? 'failed' : 'completed';

  db.updateBroadcast(campaignId, {
    status: finalStatus,
    sent_count: sent,
    failed_count: failed,
    error_log: errorLog,
    sent_at: new Date().toISOString()
  });

  return {
    success: finalStatus === 'completed',
    sent_count: sent,
    failed_count: failed,
    total_recipients: targetChatIds.length
  };
}

