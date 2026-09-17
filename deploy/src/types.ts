export interface ProductVariant {
  id: string;
  volume: string; // e.g. "2 мл", "5 мл", "10 мл", "100 мл"
  price: number; // e.g. 700, 1500, 2700
  old_price?: number; // e.g. 900 (temporary discount original price)
  is_available: boolean;
}

export type FragranceGender = 'men' | 'women' | 'unisex';

export type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'name_asc';

export interface Product {
  id: string;
  brand: string;
  name: string;
  description: string;
  direction: string; // e.g. "Минеральный, древесный, кожаный"
  notes: {
    top?: string[];
    heart?: string[];
    base?: string[];
    main: string[];
  };
  gender: FragranceGender;
  category: 'all' | 'decant' | 'bottles' | 'new';
  image_url: string;
  is_active: boolean;
  is_new?: boolean;
  is_popular?: boolean;
  is_special_offer?: boolean;
  discount_percent?: number; // e.g. 20 (for -20%)
  special_offer_badge?: string; // e.g. "-20%", "Спеццена"
  special_offer_ends_in?: string; // e.g. "до конца недели" or ISO string
  created_at: string;
  variants: ProductVariant[];
}

export interface CartItem {
  id: string; // unique cart item id: `${product.id}-${variant.id}`
  productId: string;
  productName: string;
  brand: string;
  variantId: string;
  volume: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export type OrderStatus = 'Новый' | 'Принят' | 'Собирается' | 'Готов' | 'Выдан' | 'Отменён';

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  brand: string;
  volume: string;
  quantity: number;
  price: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string; // "#1001"
  customer_name: string;
  customer_phone: string;
  customer_telegram?: string;
  comment?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  created_at: string;
  telegram_notified?: boolean;
  telegram_message_id?: number;
  telegram_group_message_id?: number;
}

export interface StoreSettings {
  id: string;
  telegram_bot_token?: string;
  telegram_bot_username?: string;
  telegram_recipient_id?: string; // Личный ID менеджера
  telegram_manager_name?: string;
  telegram_group_id?: string; // ID группы/чата команды (-100...)
  telegram_group_title?: string;
  telegram_notify_manager?: boolean; // Уведомления менеджеру в ЛС
  telegram_notify_group?: boolean; // Уведомления в группу
  telegram_notify_waitlist?: boolean; // Уведомления о листе ожидания
  telegram_connected: boolean;
  telegram_group_connected?: boolean;
  telegram_connection_code?: string;
  admin_telegram_ids?: string[];
  updated_at: string;
}

export interface AdminStats {
  totalOrders: number;
  newOrders: number;
  totalRevenue: number;
  totalProducts: number;
  outOfStockProducts: number;
}

export interface StorySlide {
  id: string;
  badge?: string; // e.g. "Хит продаж", "Новинка", "О распиве"
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  tag?: string; // e.g. "Marc-Antoine Barrois"
  notesPreview?: string[];
  priceFrom?: number;
  productId?: string;
  brandFilter?: string;
  categoryFilter?: string;
  ctaText?: string;
}

export interface Story {
  id: string;
  title: string; // Title shown under circle
  avatarUrl: string;
  badgeType?: 'flame' | 'sparkles' | 'award' | 'droplet';
  slides: StorySlide[];
}

export interface StockNotificationRequest {
  id: string;
  product_id: string;
  product_name: string;
  brand: string;
  variant_id: string;
  volume: string;
  price: number;
  customer_name: string;
  customer_contact: string; // phone, @telegram or email
  customer_telegram_id?: string;
  comment?: string;
  status: 'pending' | 'notified';
  created_at: string;
}

export interface BroadcastSubscriber {
  id: string;
  telegram_id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  phone?: string;
  source: 'telegram_bot' | 'order' | 'webapp_launch' | 'waitlist' | 'manual';
  orders_count: number;
  total_spent: number;
  is_active: boolean;
  created_at: string;
  last_active_at: string;
}

export type BroadcastAudience = 'all' | 'buyers' | 'waitlist' | 'custom';

export interface BroadcastCampaign {
  id: string;
  title: string;
  target_audience: BroadcastAudience;
  custom_telegram_ids?: string[];
  message_text: string;
  image_url?: string;
  button_text?: string;
  button_url?: string;
  status: 'draft' | 'sending' | 'completed' | 'failed';
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  error_log?: string[];
  created_at: string;
  sent_at?: string;
}

export interface BroadcastTemplate {
  id: string;
  name: string;
  category: string;
  title: string;
  message_text: string;
  image_url?: string;
  button_text?: string;
}

export type PromoCodeType = 'general' | 'unique' | 'registration';
export type DiscountType = 'percent' | 'fixed';

export interface PromoCode {
  id: string;
  code: string;
  type: PromoCodeType;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount?: number;
  expires_at?: string;
  max_uses?: number;
  times_used: number;
  assigned_to_telegram_id?: string;
  assigned_to_name?: string;
  is_active: boolean;
  created_at: string;
}


