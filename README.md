# PARFUM.SELECTIVE — Нишевая парфюмерия и Telegram Mini App

## Описание
Премиальный нишевый парфюмерный магазин и Telegram Mini App с распивом, корзиной и прямыми Telegram-уведомлениями для продавца.

## Стек
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion
- **Backend**: Express + TypeScript (tsx)
- **Database**: Local JSON file (built-in persistent DB)
- **Bot**: Telegram Bot API
- **AI**: Google Gemini API (optional)

## Установка

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
Скопировать `.env.example` в `.env` и заполнить:
```bash
cp .env.example .env
# Редактировать .env с реальными значениями
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

## Деплой

### Railway (рекомендуется)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Docker
```bash
docker build -t parfum-selective .
docker run -p 3000:3000 --env-file .env parfum-selective
```

### VPS (Ubuntu/Debian)
```bash
# Установка Node.js, PM2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Клонирование и запуск
git clone ...
cd PARFUMShop
npm install
cp .env.example .env
npm run build
pm2 start dist/server.cjs --name parfum-shop
pm2 save
pm2 startup
```

## Структура проекта
```
├── src/           # React frontend
│   ├── components/ # UI компоненты
│   ├── context/   # React контексты (Cart, Favorites)
│   ├── lib/       # Утилиты (Telegram SDK, Share)
│   └── types.ts   # TypeScript типы
├── server/        # Backend модули (DB, Telegram, Seed)
├── data/          # JSON база данных
├── server.ts      # Точка входа Express сервера
├── vite.config.ts # Vite конфигурация
└── package.json   # Зависимости и скрипты
```

## Telegram Mini App
- Подключите бота через @BotFather
- Установите `TELEGRAM_BOT_TOKEN`, `TELEGRAM_RECIPIENT_ID` в `.env`
- Откройте Mini App в Telegram

## Лицензия
Проприетарный код — PARFUM.SELECTIVE
