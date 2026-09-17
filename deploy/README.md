# Parfum Selective - Telegram Mini App

Современное веб-приложение (Telegram Mini App) для выбора и заказа парфюмерной продукции. Приложение включает полноценный магазин, систему заказов, личный кабинет клиента и панель управления для администратора.

## 🚀 Основные возможности

- **Для клиентов:**
  - Просмотр каталога товаров с поиском и фильтрацией.
  - Система «Избранное» с синхронизацией и тактильной отдачей.
  - Корзина покупок и быстрое оформление заказа.
  - Личный кабинет: история заказов, персональные промокоды.
- **Для администраторов:**
  - Управление товарами и запасами.
  - Управление заказами и промокодами.
  - Публикация "Stories" и новостных рассылок.
  - Управление уведомлениями пользователей.

## 🛠 Технологический стек

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion (анимации), Lucide-React (иконки).
- **Backend:** Node.js, Express (TypeScript).
- **Интеграция:** Telegram WebApp SDK.
- **Хранение данных:** Локальная JSON-база (built-in), API-proxy для интеграции.
- **AI:** Google Gemini API (опционально).

## 📦 Структура проекта

```text
├── src/
│   ├── components/       # Компоненты UI (магазин, админка, профиль)
│   │   ├── admin/        # Панель администратора
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminOrders.tsx
│   │   │   ├── AdminProducts.tsx
│   │   │   ├── AdminPromoCodes.tsx
│   │   │   ├── AdminNotifications.tsx
│   │   │   ├── AdminStories.tsx
│   │   │   ├── AdminStockRequests.tsx
│   │   │   ├── AdminBroadcasts.tsx
│   │   │   └── AdminLayout.tsx
│   │   ├── profile/      # Личный кабинет
│   │   │   └── ProfileLayout.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── CheckoutModal.tsx
│   │   ├── Header.tsx
│   │   ├── NotifyStockModal.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductDetailModal.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ShareModal.tsx
│   │   ├── Skeletons.tsx
│   │   ├── SortSelect.tsx
│   │   ├── SpecialOffersSection.tsx
│   │   ├── StoriesBar.tsx
│   │   ├── StoryViewerModal.tsx
│   │   └── Toast.tsx
│   ├── context/          # Контексты React (Cart, Favorites)
│   ├── lib/              # Утилиты (Telegram SDK, Share, Haptics)
│   ├── data/             # Статические данные (Stories)
│   ├── types.ts          # Общие типы TypeScript
│   ├── App.tsx           # Основной компонент приложения
│   ├── main.tsx          # Точка входа
│   └── index.css         # Стили (Tailwind)
├── server/               # Backend модули
│   ├── db.ts             # Менеджер базы данных (JSON)
│   ├── seedData.ts       # Начальные данные товаров
│   └── telegram.ts       # Telegram бот интеграция
├── data/                 # JSON база данных
│   └── parfum_selective_db.json
├── server.ts             # Точка входа Express сервера
├── index.html            # HTML шаблон
├── package.json          # Зависимости и скрипты сборки
├── tsconfig.json         # TypeScript конфигурация
├── vite.config.ts        # Vite конфигурация
├── .env.example          # Шаблон переменных окружения
├── metadata.json         # Метаданные Telegram Mini App
├── Dockerfile            # Контейнеризация
├── docker-compose.yml    # Docker compose конфигурация
├── railway.toml          # Конфигурация для Railway
└── README.md             # Эта документация
```

## 📋 Быстрый старт

### 1. Клонирование
```bash
git clone https://github.com/7b964ktxpc-web/PARFUMShop.git
cd PARFUMShop
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка окружения
```bash
cp .env.example .env
# Отредактируйте .env с реальными значениями:
# - TELEGRAM_BOT_TOKEN
# - TELEGRAM_RECIPIENT_ID
# - TELEGRAM_GROUP_ID
# - ADMIN_TELEGRAM_IDS
```

### 4. Запуск в режиме разработки
```bash
npm run dev
```

### 5. Сборка для продакшена
```bash
npm run build
npm start
```

### 6. Очистка
```bash
npm run clean
```

## 📡 Telegram Mini App

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Установите переменные в `.env`:
   - `TELEGRAM_BOT_TOKEN` — токен от BotFather
   - `TELEGRAM_RECIPIENT_ID` — Telegram ID менеджера
   - `TELEGRAM_GROUP_ID` — ID группы для уведомлений (опционально)
   - `ADMIN_TELEGRAM_IDS` — список ID админов (через запятую)
3. Подключите бота к Mini App в настройках Telegram

## 🐳 Docker

```bash
docker build -t parfum-selective .
docker run -p 3000:3000 --env-file .env -v ./data:/app/data parfum-selective
```

## 🚢 Деплой

### Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Fly.io (бесплатно)
```bash
fly auth login
fly launch
fly deploy
```

### VPS (Oracle Cloud Always Free / Hetzner)
```bash
# Установка Node.js, PM2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Клонирование и запуск
git clone https://github.com/7b964ktxpc-web/PARFUMShop.git
cd PARFUMShop
npm install
cp .env.example .env
npm run build
sudo npm install -g pm2
pm2 start dist/server.cjs --name parfum-shop
pm2 save
pm2 startup
```

### GitHub Pages (фронтенд только)
Для развертывания только фронтенда используйте GitHub Pages с `npm run build`.

## 📁 Переменные окружения

| Переменная | Описание | Обязательно |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота | Да |
| `TELEGRAM_RECIPIENT_ID` | Личный ID менеджера | Да |
| `TELEGRAM_GROUP_ID` | ID группы для рассылок | Нет |
| `TELEGRAM_BOT_USERNAME` | Username бота | Нет |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Публичный username бота | Нет |
| `NEXT_PUBLIC_APP_URL` | URL приложения | Нет |
| `ADMIN_TELEGRAM_IDS` | ID админов (через запятую) | Нет |
| `GEMINI_API_KEY` | Ключ Gemini API | Нет |
| `APP_URL` | URL приложения | Нет |
| `SUPABASE_URL` | Supabase URL (опционально) | Нет |
| `SUPABASE_ANON_KEY` | Supabase anon key | Нет |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role | Нет |

## 🤖 Telegram WebApp SDK

Приложение работает внутри Telegram Mini App и использует [Telegram WebApp SDK](https://telegram.org/js/telegram-web-app.js). При запуске в обычном браузере используются безопасные fallbэки.

## 📝 Лицензия

Проприетарный код — PARFUM.SELECTIVE
