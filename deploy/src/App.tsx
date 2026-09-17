import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { SearchBar } from './components/SearchBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { NotifyStockModal } from './components/NotifyStockModal';
import { StoriesBar } from './components/StoriesBar';
import { StoryViewerModal } from './components/StoryViewerModal';
import { SpecialOffersSection } from './components/SpecialOffersSection';
import { StoriesBarSkeleton, SpecialOffersSectionSkeleton, ProductGridSkeleton } from './components/Skeletons';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SortSelect } from './components/SortSelect';
import { ShareModal } from './components/ShareModal';
import { Toast, ToastMessage } from './components/Toast';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProfileLayout } from './components/profile/ProfileLayout';
import { CartProvider, useCart } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Product, ProductVariant, Order, Story, SortOption } from './types';
import { initTelegramApp, triggerHaptic, getTelegramWebApp, getTelegramUser } from './lib/telegram';
import { buildProductShareData, buildStoreShareData, buildStoryShareData, ShareData } from './lib/share';
import { ShoppingBag, ArrowRight, Sparkles, Flame, Share2, Tag, Gift, Check, Copy, X } from 'lucide-react';

function StorefrontContent() {
  const [currentView, setCurrentView] = useState<'shop' | 'admin' | 'profile'>('shop');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStoriesLoading, setIsStoriesLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [activeStorySlide, setActiveStorySlide] = useState(0);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [stockNotifyProduct, setStockNotifyProduct] = useState<Product | null>(null);
  const [stockNotifyVariant, setStockNotifyVariant] = useState<ProductVariant | null>(null);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [registrationPromo, setRegistrationPromo] = useState<any | null>(null);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [copiedWelcomeCode, setCopiedWelcomeCode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('parfume_viewed_stories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { items, totalAmount, totalCount, setIsCartOpen } = useCart();

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ id: String(Date.now()), text, type });
    setTimeout(() => {
      setToast(prev => (prev?.text === text ? null : prev));
    }, 3000);
  };

  const handleShareStore = () => {
    triggerHaptic('light');
    const data = buildStoreShareData();
    setShareData(data);
    setIsShareModalOpen(true);
  };

  const handleShareProduct = (product: Product) => {
    triggerHaptic('light');
    const data = buildProductShareData(product);
    setShareData(data);
    setIsShareModalOpen(true);
  };

  const handleShareStory = (story: Story) => {
    triggerHaptic('light');
    const data = buildStoryShareData(story);
    setShareData(data);
    setIsShareModalOpen(true);
  };

  const handleMarkStoryViewed = (storyId: string) => {
    setViewedStoryIds((prev) => {
      if (prev.includes(storyId)) return prev;
      const updated = [...prev, storyId];
      try {
        localStorage.setItem('parfume_viewed_stories', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleOpenStockNotify = (product: Product, variant: ProductVariant) => {
    triggerHaptic('light');
    setStockNotifyProduct(product);
    setStockNotifyVariant(variant);
    setIsNotifyModalOpen(true);
  };

  // Initialize Telegram WebApp SDK
  useEffect(() => {
    initTelegramApp();

    // Auto-register Telegram user to subscriber database
    const tgUser = getTelegramUser();
    if (tgUser && tgUser.id) {
      fetch('/api/subscribers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: String(tgUser.id),
          first_name: tgUser.first_name || 'Клиент',
          last_name: tgUser.last_name,
          username: tgUser.username
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setIsAdmin(Boolean(data.isAdmin));
            if (data.promoCode) {
              const seenKey = `seen_promo_${data.promoCode.code}`;
              if (!localStorage.getItem(seenKey)) {
                setRegistrationPromo(data.promoCode);
                setShowWelcomeBanner(true);
              }
            }
          }
        })
        .catch(() => {});
    }

    // Setup Telegram BackButton when modal or cart or admin or share is opened
    const tg = getTelegramWebApp();
    if (tg?.BackButton) {
      const handleBack = () => {
        if (isNotifyModalOpen) {
          setIsNotifyModalOpen(false);
        } else if (isShareModalOpen) {
          setIsShareModalOpen(false);
        } else if (activeStory) {
          setActiveStory(null);
        } else if (selectedProduct) {
          setSelectedProduct(null);
        } else if (isCheckoutOpen) {
          setIsCheckoutOpen(false);
        } else if (currentView === 'admin') {
          setCurrentView('shop');
        }
      };

      if (isNotifyModalOpen || isShareModalOpen || activeStory || selectedProduct || isCheckoutOpen || currentView === 'admin') {
        tg.BackButton.show();
        tg.BackButton.onClick(handleBack);
      } else {
        tg.BackButton.hide();
      }

      return () => {
        tg.BackButton.offClick(handleBack);
      };
    }
  }, [isNotifyModalOpen, isShareModalOpen, activeStory, selectedProduct, isCheckoutOpen, currentView]);

  // Load products & stories from server
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error('Failed to fetch products', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStories = async () => {
    setIsStoriesLoading(true);
    try {
      const res = await fetch('/api/stories');
      const data = await res.json();
      if (data.success && Array.isArray(data.stories)) {
        setStories(data.stories);
      }
    } catch (e) {
      console.error('Failed to fetch stories', e);
    } finally {
      setIsStoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStories();
  }, []);

  // Abandoned cart notification
  useEffect(() => {
    if (items.length > 0) {
      const updatedAtStr = localStorage.getItem('parfum_cart_updated_at');
      const notifiedStr = localStorage.getItem('parfum_cart_abandoned_notified');
      
      if (updatedAtStr && !notifiedStr) {
        const updatedAt = parseInt(updatedAtStr, 10);
        // Using a 24-hour threshold
        const hours24 = 24 * 60 * 60 * 1000;
        
        if (Date.now() - updatedAt > hours24) {
          const timer = setTimeout(() => {
            showToast('У вас остались товары в корзине. Оформите заказ, пока они в наличии!', 'info');
            triggerHaptic('success');
            localStorage.setItem('parfum_cart_abandoned_notified', 'true');
          }, 3500);
          
          return () => clearTimeout(timer);
        }
      }
    }
  }, [items.length]);

  // Handle deep links from URL query / hash / Telegram start_param
  useEffect(() => {
    if (products.length === 0) return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash.replace('#', '');
      const hashParams = new URLSearchParams(hash);
      const tg = getTelegramWebApp();
      const startParam = tg?.initDataUnsafe?.start_param;

      const targetProductId = 
        urlParams.get('product') || 
        hashParams.get('product') || 
        (startParam && startParam.startsWith('prod_') ? startParam.replace('prod_', '') : null);

      if (targetProductId) {
        const found = products.find(p => p.id === targetProductId);
        if (found) {
          setSelectedProduct(found);
          showToast(`Открыт аромат: ${found.brand} — ${found.name}`, 'info');
        }
      }

      const targetStoryId = 
        urlParams.get('story') || 
        hashParams.get('story') || 
        (startParam && startParam.startsWith('story_') ? startParam.replace('story_', '') : null);

      if (targetStoryId && stories.length > 0) {
        const foundStory = stories.find(s => s.id === targetStoryId);
        if (foundStory) {
          setActiveStory(foundStory);
        }
      }
    } catch (e) {
      console.warn('Deep link parsing error:', e);
    }
  }, [products, stories]);

  // Filter and sort products locally for instantaneous snappy UI
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'decant') {
        list = list.filter(p =>
          p.variants.some(v => v.volume.includes('мл') && !v.volume.includes('флакон'))
        );
      } else if (selectedCategory === 'bottles') {
        list = list.filter(p => p.variants.some(v => v.volume.includes('флакон')));
      } else if (selectedCategory === 'popular') {
        list = list.filter(p => p.is_popular);
      } else if (selectedCategory === 'new') {
        list = list.filter(p => p.is_new);
      } else if (selectedCategory === 'men' || selectedCategory === 'women' || selectedCategory === 'unisex') {
        list = list.filter(
          p =>
            p.gender === selectedCategory ||
            (selectedCategory === 'men' && p.gender === 'unisex') ||
            (selectedCategory === 'women' && p.gender === 'unisex')
        );
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.direction.toLowerCase().includes(q) ||
          p.notes.main.some(n => n.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      const getMinPrice = (p: Product) => {
        const available = p.variants.filter(v => v.is_available);
        const vars = available.length > 0 ? available : p.variants;
        if (vars.length === 0) return 0;
        return Math.min(...vars.map(v => v.price));
      };

      if (sortBy === 'price_asc') {
        return getMinPrice(a) - getMinPrice(b);
      }
      if (sortBy === 'price_desc') {
        return getMinPrice(b) - getMinPrice(a);
      }
      if (sortBy === 'newest') {
        if (a.is_new && !b.is_new) return -1;
        if (!a.is_new && b.is_new) return 1;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name, 'ru');
      }
      // default / 'popular'
      if (a.is_popular && !b.is_popular) return -1;
      if (!a.is_popular && b.is_popular) return 1;
      return 0;
    });

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Curated collections
  const popularProducts = useMemo(() => {
    return products.filter(p => p.is_popular);
  }, [products]);

  const newProducts = useMemo(() => {
    return products.filter(p => p.is_new);
  }, [products]);

  const handleOrderSuccess = (order: Order) => {
    // Optionally refresh anything or trigger celebration
    triggerHaptic('success');
  };

  const handleSelectProductFromStory = (productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (p) {
      setSelectedProduct(p);
    }
  };

  const handleSelectBrandFromStory = (brand: string) => {
    setSearchQuery(brand);
    setSelectedCategory('all');
  };

  const handleSelectCategoryFromStory = (cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery('');
  };

  if (currentView === 'admin' && isAdmin) {
    return (
      <div className="min-h-screen bg-[#1e2029]">
        <Header currentView="admin" onViewChange={setCurrentView} isAdmin={isAdmin} />
        <AdminLayout
          onBackToShop={() => {
            setCurrentView('shop');
            fetchStories();
            fetchProducts();
          }}
          onPreviewStory={(story) => {
            setActiveStory(story);
            setActiveStorySlide(0);
            setCurrentView('shop');
          }}
        />
      </div>
    );
  }

  if (currentView === 'profile') {
    return (
      <div className="min-h-screen bg-[#1e2029] text-[#f4f4f5]">
        <Header currentView="profile" onViewChange={setCurrentView} isAdmin={isAdmin} />
        <ProfileLayout products={products} onOpenDetails={setSelectedProduct} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e2029] text-[#f4f4f5] flex flex-col selection:bg-[#c5a880] selection:text-black">
      {/* Header */}
      <Header 
        currentView="shop" 
        onViewChange={setCurrentView} 
        onShareStore={handleShareStore} 
        isAdmin={isAdmin}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto pt-2 pb-24 space-y-5">
        {/* Curated Subtitle / Banner */}
        <div className="px-4 pt-1 pb-0.5">
          <div className="flex items-center gap-2 text-[#c5a880] text-[11px] font-semibold uppercase tracking-[0.25em]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Селективные ароматы • Оригинальный распив</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1 tracking-tight">
            Коллекция нишевой парфюмерии
          </h1>
          <p className="text-xs text-[#8e8e93] mt-1 font-light leading-relaxed">
            Попробуйте культовые ароматы в удобных объёмах от 2 мл до полного флакона без долгих переписок.
          </p>
        </div>

        {/* Stories Horizontal Bar (Кружки с обложками) */}
        {isStoriesLoading && stories.length === 0 ? (
          <StoriesBarSkeleton />
        ) : (
          <StoriesBar
            stories={stories}
            onSelectStory={(story, slideIdx) => {
              setActiveStory(story);
              setActiveStorySlide(slideIdx || 0);
            }}
            viewedStoryIds={viewedStoryIds}
          />
        )}

        {/* Special Offers / Discounts Block */}
        {isLoading ? (
          <SpecialOffersSectionSkeleton />
        ) : (
          <SpecialOffersSection
            products={products}
            onOpenDetails={setSelectedProduct}
          />
        )}

        {/* Search Bar */}
        <div className="px-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Category Filters */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Catalog Grid */}
        <div className="px-4">
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5 text-xs text-[#71717a]">
            <div className="flex items-center gap-2">
              <span>
                Найдено: <strong className="text-white font-medium">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'аромат' : (filteredProducts.length >= 2 && filteredProducts.length <= 4) ? 'аромата' : 'ароматов'}
              </span>
              {(selectedCategory !== 'all' || searchQuery.trim() !== '' || sortBy !== 'popular') && (
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setSortBy('popular');
                  }}
                  className="text-[#c5a880] hover:underline cursor-pointer ml-1"
                >
                  Сбросить
                </button>
              )}
            </div>

            {/* Sort Menu */}
            <SortSelect
              currentSort={sortBy}
              onSortChange={setSortBy}
            />
          </div>

          {isLoading ? (
            <ProductGridSkeleton />
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#262835] border border-white/10 text-[#71717a]">
              <div className="font-serif text-lg text-white mb-1">Ничего не найдено</div>
              <p className="text-xs">Попробуйте изменить поисковый запрос или категорию</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white"
              >
                Показать все ароматы
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={prod => {
                    triggerHaptic('light');
                    setSelectedProduct(prod);
                  }}
                  onShare={handleShareProduct}
                  onNotifyStock={handleOpenStockNotify}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Info footer */}
        <div className="px-4 pt-8 border-t border-white/5 text-center text-xs text-[#52525b] space-y-1">
          <p className="font-serif tracking-widest text-[#71717a] uppercase text-[11px]">
            PARFUM.SELECTIVE
          </p>
          <p>100% оригинальная нишевая парфюмерия. Атомайзеры со спреем премиум-класса.</p>
        </div>
      </main>

      {/* Floating Bottom Bar for Mobile / iPhone / Telegram Thumb Navigation */}
      {totalCount > 0 && !isCheckoutOpen && !selectedProduct && !activeStory && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-[#1e2029] via-[#1e2029]/95 to-transparent">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => {
                triggerHaptic('medium');
                setIsCartOpen(true);
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#c5a880] hover:bg-[#d8bf9b] text-black font-semibold text-sm flex items-center justify-between shadow-xl shadow-black/60 active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-black/15 flex items-center justify-center font-bold text-xs">
                  {totalCount}
                </div>
                <span>В корзине</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold">{totalAmount.toLocaleString('ru-RU')} ₽</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <StoryViewerModal
        currentStory={activeStory}
        stories={stories}
        initialSlideIndex={activeStorySlide}
        onClose={() => setActiveStory(null)}
        onSelectProduct={handleSelectProductFromStory}
        onSelectBrand={handleSelectBrandFromStory}
        onSelectCategory={handleSelectCategoryFromStory}
        onMarkStoryViewed={handleMarkStoryViewed}
        onShareStory={handleShareStory}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onShare={handleShareProduct}
        onNotifyStock={handleOpenStockNotify}
      />

      <NotifyStockModal
        isOpen={isNotifyModalOpen}
        product={stockNotifyProduct}
        variant={stockNotifyVariant}
        onClose={() => setIsNotifyModalOpen(false)}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      <CartDrawer
        onProceedToCheckout={() => {
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        data={shareData}
        onClose={() => setIsShareModalOpen(false)}
        onToast={showToast}
      />

      {/* Welcome Registration Promo Banner / Modal */}
      {showWelcomeBanner && registrationPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#242532] border border-[#c5a880]/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#c5a880]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#c5a880]/10 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={() => {
                triggerHaptic('light');
                localStorage.setItem(`seen_promo_${registrationPromo.code}`, 'true');
                setShowWelcomeBanner(false);
              }}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 bg-[#c5a880]/20 border border-[#c5a880]/40 rounded-2xl flex items-center justify-center mx-auto text-[#c5a880]">
              <Gift className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] font-bold">
                Подарок за регистрацию
              </span>
              <h3 className="font-serif text-xl font-bold text-white">
                Скидка {registrationPromo.discount_value}% на первый заказ!
              </h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Мы рады приветствовать вас в нашем бутике. Ваш персональный разовый промокод готов к использованию:
              </p>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-2">
              <span className="font-mono text-base font-bold text-[#c5a880] tracking-wider">
                {registrationPromo.code}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(registrationPromo.code);
                  setCopiedWelcomeCode(true);
                  triggerHaptic('success');
                  showToast('Промокод скопирован в буфер обмена!', 'success');
                  setTimeout(() => setCopiedWelcomeCode(false), 2000);
                }}
                className="px-3 py-2 rounded-xl bg-[#c5a880] hover:bg-[#b59870] text-black font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                {copiedWelcomeCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWelcomeCode ? 'Скопировано' : 'Скопировать'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                triggerHaptic('select');
                localStorage.setItem(`seen_promo_${registrationPromo.code}`, 'true');
                setShowWelcomeBanner(false);
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#c5a880] hover:bg-[#b59870] text-black font-bold text-xs transition-all shadow-lg shadow-[#c5a880]/20"
            >
              Отлично, забрать подарок!
            </button>
          </div>
        </div>
      )}

      {/* Global Toast Feedback */}
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <FavoritesProvider>
      <CartProvider>
        <StorefrontContent />
      </CartProvider>
    </FavoritesProvider>
  );
}
