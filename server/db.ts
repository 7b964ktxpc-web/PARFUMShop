import fs from 'fs';
import path from 'path';
import {
  Product,
  Order,
  StoreSettings,
  OrderStatus,
  AdminStats,
  Story,
  StockNotificationRequest,
  BroadcastSubscriber,
  BroadcastCampaign,
  PromoCode
} from '../src/types';
import { SEED_PRODUCTS } from './seedData';
import { STORIES_DATA } from '../src/data/storiesData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'parfum_selective_db.json');

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
  lastOrderSequence: number;
  stories: Story[];
  stockNotifications: StockNotificationRequest[];
  subscribers: BroadcastSubscriber[];
  broadcasts: BroadcastCampaign[];
  promoCodes: PromoCode[];
}

const DEFAULT_SETTINGS: StoreSettings = {
  id: 'default',
  telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN || '',
  telegram_bot_username: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || process.env.TELEGRAM_BOT_USERNAME || 'PARFUM_SELECTIVEBOT',
  telegram_recipient_id: process.env.TELEGRAM_RECIPIENT_ID || '',
  telegram_manager_name: '',
  telegram_group_id: process.env.TELEGRAM_GROUP_ID || '',
  telegram_group_title: '',
  telegram_notify_manager: true,
  telegram_notify_group: true,
  telegram_notify_waitlist: true,
  telegram_connected: Boolean(process.env.TELEGRAM_RECIPIENT_ID),
  telegram_group_connected: Boolean(process.env.TELEGRAM_GROUP_ID),
  telegram_connection_code: 'PARFUM_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
  admin_telegram_ids: (process.env.ADMIN_TELEGRAM_IDS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
  updated_at: new Date().toISOString(),
};

class DBManager {
  private data: DatabaseSchema | null = null;

  constructor() {
    this.ensureDataFile();
  }

  private ensureDataFile(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        let shouldSave = false;
        if (!this.data || !Array.isArray(this.data.stories) || this.data.stories.length === 0) {
          this.data = {
            ...this.data!,
            stories: STORIES_DATA
          };
          shouldSave = true;
        }

        if (!this.data || !Array.isArray(this.data.stockNotifications)) {
          this.data = {
            ...this.data!,
            stockNotifications: [
              {
                id: 'notify-demo-1',
                product_id: 'prod-lost-cherry',
                product_name: 'Lost Cherry',
                brand: 'Tom Ford',
                variant_id: 'v1',
                volume: '2 мл',
                price: 900,
                customer_name: 'Елена',
                customer_contact: '@elena_style',
                status: 'pending',
                created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
              }
            ]
          };
          shouldSave = true;
        }

        if (!this.data || !Array.isArray(this.data.subscribers)) {
          this.data = {
            ...this.data!,
            subscribers: [
              {
                id: 'sub-1',
                telegram_id: '123456789',
                first_name: 'Алексей',
                username: 'alex_parfum',
                phone: '+7 999 123-45-67',
                source: 'order',
                orders_count: 2,
                total_spent: 5600,
                is_active: true,
                created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
                last_active_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
              },
              {
                id: 'sub-2',
                telegram_id: '987654321',
                first_name: 'Елена',
                username: 'elena_style',
                source: 'waitlist',
                orders_count: 0,
                total_spent: 0,
                is_active: true,
                created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
                last_active_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
              },
              {
                id: 'sub-3',
                telegram_id: '554433221',
                first_name: 'Мария',
                username: 'maria_niche',
                phone: '+7 916 555-44-33',
                source: 'webapp_launch',
                orders_count: 1,
                total_spent: 3400,
                is_active: true,
                created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
                last_active_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
              }
            ]
          };
          shouldSave = true;
        }

        if (!this.data || !Array.isArray(this.data.broadcasts)) {
          this.data = {
            ...this.data!,
            broadcasts: [
              {
                id: 'bc-demo-1',
                title: 'Закрытый анонс: Новинки Tom Ford и Byredo в распиве',
                target_audience: 'all',
                message_text: '✨ <b>Новое поступление селективной парфюмерии!</b>\n\nМы пополнили коллекцию легендарными ароматами в распиве:\n• <b>Tom Ford Lost Cherry</b> (от 900 ₽)\n• <b>Byredo Bal d’Afrique</b> (от 650 ₽)\n• <b>Marc-Antoine Barrois Ganymede</b> (от 700 ₽)\n\n🎁 <i>При заказе от 4 000 ₽ — фирменный пробник 2 мл в подарок!</i>',
                image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
                button_text: '🛒 Открыть витрину новинок',
                button_url: '',
                status: 'completed',
                total_recipients: 3,
                sent_count: 3,
                failed_count: 0,
                created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
                sent_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
              }
            ]
          };
          shouldSave = true;
        }

        if (!this.data || !Array.isArray(this.data.promoCodes)) {
          this.data = {
            ...this.data!,
            promoCodes: [
              {
                id: 'promo-1',
                code: 'SELECTIVE15',
                type: 'general',
                discount_type: 'percent',
                discount_value: 15,
                min_order_amount: 3000,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
                max_uses: 100,
                times_used: 12,
                is_active: true,
                created_at: new Date().toISOString()
              },
              {
                id: 'promo-2',
                code: 'WELCOME',
                type: 'registration',
                discount_type: 'percent',
                discount_value: 10,
                min_order_amount: 0,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
                max_uses: 0,
                times_used: 45,
                is_active: true,
                created_at: new Date().toISOString()
              },
              {
                id: 'promo-3',
                code: 'BDAY-LUBA-777',
                type: 'unique',
                discount_type: 'fixed',
                discount_value: 1000,
                min_order_amount: 2000,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
                max_uses: 1,
                times_used: 0,
                assigned_to_telegram_id: '123456789',
                assigned_to_name: 'Люба',
                is_active: true,
                created_at: new Date().toISOString()
              }
            ]
          };
          shouldSave = true;
        }

        // Sync special offers & old_price into existing products if not present
        if (this.data && Array.isArray(this.data.products)) {
          const seedMap = new Map(SEED_PRODUCTS.map(p => [p.id, p]));
          this.data.products = this.data.products.map(prod => {
            const seed = seedMap.get(prod.id);
            if (seed) {
              return {
                ...prod,
                is_special_offer: prod.is_special_offer ?? seed.is_special_offer,
                discount_percent: prod.discount_percent ?? seed.discount_percent,
                special_offer_badge: prod.special_offer_badge ?? seed.special_offer_badge,
                special_offer_ends_in: prod.special_offer_ends_in ?? seed.special_offer_ends_in,
                variants: prod.variants.map(v => {
                  const seedVar = seed.variants.find(sv => sv.id === v.id || sv.volume === v.volume);
                  return {
                    ...v,
                    old_price: v.old_price ?? seedVar?.old_price
                  };
                })
              };
            }
            return prod;
          });
          shouldSave = true;
        }

        // Ensure settings defaults
        if (this.data && (!this.data.settings || !this.data.settings.telegram_bot_username)) {
          this.data.settings = {
            ...DEFAULT_SETTINGS,
            ...(this.data.settings || {}),
            telegram_bot_username: (this.data.settings && this.data.settings.telegram_bot_username) || 'PARFUM_SELECTIVEBOT',
            telegram_notify_manager: this.data.settings?.telegram_notify_manager ?? true,
            telegram_notify_group: this.data.settings?.telegram_notify_group ?? true,
            telegram_notify_waitlist: this.data.settings?.telegram_notify_waitlist ?? true
          };
          shouldSave = true;
        }

        if (this.data && !this.data.promoCodes) {
          this.data.promoCodes = [
            {
              id: 'promo-welcome-10',
              code: 'WELCOME',
              type: 'registration',
              discount_type: 'percent',
              discount_value: 10,
              min_order_amount: 0,
              expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              max_uses: 1,
              times_used: 0,
              is_active: true,
              created_at: new Date().toISOString()
            }
          ];
          shouldSave = true;
        }

        if (shouldSave) {
          this.save();
        }
      } else {
        this.data = {
          products: SEED_PRODUCTS,
          orders: [
            {
              id: 'ord-demo-1001',
              order_number: '#1001',
              customer_name: 'Алексей',
              customer_phone: '+7 999 123-45-67',
              customer_telegram: '@alex_parfum',
              comment: 'Пожалуйста, упакуйте для подарка',
              items: [
                {
                  id: 'item-1',
                  product_id: 'prod-ganymede',
                  product_name: 'Ganymede',
                  brand: 'Marc-Antoine Barrois',
                  volume: '5 мл',
                  price: 1500,
                  quantity: 1,
                  image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'
                },
                {
                  id: 'item-2',
                  product_id: 'prod-bal-dafrique',
                  product_name: 'Bal d’Afrique',
                  brand: 'Byredo',
                  volume: '2 мл',
                  price: 650,
                  quantity: 2,
                  image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
                }
              ],
              total: 2800,
              status: 'Принят',
              created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              telegram_notified: true
            }
          ],
          settings: DEFAULT_SETTINGS,
          lastOrderSequence: 1001,
          stories: STORIES_DATA,
          stockNotifications: [],
          subscribers: [],
          broadcasts: [],
          promoCodes: [
            {
              id: 'promo-welcome-10',
              code: 'WELCOME',
              type: 'registration',
              discount_type: 'percent',
              discount_value: 10,
              min_order_amount: 0,
              expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              max_uses: 1,
              times_used: 0,
              is_active: true,
              created_at: new Date().toISOString()
            },
            {
              id: 'promo-general-15',
              code: 'SELECTIVE15',
              type: 'general',
              discount_type: 'percent',
              discount_value: 15,
              min_order_amount: 2000,
              expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
              max_uses: 50,
              times_used: 3,
              is_active: true,
              created_at: new Date().toISOString()
            }
          ]
        };
        this.save();
      }
    } catch (e) {
      console.error('Error loading database:', e);
      this.data = {
        products: SEED_PRODUCTS,
        orders: [],
        settings: DEFAULT_SETTINGS,
        lastOrderSequence: 1000,
        stories: STORIES_DATA,
        stockNotifications: [],
        subscribers: [],
        broadcasts: [],
        promoCodes: []
      };
    }
    return this.data!;
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save DB file:', e);
    }
  }

  public getProducts(category?: string, search?: string, gender?: string): Product[] {
    const db = this.ensureDataFile();
    let list = [...db.products];

    if (category && category !== 'all') {
      if (category === 'decant') {
        list = list.filter(p => p.variants.some(v => v.volume.includes('мл') && !v.volume.includes('флакон')));
      } else if (category === 'bottles') {
        list = list.filter(p => p.variants.some(v => v.volume.includes('флакон')));
      } else if (category === 'new') {
        list = list.filter(p => p.is_new);
      } else if (category === 'men' || category === 'women' || category === 'unisex') {
        list = list.filter(p => p.gender === category || (category === 'men' && p.gender === 'unisex') || (category === 'women' && p.gender === 'unisex'));
      }
    }

    if (gender && gender !== 'all') {
      list = list.filter(p => p.gender === gender);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.direction.toLowerCase().includes(q) ||
          p.notes.main.some(n => n.toLowerCase().includes(q))
      );
    }

    return list;
  }

  public getProduct(id: string): Product | undefined {
    const db = this.ensureDataFile();
    return db.products.find(p => p.id === id);
  }

  public createProduct(data: Omit<Product, 'id' | 'created_at'>): Product {
    const db = this.ensureDataFile();
    const newProduct: Product = {
      ...data,
      id: 'prod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString()
    };
    db.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const db = this.ensureDataFile();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    db.products[index] = { ...db.products[index], ...updates };
    this.save();
    return db.products[index];
  }

  public deleteProduct(id: string): boolean {
    const db = this.ensureDataFile();
    const before = db.products.length;
    db.products = db.products.filter(p => p.id !== id);
    if (db.products.length !== before) {
      this.save();
      return true;
    }
    return false;
  }

  public getOrders(): Order[] {
    const db = this.ensureDataFile();
    return [...db.orders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getOrder(idOrNumber: string): Order | undefined {
    const db = this.ensureDataFile();
    return db.orders.find(o => o.id === idOrNumber || o.order_number === idOrNumber || o.order_number === `#${idOrNumber}`);
  }

  public createOrder(orderData: {
    customer_name: string;
    customer_phone: string;
    customer_telegram?: string;
    comment?: string;
    items: Order['items'];
    total: number;
  }): Order {
    const db = this.ensureDataFile();
    db.lastOrderSequence = (db.lastOrderSequence || 1000) + 1;
    const orderNumber = `#${db.lastOrderSequence}`;

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      order_number: orderNumber,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      customer_telegram: orderData.customer_telegram,
      comment: orderData.comment,
      items: orderData.items,
      total: orderData.total,
      status: 'Новый',
      created_at: new Date().toISOString(),
      telegram_notified: false
    };

    db.orders.unshift(newOrder);

    // Auto register/update subscriber
    if (orderData.customer_telegram || orderData.customer_phone) {
      try {
        this.upsertSubscriber({
          telegram_id: orderData.customer_telegram?.replace('@', '') || '',
          first_name: orderData.customer_name || 'Клиент',
          username: orderData.customer_telegram,
          phone: orderData.customer_phone,
          source: 'order',
          spent_delta: orderData.total,
          add_order: true
        });
      } catch (e) {
        console.error('Error auto-registering subscriber from order:', e);
      }
    }

    this.save();
    return newOrder;
  }

  public updateOrderStatus(idOrNumber: string, status: OrderStatus): Order | null {
    const db = this.ensureDataFile();
    const order = db.orders.find(
      o => o.id === idOrNumber || o.order_number === idOrNumber || o.order_number === `#${idOrNumber.replace('#', '')}`
    );
    if (!order) return null;

    order.status = status;
    this.save();
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | null {
    const db = this.ensureDataFile();
    const order = db.orders.find(o => o.id === id);
    if (!order) return null;

    Object.assign(order, updates);
    this.save();
    return order;
  }

  public getSettings(): StoreSettings {
    const db = this.ensureDataFile();
    return db.settings;
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    const db = this.ensureDataFile();
    const newRecipientId = updates.telegram_recipient_id !== undefined ? updates.telegram_recipient_id : db.settings.telegram_recipient_id;
    const newGroupId = updates.telegram_group_id !== undefined ? updates.telegram_group_id : db.settings.telegram_group_id;

    db.settings = {
      ...db.settings,
      ...updates,
      updated_at: new Date().toISOString(),
      telegram_connected: Boolean(newRecipientId && newRecipientId.trim()),
      telegram_group_connected: Boolean(newGroupId && newGroupId.trim())
    };
    this.save();
    return db.settings;
  }

  public getStats(): AdminStats {
    const db = this.ensureDataFile();
    const orders = db.orders;
    const products = db.products;

    const totalOrders = orders.length;
    const newOrders = orders.filter(o => o.status === 'Новый').length;
    const totalRevenue = orders
      .filter(o => o.status !== 'Отменён')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalProducts = products.length;
    const outOfStockProducts = products.filter(
      p => !p.is_active || p.variants.every(v => !v.is_available)
    ).length;

    return {
      totalOrders,
      newOrders,
      totalRevenue,
      totalProducts,
      outOfStockProducts
    };
  }

  // Stories Management
  public getStories(): Story[] {
    const db = this.ensureDataFile();
    return db.stories || [];
  }

  public getStory(id: string): Story | undefined {
    const db = this.ensureDataFile();
    return (db.stories || []).find(s => s.id === id);
  }

  public createStory(storyData: Omit<Story, 'id'>): Story {
    const db = this.ensureDataFile();
    if (!db.stories) db.stories = [];
    const newStory: Story = {
      ...storyData,
      id: 'story-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
    };
    db.stories.push(newStory);
    this.save();
    return newStory;
  }

  public updateStory(id: string, updates: Partial<Story>): Story | null {
    const db = this.ensureDataFile();
    if (!db.stories) db.stories = [];
    const index = db.stories.findIndex(s => s.id === id);
    if (index === -1) return null;

    db.stories[index] = { ...db.stories[index], ...updates };
    this.save();
    return db.stories[index];
  }

  public deleteStory(id: string): boolean {
    const db = this.ensureDataFile();
    if (!db.stories) return false;
    const before = db.stories.length;
    db.stories = db.stories.filter(s => s.id !== id);
    if (db.stories.length !== before) {
      this.save();
      return true;
    }
    return false;
  }

  public resetStories(): Story[] {
    const db = this.ensureDataFile();
    db.stories = JSON.parse(JSON.stringify(STORIES_DATA));
    this.save();
    return db.stories;
  }

  // Stock Notifications (Waitlist)
  public getStockNotifications(): StockNotificationRequest[] {
    const db = this.ensureDataFile();
    return db.stockNotifications || [];
  }

  public createStockNotification(
    data: Omit<StockNotificationRequest, 'id' | 'created_at' | 'status'>
  ): StockNotificationRequest {
    const db = this.ensureDataFile();
    if (!db.stockNotifications) db.stockNotifications = [];

    const newRequest: StockNotificationRequest = {
      ...data,
      id: 'notify-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    db.stockNotifications.unshift(newRequest);
    this.save();
    return newRequest;
  }

  public updateStockNotificationStatus(
    id: string,
    status: 'pending' | 'notified'
  ): StockNotificationRequest | null {
    const db = this.ensureDataFile();
    if (!db.stockNotifications) return null;
    const req = db.stockNotifications.find(n => n.id === id);
    if (!req) return null;

    req.status = status;
    this.save();
    return req;
  }

  public deleteStockNotification(id: string): boolean {
    const db = this.ensureDataFile();
    if (!db.stockNotifications) return false;
    const before = db.stockNotifications.length;
    db.stockNotifications = db.stockNotifications.filter(n => n.id !== id);
    if (db.stockNotifications.length !== before) {
      this.save();
      return true;
    }
    return false;
  }

  // ==========================================
  // BROADCASTS & SUBSCRIBERS (РАССЫЛКИ)
  // ==========================================

  public getSubscribers(): BroadcastSubscriber[] {
    const db = this.ensureDataFile();
    return db.subscribers || [];
  }

  public getSubscriber(id: string): BroadcastSubscriber | undefined {
    const db = this.ensureDataFile();
    return (db.subscribers || []).find(s => s.id === id || s.telegram_id === id);
  }

  public upsertSubscriber(params: {
    telegram_id: string;
    first_name: string;
    last_name?: string;
    username?: string;
    phone?: string;
    source?: BroadcastSubscriber['source'];
    spent_delta?: number;
    add_order?: boolean;
  }): BroadcastSubscriber {
    const db = this.ensureDataFile();
    if (!db.subscribers) db.subscribers = [];

    const cleanTgId = String(params.telegram_id).trim();
    const existingIndex = db.subscribers.findIndex(
      s => s.telegram_id === cleanTgId || (params.username && s.username && s.username.toLowerCase() === params.username.toLowerCase().replace('@', ''))
    );

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = db.subscribers[existingIndex];
      const updated: BroadcastSubscriber = {
        ...existing,
        telegram_id: cleanTgId || existing.telegram_id,
        first_name: params.first_name || existing.first_name,
        last_name: params.last_name !== undefined ? params.last_name : existing.last_name,
        username: params.username ? params.username.replace('@', '') : existing.username,
        phone: params.phone || existing.phone,
        orders_count: existing.orders_count + (params.add_order ? 1 : 0),
        total_spent: existing.total_spent + (params.spent_delta || 0),
        last_active_at: now,
        is_active: true
      };
      db.subscribers[existingIndex] = updated;
      this.save();
      return updated;
    } else {
      const newSub: BroadcastSubscriber = {
        id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        telegram_id: cleanTgId,
        first_name: params.first_name || 'Клиент',
        last_name: params.last_name,
        username: params.username ? params.username.replace('@', '') : undefined,
        phone: params.phone,
        source: params.source || 'webapp_launch',
        orders_count: params.add_order ? 1 : 0,
        total_spent: params.spent_delta || 0,
        is_active: true,
        created_at: now,
        last_active_at: now
      };
      db.subscribers.unshift(newSub);
      this.save();
      return newSub;
    }
  }

  public updateSubscriber(id: string, updates: Partial<BroadcastSubscriber>): BroadcastSubscriber | null {
    const db = this.ensureDataFile();
    if (!db.subscribers) return null;
    const sub = db.subscribers.find(s => s.id === id);
    if (!sub) return null;
    Object.assign(sub, updates);
    this.save();
    return sub;
  }

  public deleteSubscriber(id: string): boolean {
    const db = this.ensureDataFile();
    if (!db.subscribers) return false;
    const before = db.subscribers.length;
    db.subscribers = db.subscribers.filter(s => s.id !== id);
    if (db.subscribers.length !== before) {
      this.save();
      return true;
    }
    return false;
  }

  public getBroadcasts(): BroadcastCampaign[] {
    const db = this.ensureDataFile();
    return [...(db.broadcasts || [])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getBroadcast(id: string): BroadcastCampaign | undefined {
    const db = this.ensureDataFile();
    return (db.broadcasts || []).find(b => b.id === id);
  }

  public createBroadcast(
    data: Omit<BroadcastCampaign, 'id' | 'created_at' | 'sent_count' | 'failed_count' | 'status'>
  ): BroadcastCampaign {
    const db = this.ensureDataFile();
    if (!db.broadcasts) db.broadcasts = [];

    const newBroadcast: BroadcastCampaign = {
      ...data,
      id: 'bc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      status: 'draft',
      sent_count: 0,
      failed_count: 0,
      created_at: new Date().toISOString()
    };

    db.broadcasts.unshift(newBroadcast);
    this.save();
    return newBroadcast;
  }

  public updateBroadcast(id: string, updates: Partial<BroadcastCampaign>): BroadcastCampaign | null {
    const db = this.ensureDataFile();
    if (!db.broadcasts) return null;
    const broadcast = db.broadcasts.find(b => b.id === id);
    if (!broadcast) return null;

    Object.assign(broadcast, updates);
    this.save();
    return broadcast;
  }

  public deleteBroadcast(id: string): boolean {
    const db = this.ensureDataFile();
    if (!db.broadcasts) return false;
    const before = db.broadcasts.length;
    db.broadcasts = db.broadcasts.filter(b => b.id !== id);
    if (db.broadcasts.length !== before) {
      this.save();
      return true;
    }
    return false;
  }

  public getPromoCodes(): PromoCode[] {
    const db = this.ensureDataFile();
    return [...(db.promoCodes || [])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getPromoCode(id: string): PromoCode | undefined {
    const db = this.ensureDataFile();
    return (db.promoCodes || []).find(p => p.id === id);
  }

  public getPromoCodeByCode(code: string): PromoCode | undefined {
    const db = this.ensureDataFile();
    const clean = code.trim().toUpperCase();
    return (db.promoCodes || []).find(p => p.code.trim().toUpperCase() === clean);
  }

  public createPromoCode(
    data: Omit<PromoCode, 'id' | 'times_used' | 'created_at'>
  ): PromoCode {
    const db = this.ensureDataFile();
    if (!db.promoCodes) db.promoCodes = [];

    const newPromo: PromoCode = {
      ...data,
      code: data.code.trim().toUpperCase(),
      id: 'promo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      times_used: 0,
      created_at: new Date().toISOString()
    };

    db.promoCodes.unshift(newPromo);
    this.save();
    return newPromo;
  }

  public updatePromoCode(id: string, updates: Partial<PromoCode>): PromoCode | null {
    const db = this.ensureDataFile();
    if (!db.promoCodes) return null;
    const promo = db.promoCodes.find(p => p.id === id);
    if (!promo) return null;

    if (updates.code) {
      updates.code = updates.code.trim().toUpperCase();
    }

    Object.assign(promo, updates);
    this.save();
    return promo;
  }

  public deletePromoCode(id: string): boolean {
    const db = this.ensureDataFile();
    if (!db.promoCodes) return false;
    const before = db.promoCodes.length;
    db.promoCodes = db.promoCodes.filter(p => p.id !== id);
    if (db.promoCodes.length !== before) {
      this.save();
      return true;
    }
    return false;
  }

  public getOrCreateRegistrationPromoCode(telegramId: string, name: string): PromoCode {
    const db = this.ensureDataFile();
    if (!db.promoCodes) db.promoCodes = [];

    const existing = db.promoCodes.find(
      p => p.type === 'registration' && p.assigned_to_telegram_id === String(telegramId)
    );
    if (existing) {
      return existing;
    }

    const uniqueCode = 'GIFT-' + String(telegramId).slice(-4) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newPromo: PromoCode = {
      id: 'promo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      code: uniqueCode,
      type: 'registration',
      discount_type: 'percent',
      discount_value: 10,
      min_order_amount: 0,
      expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      max_uses: 1,
      times_used: 0,
      assigned_to_telegram_id: String(telegramId),
      assigned_to_name: name || 'Клиент',
      is_active: true,
      created_at: new Date().toISOString()
    };

    db.promoCodes.unshift(newPromo);
    this.save();
    return newPromo;
  }
}

export const db = new DBManager();
