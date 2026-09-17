import { Product } from '../src/types';

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-ganymede',
    brand: 'Marc-Antoine Barrois',
    name: 'Ganymede',
    description: 'Культовый минерально-кожаный аромат от Квентина Биша. Элегантная замша, минеральные ноты и сияющий аккорд бессмертника.',
    direction: 'Минеральный, кожаный, древесный',
    notes: {
      top: ['Мандарин', 'Шафран'],
      heart: ['Фиалка', 'Османтус'],
      base: ['Акигалавуд', 'Бессмертник', 'Замша'],
      main: ['Акигалавуд', 'Замша', 'Бессмертник', 'Минералы']
    },
    gender: 'unisex',
    category: 'all',
    image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    is_new: false,
    is_popular: true,
    is_special_offer: true,
    discount_percent: 20,
    special_offer_badge: '-20%',
    special_offer_ends_in: 'до конца недели',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    variants: [
      { id: 'v1', volume: '2 мл', price: 600, old_price: 750, is_available: true },
      { id: 'v2', volume: '5 мл', price: 1280, old_price: 1600, is_available: true },
      { id: 'v3', volume: '10 мл', price: 2350, old_price: 2900, is_available: true },
      { id: 'v4', volume: '100 мл (флакон)', price: 21900, old_price: 24500, is_available: true }
    ]
  },
  {
    id: 'prod-bal-dafrique',
    brand: 'Byredo',
    name: 'Bal d’Afrique',
    description: 'Теплый, романтический вихрь африканской календулы, черного янтаря, бергамота и марокканского кедра.',
    direction: 'Цитрусовый, древесный, амбровый',
    notes: {
      top: ['Бергамот', 'Лимон', 'Нероли', 'Календула'],
      heart: ['Фиалка', 'Лепестки жасмина', 'Цикламен'],
      base: ['Черная амбра', 'Мускус', 'Ветивер', 'Кедр'],
      main: ['Ветивер', 'Календула', 'Амбра', 'Бергамот']
    },
    gender: 'unisex',
    category: 'all',
    image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    is_new: false,
    is_popular: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    variants: [
      { id: 'v1', volume: '2 мл', price: 650, is_available: true },
      { id: 'v2', volume: '5 мл', price: 1400, is_available: true },
      { id: 'v3', volume: '10 мл', price: 2500, is_available: true },
      { id: 'v4', volume: '50 мл (флакон)', price: 19800, is_available: true }
    ]
  },
  {
    id: 'prod-baccarat-540',
    brand: 'Maison Francis Kurkdjian',
    name: 'Baccarat Rouge 540',
    description: 'Великолепное сияние амброво-древесного бриза. Воздушные ноты жасмина и пряный шафран сплетаются с кедровой древесиной.',
    direction: 'Амбровый, древесный, сладковатый',
    notes: {
      top: ['Шафран', 'Горький миндаль'],
      heart: ['Египетский жасмин Грандифлорум', 'Кедр'],
      base: ['Серая амбра', 'Древесный мускус'],
      main: ['Шафран', 'Серая амбра', 'Кедр', 'Жасмин']
    },
    gender: 'unisex',
    category: 'all',
    image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    is_new: false,
    is_popular: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    variants: [
      { id: 'v1', volume: '2 мл', price: 850, is_available: true },
      { id: 'v2', volume: '5 мл', price: 1900, is_available: true },
      { id: 'v3', volume: '10 мл', price: 3400, is_available: true },
      { id: 'v4', volume: '70 мл (флакон)', price: 34000, is_available: false }
    ]
  },
  {
    id: 'prod-angels-share',
    brand: 'Kilian',
    name: 'Angels’ Share',
    description: 'Аромат коньяка в дубовых бочках, приправленный корицей, бобами тонка, пралине и сливочной ванилью.',
    direction: 'Восточный, гурманский, пряный',
    notes: {
      top: ['Коньячная эссенция'],
      heart: ['Корица', 'Бобы тонка', 'Абсолют дуба'],
      base: ['Пралине', 'Ваниль', 'Сандал'],
      main: ['Коньяк', 'Корица', 'Пралине', 'Дуб']
    },
    gender: 'unisex',
    category: 'all',
    image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    is_new: true,
    is_popular: true,
    is_special_offer: true,
    discount_percent: 15,
    special_offer_badge: '-15%',
    special_offer_ends_in: 'только сегодня',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    variants: [
      { id: 'v1', volume: '2 мл', price: 680, old_price: 800, is_available: true },
      { id: 'v2', volume: '5 мл', price: 1530, old_price: 1800, is_available: true },
      { id: 'v3', volume: '10 мл', price: 2720, old_price: 3200, is_available: true },
      { id: 'v4', volume: '50 мл (флакон)', price: 24900, old_price: 27900, is_available: true }
    ]
  },
  {
    id: 'prod-santal-33',
    brand: 'Le Labo',
    name: 'Santal 33',
    description: 'Ода американскому Дикому Западу. Древесный дым, кардамон, фиалка, папирус и роскошный австралийский сандал.',
    direction: 'Древесный, кожаный, фужерный',
    notes: {
      top: ['Кардамон', 'Фиалка'],
      heart: ['Ирис', 'Папирус', 'Амброксан'],
      base: ['Кедр', 'Кожа', 'Сандал'],
      main: ['Сандал', 'Кардамон', 'Кожа', 'Ирис']
    },
    gender: 'unisex',
    category: 'all',
    image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    is_new: false,
    is_popular: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    variants: [
      { id: 'v1', volume: '2 мл', price: 750, is_available: true },
      { id: 'v2', volume: '5 мл', price: 1650, is_available: true },
      { id: 'v3', volume: '10 мл', price: 2950, is_available: true },
      { id: 'v4', volume: '100 мл (флакон)', price: 31000, is_available: true }
    ]
  },
  {
    id: 'prod-hacivat',
    brand: 'Nishane',
    name: 'Hacivat',
    description: 'Искрящийся ананас, сочный бергамот и терпкий дубовый мох. Невероятный шлейф и стойкость на весь день.',
    direction: 'Шипровый, фруктовый, свежий',
    notes: {
      top: ['Бергамот', 'Ананас', 'Грейпфрут'],
      heart: ['Жасмин', 'Пачули', 'Кедр'],
      base: ['Ясный дубовый мох', 'Древесные ноты'],
      main: ['Ананас', 'Дубовый мох', 'Бергамот', 'Кедр']
    },
    gender: 'men',
    category: 'all',
    image_url: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    is_new: false,
    is_popular: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    variants: [
      { id: 'v1', volume: '2 мл', price: 700, is_available: true },
      { id: 'v2', volume: '5 мл', price: 1550, is_available: true },
      { id: 'v3', volume: '10 мл', price: 2800, is_available: true },
      { id: 'v4', volume: '50 мл (флакон)', price: 22000, is_available: true }
    ]
  },
  {
    id: 'prod-philosykos',
    brand: 'Diptyque',
    name: 'Philosykos',
    description: 'Настоящее средиземноморское солнце в тени инжирного дерева: зеленые хрустящие листья, молочный сок плодов и белое дерево.',
    direction: 'Зеленый, древесный, фруктовый',
    notes: {
      top: ['Лист инжира', 'Свежий инжир'],
      heart: ['Зеленые ноты', 'Кокос'],
      base: ['Инжирное дерево', 'Кедр', 'Древесные ноты'],
      main: ['Инжир', 'Зеленый лист', 'Кокосовое молоко', 'Кедр']
    },
    gender: 'unisex',
    category: 'all',
    image_url: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    is_new: false,
    is_popular: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    variants: [
      { id: 'v1', volume: '2 мл', price: 600, is_available: true },
      { id: 'v2', volume: '5 мл', price: 1300, is_available: true },
      { id: 'v3', volume: '10 мл', price: 2300, is_available: true },
      { id: 'v4', volume: '100 мл (флакон)', price: 18500, is_available: true }
    ]
  },
  {
    id: 'prod-delina',
    brand: 'Parfums de Marly',
    name: 'Delina',
    description: 'Чувственный цветочный букет из турецкой розы, ландыша и пиона, оттененный кислинкой личи, ревеня и мускуса.',
    direction: 'Цветочный, фруктовый, свежий',
    notes: {
      top: ['Ревень', 'Личи', 'Бергамот'],
      heart: ['Турецкая роза', 'Пион', 'Ваниль'],
      base: ['Кашмеран', 'Белый мускус', 'Ладан'],
      main: ['Турецкая роза', 'Личи', 'Ревень', 'Кашмеран']
    },
    gender: 'women',
    category: 'all',
    image_url: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    is_new: false,
    is_popular: true,
    is_special_offer: true,
    discount_percent: 25,
    special_offer_badge: '-25%',
    special_offer_ends_in: 'до воскресенья',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
    variants: [
      { id: 'v1', volume: '2 мл', price: 600, old_price: 800, is_available: true },
      { id: 'v2', volume: '5 мл', price: 1390, old_price: 1850, is_available: true },
      { id: 'v3', volume: '10 мл', price: 2475, old_price: 3300, is_available: true },
      { id: 'v4', volume: '75 мл (флакон)', price: 26500, old_price: 29500, is_available: true }
    ]
  },
  {
    id: 'prod-another-13',
    brand: 'Le Labo',
    name: 'Another 13',
    description: 'Гипнотичный, чистый синтетический нектар с амброксаном, жасмином и мхом. Аромат-невидимка, притягивающий комплименты.',
    direction: 'Амбровый, мускусный, молекулярный',
    notes: {
      top: ['Груша', 'Цитрусовые аккорды'],
      heart: ['Амброксан', 'Салицилаты', 'Жасмин'],
      base: ['Изо-е-супер', 'Мох', 'Амбретта'],
      main: ['Амброксан', 'Груша', 'Мускус', 'Мох']
    },
    gender: 'unisex',
    category: 'all',
    image_url: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    is_new: true,
    is_popular: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    variants: [
      { id: 'v1', volume: '2 мл', price: 750, is_available: true },
      { id: 'v2', volume: '5 мл', price: 1700, is_available: true },
      { id: 'v3', volume: '10 мл', price: 3100, is_available: true },
      { id: 'v4', volume: '100 мл (флакон)', price: 32000, is_available: true }
    ]
  },
  {
    id: 'prod-gris-charnel',
    brand: 'BDK Parfums',
    name: 'Gris Charnel',
    description: 'Бархатистый урбанистический шедевр: инжир, черный чай, кардамон и бурбонский ветивер в кремовой дымке сандала.',
    direction: 'Пряный, древесный, пудровый',
    notes: {
      top: ['Инжир', 'Черный чай', 'Эссенция кардамона'],
      heart: ['Абсолют ириса', 'Бурбонский ветивер'],
      base: ['Сандал из Индии', 'Бобы тонка'],
      main: ['Черный чай', 'Инжир', 'Сандал', 'Кардамон']
    },
    gender: 'unisex',
    category: 'all',
    image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    is_new: false,
    is_popular: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    variants: [
      { id: 'v1', volume: '2 мл', price: 700, is_available: true },
      { id: 'v2', volume: '5 мл', price: 1600, is_available: true },
      { id: 'v3', volume: '10 мл', price: 2900, is_available: true },
      { id: 'v4', volume: '100 мл (флакон)', price: 23500, is_available: true }
    ]
  },
  {
    id: 'prod-bois-imperial',
    brand: 'Essential Parfums',
    name: 'Bois Impérial',
    description: 'Свежеизмельченные пряные листья тайского базилика в сочетании со сверкающим грейпфрутом и благородным акигалавудом.',
    direction: 'Древесный, фужерный, пряный',
    notes: {
      top: ['Тайский базилик', 'Грейпфрут', 'Сычуаньский перец'],
      heart: ['Гаитянский ветивер', 'Петалиа'],
      base: ['Акигалавуд', 'Пачули из Индонезии', 'Амброксан'],
      main: ['Акигалавуд', 'Базилик', 'Ветивер', 'Перец']
    },
    gender: 'unisex',
    category: 'all',
    image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    is_new: true,
    is_popular: true,
    is_special_offer: true,
    discount_percent: 15,
    special_offer_badge: '-15%',
    special_offer_ends_in: 'спеццена',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    variants: [
      { id: 'v1', volume: '2 мл', price: 425, old_price: 500, is_available: true },
      { id: 'v2', volume: '5 мл', price: 935, old_price: 1100, is_available: true },
      { id: 'v3', volume: '10 мл', price: 1615, old_price: 1900, is_available: true },
      { id: 'v4', volume: '100 мл (флакон)', price: 10900, old_price: 12500, is_available: true }
    ]
  },
  {
    id: 'prod-guidance',
    brand: 'Amouage',
    name: 'Guidance',
    description: 'Ошеломляющий шедевр Квентина Биша: груша, ладан, фундук, османтус, шафран и теплая сливочная ваниль.',
    direction: 'Цветочный, фруктовый, амбровый',
    notes: {
      top: ['Груша', 'Ладан', 'Фундук'],
      heart: ['Шафран', 'Роза', 'Жасмин самбак', 'Османтус'],
      base: ['Лабданум', 'Сандал', 'Акигалавуд', 'Серая амбра', 'Ваниль'],
      main: ['Фундук', 'Груша', 'Ладан', 'Османтус']
    },
    gender: 'women',
    category: 'all',
    image_url: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    is_new: true,
    is_popular: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    variants: [
      { id: 'v1', volume: '2 мл', price: 900, is_available: true },
      { id: 'v2', volume: '5 мл', price: 2100, is_available: true },
      { id: 'v3', volume: '10 мл', price: 3800, is_available: true },
      { id: 'v4', volume: '100 мл (флакон)', price: 39500, is_available: true }
    ]
  }
];
