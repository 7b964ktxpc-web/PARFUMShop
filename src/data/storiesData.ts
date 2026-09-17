import { Story } from '../types';

export const STORIES_DATA: Story[] = [
  {
    id: 'story-hits',
    title: 'Хиты',
    avatarUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=300&q=80',
    badgeType: 'flame',
    slides: [
      {
        id: 'hits-1',
        badge: 'Хит #1 в мире',
        tag: 'Marc-Antoine Barrois',
        title: 'Ganymede',
        subtitle: 'Минерально-кожаный шедевр',
        description: 'Легендарный аромат Квентина Биша. Утончённая светлая замша, космические минералы и шлейф, который невозможно забыть.',
        notesPreview: ['Минералы', 'Замша', 'Акигалавуд', 'Бессмертник'],
        priceFrom: 700,
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85',
        productId: 'prod-ganymede',
        ctaText: 'Смотреть Ganymede'
      },
      {
        id: 'hits-2',
        badge: 'Культовый шлейф',
        tag: 'Maison Francis Kurkdjian',
        title: 'Baccarat Rouge 540',
        subtitle: 'Амбровое сияние и шафран',
        description: 'Драгоценное звучание серой амбры, египетского жасмина грандифлорум и сладковато-смолистого кедра.',
        notesPreview: ['Шафран', 'Серая амбра', 'Жасмин', 'Кедр'],
        priceFrom: 850,
        imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85',
        productId: 'prod-baccarat-540',
        ctaText: 'Смотреть Baccarat'
      },
      {
        id: 'hits-3',
        badge: 'Любимец публики',
        tag: 'Byredo',
        title: 'Bal d’Afrique',
        subtitle: 'Теплый парижский авангард',
        description: 'Один из самых комплиментарных ароматов современности: солнечная календула, сочные цитрусы, фиалка и марокканский кедр.',
        notesPreview: ['Ветивер', 'Календула', 'Бергамот', 'Амбра'],
        priceFrom: 650,
        imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85',
        productId: 'prod-bal-dafrique',
        ctaText: 'Смотреть Bal d’Afrique'
      }
    ]
  },
  {
    id: 'story-new',
    title: 'Новинки',
    avatarUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=300&q=80',
    badgeType: 'sparkles',
    slides: [
      {
        id: 'new-1',
        badge: 'Новинка распива',
        tag: 'Kilian',
        title: 'Angels’ Share',
        subtitle: 'Коньячный восторг и пралине',
        description: 'Настоящая коньячная эссенция из дубовых бочек с пряной корицей, сливочной ванилью и тающим пралине.',
        notesPreview: ['Коньяк', 'Корица', 'Пралине', 'Дуб'],
        priceFrom: 800,
        imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=85',
        productId: 'prod-angels-share',
        ctaText: 'Смотреть Angels’ Share'
      },
      {
        id: 'new-2',
        badge: 'Стойкий бестселлер',
        tag: 'Nishane',
        title: 'Hacivat',
        subtitle: 'Ананас, сочный бергамот и мох',
        description: 'Супер-стойкий фруктово-шипровый экстракт. Искрящийся ананас с благородным терпким дубовым мхом.',
        notesPreview: ['Ананас', 'Дубовый мох', 'Бергамот', 'Кедр'],
        priceFrom: 700,
        imageUrl: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=900&q=85',
        productId: 'prod-hacivat',
        ctaText: 'Смотреть Hacivat'
      }
    ]
  },
  {
    id: 'story-byredo',
    title: 'Byredo',
    avatarUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=300&q=80',
    slides: [
      {
        id: 'byredo-1',
        badge: 'Культовый дом',
        tag: 'Стокгольм, Швеция',
        title: 'Эстетика Byredo',
        subtitle: 'Ароматы как воспоминания',
        description: 'Основанный Беном Горхэмом бренд создал новую парфюмерную эстетику — от хрустящей альдегидной чистоты до теплого ветивера.',
        notesPreview: ['Bal d’Afrique', 'Blanche', 'Gypsy Water'],
        imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85',
        brandFilter: 'Byredo',
        ctaText: 'Все ароматы Byredo'
      },
      {
        id: 'byredo-2',
        badge: 'Абсолютный фаворит',
        tag: 'Byredo',
        title: 'Bal d’Afrique',
        subtitle: 'Солнечная элегантность',
        description: 'Носите каждый день: тонкий, интеллигентный и безупречно сбалансированный шлейф.',
        notesPreview: ['Календула', 'Амбра', 'Ветивер', 'Лимон'],
        priceFrom: 650,
        imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85',
        productId: 'prod-bal-dafrique',
        ctaText: 'Выбрать объём от 2 мл'
      }
    ]
  },
  {
    id: 'story-lelabo',
    title: 'Le Labo',
    avatarUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=300&q=80',
    slides: [
      {
        id: 'lelabo-1',
        badge: 'Нью-Йоркская ниша',
        tag: 'Le Labo',
        title: 'Santal 33',
        subtitle: 'Аромат богемы и свободы',
        description: 'Австралийский сандал, сухой дым папируса, пудровый ирис и нотка дорогой кожи. Символ стиля во всем мире.',
        notesPreview: ['Сандал', 'Кардамон', 'Кожа', 'Ирис'],
        priceFrom: 750,
        imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85',
        productId: 'prod-santal-33',
        ctaText: 'Смотреть Santal 33'
      },
      {
        id: 'lelabo-2',
        badge: 'Молекулярная магия',
        tag: 'Le Labo',
        title: 'Another 13',
        subtitle: 'Гипнотичный парфюм-невидимка',
        description: 'Чистый амброксан, нежная сочная груша и мускус. Сливается с кожей и звучит чарующе при каждом движении.',
        notesPreview: ['Амброксан', 'Груша', 'Мускус', 'Жасмин'],
        priceFrom: 750,
        imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85',
        productId: 'prod-another-13',
        ctaText: 'Смотреть Another 13'
      }
    ]
  },
  {
    id: 'story-marly',
    title: 'Marly',
    avatarUrl: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=300&q=80',
    slides: [
      {
        id: 'marly-1',
        badge: 'Королевский шик',
        tag: 'Parfums de Marly',
        title: 'Delina',
        subtitle: 'Самая желанная роза',
        description: 'Нежнейший дуэт турецкой розы и сочного личи с кисло-сладким ревенем, ванилью и мягким шлейфом кашмерана.',
        notesPreview: ['Турецкая роза', 'Личи', 'Ревень', 'Кашмеран'],
        priceFrom: 800,
        imageUrl: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=900&q=85',
        productId: 'prod-delina',
        ctaText: 'Смотреть Delina'
      }
    ]
  },
  {
    id: 'story-about-decant',
    title: 'О распиве',
    avatarUrl: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=300&q=80',
    badgeType: 'droplet',
    slides: [
      {
        id: 'decant-1',
        badge: '100% Оригинальность',
        tag: 'Гарантия бутика',
        title: 'Только подлинные флаконы',
        subtitle: 'Никаких копий и подделок',
        description: 'Мы приобретаем парфюмерию исключительно у проверенных европейских дистрибьюторов. Любые батч-коды и фото флаконов предоставляем по запросу.',
        notesPreview: ['Только оригинал', 'Стеклянный флакон', 'Точный объем'],
        imageUrl: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=900&q=85',
        categoryFilter: 'decant',
        ctaText: 'Смотреть распив'
      },
      {
        id: 'decant-2',
        badge: 'Стерильный процесс',
        tag: 'Качественные атомайзеры',
        title: 'Идеальное распыление',
        subtitle: 'Атомайзеры с металлическим спреем',
        description: 'Отливанты набираются стерильным шприцем без контакта с воздухом. Стеклянные флаконы с металлическим спреем обеспечивают пышное мелкодисперсное облако.',
        notesPreview: ['Стеклянные атомайзеры', 'Металлический спрей', 'Герметично'],
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85',
        categoryFilter: 'decant',
        ctaText: 'Перейти в каталог распива'
      }
    ]
  }
];
