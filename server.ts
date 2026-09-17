import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';
import { db } from './server/db';
import {
  sendOrderNotification,
  sendTestTelegramMessage,
  sendStockNotificationAlert,
  handleTelegramWebhook,
  getTelegramConfig,
  updateTelegramOrderMessage,
  executeBroadcastCampaign,
  sendTestBroadcastPreview,
  sendSingleBroadcastMessage
} from './server/telegram';
import { OrderStatus } from './src/types';

dotenv.config({ override: false });

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use((req, res, next) => { res.setHeader('Cross-Origin-Opener-Policy', 'same-origin'); res.setHeader('Cross-Origin-Resource-Policy', 'same-origin'); next(); });
  app.use((req, res, next) => { res.setHeader('X-Frame-Options', 'DENY'); res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'); next(); });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'PARFUM.SELECTIVE API', time: new Date().toISOString() });
  });

  // 1. PRODUCTS API
  app.get('/api/products', (req, res) => {
    try {
      const { category, search, gender } = req.query as Record<string, string>;
      const products = db.getProducts(category, search, gender);
      res.json({ success: true, products });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/products/:id', (req, res) => {
    const product = db.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Товар не найден' });
    }
    res.json({ success: true, product });
  });

  app.post('/api/products', (req, res) => {
    try {
      const productSchema = z.object({
        brand: z.string().min(1, 'Укажите бренд'),
        name: z.string().min(1, 'Укажите название'),
        description: z.string().default(''),
        direction: z.string().default('Нишевый аромат'),
        notes: z.object({
          top: z.array(z.string()).optional(),
          heart: z.array(z.string()).optional(),
          base: z.array(z.string()).optional(),
          main: z.array(z.string()).default([])
        }),
        gender: z.enum(['men', 'women', 'unisex']).default('unisex'),
        category: z.enum(['all', 'decant', 'bottles', 'new']).default('all'),
        image_url: z.string().url().or(z.string().min(1)),
        is_active: z.boolean().default(true),
        is_new: z.boolean().optional(),
        is_popular: z.boolean().optional(),
        is_special_offer: z.boolean().optional(),
        discount_percent: z.number().optional(),
        special_offer_badge: z.string().optional(),
        special_offer_ends_in: z.string().optional(),
        variants: z.array(
          z.object({
            id: z.string(),
            volume: z.string(),
            price: z.number().positive(),
            old_price: z.number().positive().optional(),
            is_available: z.boolean()
          })
        ).min(1, 'Добавьте хотя бы один объём')
      });

      const validated = productSchema.parse(req.body);
      const created = db.createProduct(validated as any);
      res.status(201).json({ success: true, product: created });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.errors ? err.errors[0].message : err.message });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    try {
      const updated = db.updateProduct(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Товар не найден' });
      }
      res.json({ success: true, product: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    const deleted = db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Товар не найден' });
    }
    res.json({ success: true });
  });

  // 2. ORDERS API
  app.get('/api/orders', (req, res) => {
    try {
      const orders = db.getOrders();
      res.json({ success: true, orders });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = db.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Заказ не найден' });
    }
    res.json({ success: true, order });
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const orderSchema = z.object({
        customer_name: z.string().min(2, 'Укажите ваше имя'),
        customer_phone: z.string().min(5, 'Укажите контактный телефон или ник в Telegram'),
        customer_telegram: z.string().optional(),
        comment: z.string().optional(),
        items: z.array(
          z.object({
            id: z.string(),
            product_id: z.string(),
            product_name: z.string(),
            brand: z.string(),
            volume: z.string(),
            price: z.number().positive(),
            quantity: z.number().min(1),
            image_url: z.string().optional()
          })
        ).min(1, 'Корзина не может быть пустой'),
        total: z.number().positive()
      });

      const validated = orderSchema.parse(req.body);

      // Create order in DB with sequential order number (#1001, #1002...)
      const order = db.createOrder(validated);

      // Dispatch Telegram Notification to seller's direct message
      const notifyResult = await sendOrderNotification(order);

      res.status(201).json({
        success: true,
        order,
        telegram_notified: notifyResult.success,
        telegram_info: notifyResult.error || 'Уведомление отправлено'
      });
    } catch (err: any) {
      console.error('Order creation error:', err);
      res.status(400).json({
        success: false,
        error: err.errors ? err.errors[0].message : err.message
      });
    }
  });

  app.patch('/api/orders/:id/status', async (req, res) => {
    try {
      const { status } = req.body as { status: OrderStatus };
      if (!status) {
        return res.status(400).json({ success: false, error: 'Не указан статус' });
      }
      const order = db.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Заказ не найден' });
      }

      // Try updating Telegram message if one exists
      if (order.telegram_message_id) {
        await updateTelegramOrderMessage(order);
      }

      res.json({ success: true, order });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. SETTINGS & TELEGRAM CONNECTION API
  app.get('/api/settings', (req, res) => {
    const settings = db.getSettings();
    const config = getTelegramConfig();

    // Mask bot token for display
    const maskedToken = config.token
      ? `${config.token.substring(0, 5)}...${config.token.substring(config.token.length - 4)}`
      : '';

    res.json({
      success: true,
      settings: {
        ...settings,
        telegram_bot_token_masked: maskedToken,
        has_token: Boolean(config.token),
        telegram_recipient_id: config.recipientId,
        telegram_group_id: config.groupId,
        telegram_bot_username: config.botUsername,
        telegram_notify_manager: config.notifyManager,
        telegram_notify_group: config.notifyGroup,
        telegram_notify_waitlist: config.notifyWaitlist,
        telegram_connected: Boolean(config.recipientId),
        telegram_group_connected: Boolean(config.groupId)
      }
    });
  });

  app.post('/api/settings', (req, res) => {
    try {
      const {
        telegram_bot_token,
        telegram_bot_username,
        telegram_recipient_id,
        telegram_manager_name,
        telegram_group_id,
        telegram_group_title,
        telegram_notify_manager,
        telegram_notify_group,
        telegram_notify_waitlist,
        admin_telegram_ids
      } = req.body;

      const updates: any = {};
      if (telegram_bot_token !== undefined) updates.telegram_bot_token = telegram_bot_token;
      if (telegram_bot_username !== undefined) updates.telegram_bot_username = telegram_bot_username;
      if (telegram_recipient_id !== undefined) updates.telegram_recipient_id = telegram_recipient_id;
      if (telegram_manager_name !== undefined) updates.telegram_manager_name = telegram_manager_name;
      if (telegram_group_id !== undefined) updates.telegram_group_id = telegram_group_id;
      if (telegram_group_title !== undefined) updates.telegram_group_title = telegram_group_title;
      if (telegram_notify_manager !== undefined) updates.telegram_notify_manager = Boolean(telegram_notify_manager);
      if (telegram_notify_group !== undefined) updates.telegram_notify_group = Boolean(telegram_notify_group);
      if (telegram_notify_waitlist !== undefined) updates.telegram_notify_waitlist = Boolean(telegram_notify_waitlist);
      if (admin_telegram_ids !== undefined && Array.isArray(admin_telegram_ids)) {
        updates.admin_telegram_ids = admin_telegram_ids.map((id: any) => String(id).trim()).filter(Boolean);
      }

      const updated = db.updateSettings(updates);
      res.json({ success: true, settings: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Test telegram notification (manager PM or team group)
  app.post('/api/telegram/test', async (req, res) => {
    try {
      const { chatId, targetType } = req.body;
      const settings = db.getSettings();
      let targetChat = chatId;

      if (!targetChat) {
        if (targetType === 'group') {
          targetChat = settings.telegram_group_id || process.env.TELEGRAM_GROUP_ID;
        } else {
          targetChat = settings.telegram_recipient_id || process.env.TELEGRAM_RECIPIENT_ID;
        }
      }

      if (!targetChat) {
        return res.status(400).json({
          success: false,
          error: targetType === 'group'
            ? 'ID группы не указан. Добавьте бота в группу или укажите Chat ID группы.'
            : 'Личный ID менеджера не указан. Подключите Telegram или введите Chat ID.'
        });
      }

      const result = await sendTestTelegramMessage(targetChat, targetType || (targetChat.startsWith('-') ? 'group' : 'manager'));
      if (result.success) {
        res.json({
          success: true,
          message: targetType === 'group' || targetChat.startsWith('-')
            ? 'Тестовое уведомление успешно отправлено в группу Telegram!'
            : 'Тестовое уведомление успешно отправлено в личные сообщения менеджеру!'
        });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Telegram Bot Webhook endpoint
  app.post('/api/telegram/webhook', async (req, res) => {
    try {
      const result = await handleTelegramWebhook(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('Webhook error:', err);
      res.status(200).json({ ok: true }); // Always 200 to Telegram
    }
  });

  // 4. STATS API
  app.get('/api/stats', (req, res) => {
    try {
      const stats = db.getStats();
      res.json({ success: true, stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. STORIES API (Admin management & storefront)
  app.get('/api/stories', (req, res) => {
    try {
      const stories = db.getStories();
      res.json({ success: true, stories });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/stories/:id', (req, res) => {
    const story = db.getStory(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, error: 'История не найдена' });
    }
    res.json({ success: true, story });
  });

  app.post('/api/stories', (req, res) => {
    try {
      const slideSchema = z.object({
        id: z.string().optional(),
        badge: z.string().optional(),
        title: z.string().min(1, 'Укажите заголовок слайда'),
        subtitle: z.string().optional(),
        description: z.string().default(''),
        imageUrl: z.string().min(1, 'Укажите фото слайда'),
        tag: z.string().optional(),
        notesPreview: z.array(z.string()).optional(),
        priceFrom: z.number().optional(),
        productId: z.string().optional(),
        brandFilter: z.string().optional(),
        categoryFilter: z.string().optional(),
        ctaText: z.string().optional()
      });

      const storySchema = z.object({
        title: z.string().min(1, 'Укажите название истории'),
        avatarUrl: z.string().min(1, 'Укажите обложку истории'),
        badgeType: z.enum(['flame', 'sparkles', 'award', 'droplet']).optional().nullable(),
        slides: z.array(slideSchema).min(1, 'Добавьте хотя бы один слайд в историю')
      });

      const validated = storySchema.parse(req.body);
      const formattedSlides = validated.slides.map((s, idx) => ({
        ...s,
        id: s.id || `slide-${Date.now()}-${idx}`
      }));

      const created = db.createStory({
        title: validated.title,
        avatarUrl: validated.avatarUrl,
        badgeType: validated.badgeType || undefined,
        slides: formattedSlides
      });

      res.status(201).json({ success: true, story: created });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.errors ? err.errors[0].message : err.message
      });
    }
  });

  app.put('/api/stories/:id', (req, res) => {
    try {
      const { title, avatarUrl, badgeType, slides } = req.body;
      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
      if (badgeType !== undefined) updates.badgeType = badgeType || undefined;
      if (slides !== undefined && Array.isArray(slides)) {
        updates.slides = slides.map((s: any, idx: number) => ({
          ...s,
          id: s.id || `slide-${Date.now()}-${idx}`
        }));
      }

      const updated = db.updateStory(req.params.id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'История не найдена' });
      }
      res.json({ success: true, story: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/stories/:id', (req, res) => {
    const deleted = db.deleteStory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'История не найдена' });
    }
    res.json({ success: true });
  });

  app.post('/api/stories/reset', (req, res) => {
    try {
      const reset = db.resetStories();
      res.json({ success: true, stories: reset });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. STOCK NOTIFICATIONS API (Waitlist)
  app.get('/api/stock-notifications', (req, res) => {
    try {
      const requests = db.getStockNotifications();
      res.json({ success: true, requests });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/stock-notifications', async (req, res) => {
    try {
      const notifySchema = z.object({
        product_id: z.string().min(1, 'Укажите ID товара'),
        product_name: z.string().min(1, 'Укажите название товара'),
        brand: z.string().min(1, 'Укажите бренд'),
        variant_id: z.string().min(1, 'Укажите вариант'),
        volume: z.string().min(1, 'Укажите объём'),
        price: z.number().positive('Некорректная цена'),
        customer_name: z.string().min(2, 'Укажите ваше имя'),
        customer_contact: z.string().min(3, 'Укажите контакт для связи (телефон или Telegram)'),
        customer_telegram_id: z.string().optional(),
        comment: z.string().optional()
      });

      const validated = notifySchema.parse(req.body);
      const created = db.createStockNotification(validated);

      // Try sending instant Telegram alert to admin
      sendStockNotificationAlert(created).catch(err => {
        console.warn('Failed to send stock notification alert via Telegram:', err);
      });

      res.status(201).json({
        success: true,
        message: 'Запрос принят! Мы уведомим вас при поступлении.',
        request: created
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.errors ? err.errors[0].message : err.message
      });
    }
  });

  app.patch('/api/stock-notifications/:id/status', (req, res) => {
    try {
      const { status } = req.body;
      if (status !== 'pending' && status !== 'notified') {
        return res.status(400).json({ success: false, error: 'Неверный статус' });
      }

      const updated = db.updateStockNotificationStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Запрос не найден' });
      }
      res.json({ success: true, request: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/stock-notifications/:id', (req, res) => {
    try {
      const deleted = db.deleteStockNotification(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Запрос не найден' });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // 7. BROADCASTS & SUBSCRIBERS (РАССЫЛКИ) API
  // ==========================================

  // Get subscribers list
  app.get('/api/subscribers', (req, res) => {
    try {
      const subscribers = db.getSubscribers();
      res.json({ success: true, subscribers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Client-side self-registration (called on Telegram WebApp init)
  app.post('/api/subscribers/register', (req, res) => {
    try {
      const { telegram_id, first_name, last_name, username, phone } = req.body;
      if (!telegram_id) {
        return res.status(400).json({ success: false, error: 'telegram_id is required' });
      }

      const subscriber = db.upsertSubscriber({
        telegram_id: String(telegram_id),
        first_name: first_name || 'Клиент',
        last_name,
        username,
        phone,
        source: 'webapp_launch'
      });

      const promoCode = db.getOrCreateRegistrationPromoCode(String(telegram_id), first_name || 'Клиент');

      const settings = db.getSettings();
      const adminIds = settings.admin_telegram_ids || [];
      const isAdmin = adminIds.includes(String(telegram_id));

      res.json({ success: true, subscriber, promoCode, isAdmin });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Client-side profile data
  app.get('/api/profile/:telegram_id', (req, res) => {
    try {
      const telegramId = String(req.params.telegram_id);
      
      const orders = db.getOrders().filter(o => 
        o.customer_telegram === telegramId || 
        o.customer_telegram === `@${telegramId}`
      );

      const promoCodes = db.getPromoCodes().filter(p => 
        p.assigned_to_telegram_id === telegramId
      );

      res.json({ success: true, orders, promoCodes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Manual add subscriber
  app.post('/api/subscribers', (req, res) => {
    try {
      const subSchema = z.object({
        telegram_id: z.string().min(1, 'Укажите Telegram ID'),
        first_name: z.string().min(1, 'Укажите имя'),
        last_name: z.string().optional(),
        username: z.string().optional(),
        phone: z.string().optional()
      });

      const validated = subSchema.parse(req.body);
      const created = db.upsertSubscriber({
        ...validated,
        source: 'manual'
      });

      res.status(201).json({ success: true, subscriber: created });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.errors ? err.errors[0].message : err.message
      });
    }
  });

  // Delete subscriber
  app.delete('/api/subscribers/:id', (req, res) => {
    try {
      const deleted = db.deleteSubscriber(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Подписчик не найден' });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Send personal message to a subscriber via Telegram bot
  app.post('/api/subscribers/:id/message', async (req, res) => {
    try {
      const { message_text } = req.body;
      if (!message_text || !message_text.trim()) {
        return res.status(400).json({ success: false, error: 'Текст сообщения не может быть пустым' });
      }

      const subscriber = db.getSubscriber(req.params.id);
      if (!subscriber || !subscriber.telegram_id) {
        return res.status(404).json({ success: false, error: 'Клиент или его Telegram ID не найден' });
      }

      const result = await sendSingleBroadcastMessage({
        chatId: subscriber.telegram_id,
        messageText: message_text.trim()
      });

      if (result.success) {
        res.json({ success: true, message: `Личное сообщение успешно отправлено клиенту ${subscriber.first_name}!` });
      } else {
        res.status(500).json({ success: false, error: result.error || 'Не удалось отправить сообщение через Telegram' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- PROMO CODES API ---
  app.get('/api/promo-codes', (req, res) => {
    try {
      const promoCodes = db.getPromoCodes();
      res.json({ success: true, promoCodes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/promo-codes', (req, res) => {
    try {
      const { code, type, discount_type, discount_value, min_order_amount, expires_at, max_uses, assigned_to_telegram_id, assigned_to_name, is_active } = req.body;
      if (!code || discount_value === undefined) {
        return res.status(400).json({ success: false, error: 'Укажите код и размер скидки' });
      }

      const existing = db.getPromoCodeByCode(code);
      if (existing) {
        return res.status(400).json({ success: false, error: 'Промокод с таким кодом уже существует' });
      }

      const newPromo = db.createPromoCode({
        code: code.trim(),
        type: type || 'general',
        discount_type: discount_type || 'percent',
        discount_value: Number(discount_value) || 0,
        min_order_amount: min_order_amount ? Number(min_order_amount) : 0,
        expires_at: expires_at || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        max_uses: max_uses !== undefined ? Number(max_uses) : 0,
        assigned_to_telegram_id: assigned_to_telegram_id || '',
        assigned_to_name: assigned_to_name || '',
        is_active: is_active ?? true
      });

      res.json({ success: true, promoCode: newPromo });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/promo-codes/:id', (req, res) => {
    try {
      const updated = db.updatePromoCode(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Промокод не найден' });
      }
      res.json({ success: true, promoCode: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/promo-codes/:id', (req, res) => {
    try {
      const deleted = db.deletePromoCode(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Промокод не найден' });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/promo-codes/validate', (req, res) => {
    try {
      const { code, cart_total, telegram_id } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, error: 'Введите промокод' });
      }

      const promo = db.getPromoCodeByCode(code);
      if (!promo) {
        return res.status(404).json({ success: false, error: 'Промокод не найден или не существует' });
      }

      if (!promo.is_active) {
        return res.status(400).json({ success: false, error: 'Этот промокод отключен' });
      }

      if (promo.expires_at) {
        const expiryDate = new Date(promo.expires_at);
        if (expiryDate.getTime() < Date.now()) {
          return res.status(400).json({ success: false, error: 'Срок действия промокода истек' });
        }
      }

      if (promo.max_uses && promo.max_uses > 0 && promo.times_used >= promo.max_uses) {
        return res.status(400).json({ success: false, error: 'Превышен лимит использования промокода' });
      }

      const total = Number(cart_total) || 0;
      if (promo.min_order_amount && total < promo.min_order_amount) {
        return res.status(400).json({ success: false, error: `Минимальная сумма заказа для этого промокода: ${promo.min_order_amount.toLocaleString('ru-RU')} ₽` });
      }

      if ((promo.type === 'unique' || promo.type === 'registration') && promo.assigned_to_telegram_id && telegram_id) {
        if (promo.assigned_to_telegram_id !== String(telegram_id)) {
          return res.status(400).json({ success: false, error: 'Этот промокод привязан к другому пользователю' });
        }
      }

      let discountAmount = 0;
      if (promo.discount_type === 'percent') {
        discountAmount = Math.round((total * promo.discount_value) / 100);
      } else {
        discountAmount = promo.discount_value;
      }
      if (discountAmount > total) discountAmount = total;

      res.json({
        success: true,
        promoCode: promo,
        discount_amount: discountAmount,
        message: promo.discount_type === 'percent'
          ? `Промокод активирован: скидка ${promo.discount_value}%`
          : `Промокод активирован: скидка ${promo.discount_value.toLocaleString('ru-RU')} ₽`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get broadcast campaigns list
  app.get('/api/broadcasts', (req, res) => {
    try {
      const broadcasts = db.getBroadcasts();
      res.json({ success: true, broadcasts });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get single broadcast campaign
  app.get('/api/broadcasts/:id', (req, res) => {
    const broadcast = db.getBroadcast(req.params.id);
    if (!broadcast) {
      return res.status(404).json({ success: false, error: 'Рассылка не найдена' });
    }
    res.json({ success: true, broadcast });
  });

  // Create broadcast campaign (and optionally send now)
  app.post('/api/broadcasts', async (req, res) => {
    try {
      const campaignSchema = z.object({
        title: z.string().min(1, 'Укажите название рассылки'),
        target_audience: z.enum(['all', 'buyers', 'waitlist', 'custom']),
        custom_telegram_ids: z.array(z.string()).optional(),
        message_text: z.string().min(5, 'Текст сообщения должен содержать минимум 5 символов'),
        image_url: z.string().optional(),
        button_text: z.string().optional(),
        button_url: z.string().optional(),
        send_now: z.boolean().optional()
      });

      const validated = campaignSchema.parse(req.body);
      const { send_now, ...campaignData } = validated;

      // Count audience
      const subscribers = db.getSubscribers().filter(s => s.is_active);
      let audienceCount = subscribers.length;
      if (validated.target_audience === 'buyers') {
        audienceCount = subscribers.filter(s => s.orders_count > 0).length;
      } else if (validated.target_audience === 'waitlist') {
        audienceCount = db.getStockNotifications().length;
      } else if (validated.target_audience === 'custom' && validated.custom_telegram_ids) {
        audienceCount = validated.custom_telegram_ids.length;
      }

      const created = db.createBroadcast({
        ...campaignData,
        total_recipients: audienceCount
      });

      if (send_now) {
        // Execute in background
        executeBroadcastCampaign(created.id).catch(err => {
          console.error('Failed to execute broadcast campaign:', err);
        });
      }

      res.status(201).json({
        success: true,
        broadcast: created,
        message: send_now ? 'Рассылка поставлена в очередь на отправку!' : 'Черновик рассылки сохранен!'
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.errors ? err.errors[0].message : err.message
      });
    }
  });

  // Send an existing broadcast campaign
  app.post('/api/broadcasts/:id/send', async (req, res) => {
    try {
      const campaign = db.getBroadcast(req.params.id);
      if (!campaign) {
        return res.status(404).json({ success: false, error: 'Рассылка не найдена' });
      }

      const result = await executeBroadcastCampaign(campaign.id);
      if (result.success) {
        const updated = db.getBroadcast(campaign.id);
        res.json({
          success: true,
          message: `Рассылка успешно отправлена! Доставлено: ${result.sent_count}/${result.total_recipients}`,
          broadcast: updated
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || 'Не удалось отправить рассылку',
          sent_count: result.sent_count,
          failed_count: result.failed_count
        });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Test preview to admin Telegram
  app.post('/api/broadcasts/test', async (req, res) => {
    try {
      const { message_text, image_url, button_text, button_url, chatId } = req.body;
      if (!message_text) {
        return res.status(400).json({ success: false, error: 'Введите текст сообщения для теста' });
      }

      const targetChat = chatId || db.getSettings().telegram_recipient_id || process.env.TELEGRAM_RECIPIENT_ID;
      if (!targetChat) {
        return res.status(400).json({
          success: false,
          error: 'Администратор Telegram не подключен. Сначала подключите бота или введите ID получателя.'
        });
      }

      const result = await sendTestBroadcastPreview({
        chatId: targetChat,
        messageText: message_text,
        imageUrl: image_url,
        buttonText: button_text,
        buttonUrl: button_url
      });

      if (result.success) {
        res.json({
          success: true,
          message: 'Тестовое сообщение успешно отправлено администратору в Telegram!'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || 'Ошибка отправки тестового сообщения'
        });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete broadcast campaign
  app.delete('/api/broadcasts/:id', (req, res) => {
    try {
      const deleted = db.deleteBroadcast(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Рассылка не найдена' });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. ADMIN AUTH CHECK (Prepares for future Telegram ID gate)
  app.get('/api/admin/check-access', (req, res) => {
    const telegramUserId = req.query.telegram_user_id as string;
    const settings = db.getSettings();
    const adminIds = settings.admin_telegram_ids || [];

    // Current phase: Admin is open for testing by default
    const testingMode = true;

    const isAllowed = testingMode || !adminIds.length || (telegramUserId && adminIds.includes(telegramUserId));

    res.json({
      success: true,
      allowed: isAllowed,
      testingMode,
      configuredAdminCount: adminIds.length
    });
  });

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PARFUM.SELECTIVE] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
