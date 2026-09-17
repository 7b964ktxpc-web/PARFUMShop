import React, { useState } from 'react';
import { Story, StorySlide, Product } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Flame,
  Award,
  Droplets,
  X,
  Check,
  RotateCcw,
  Eye,
  Link,
  Tag,
  Percent,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';
import { triggerHaptic } from '../../lib/telegram';

interface AdminStoriesProps {
  stories: Story[];
  products: Product[];
  onRefresh: () => void;
  onSaveStory: (story: Partial<Story>) => Promise<void>;
  onDeleteStory: (storyId: string) => Promise<void>;
  onResetStories: () => Promise<void>;
  onPreviewStory?: (story: Story) => void;
}

export const AdminStories: React.FC<AdminStoriesProps> = ({
  stories,
  products,
  onRefresh,
  onSaveStory,
  onDeleteStory,
  onResetStories,
  onPreviewStory
}) => {
  const [editingStory, setEditingStory] = useState<Partial<Story> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSlideTab, setActiveSlideTab] = useState(0);

  const getBadgeIcon = (type?: Story['badgeType']) => {
    switch (type) {
      case 'flame':
        return <Flame className="w-3 h-3 text-[#1a1105] fill-[#c5a880]" />;
      case 'sparkles':
        return <Sparkles className="w-3 h-3 text-[#1a1105]" />;
      case 'droplet':
        return <Droplets className="w-3 h-3 text-[#1a1105]" />;
      case 'award':
        return <Award className="w-3 h-3 text-[#1a1105]" />;
      default:
        return null;
    }
  };

  const handleOpenAdd = () => {
    triggerHaptic('light');
    const newStory: Partial<Story> = {
      title: 'Новая акция',
      avatarUrl: products[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80',
      badgeType: 'sparkles',
      slides: [
        {
          id: 'slide-' + Date.now(),
          badge: 'АКЦИЯ',
          title: 'Специальное предложение',
          subtitle: 'Выгодный распив нишевых ароматов',
          description: 'Заказывайте любимые культовые ароматы в удобных объёмах от 2 до 10 мл со скидкой.',
          imageUrl: products[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
          tag: 'Спецпредложение',
          notesPreview: ['100% Оригинал', 'Подарок к заказу', 'Быстрая отправка'],
          ctaText: 'Выбрать аромат'
        }
      ]
    };
    setEditingStory(newStory);
    setActiveSlideTab(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (story: Story) => {
    triggerHaptic('light');
    // Deep copy to prevent mutations before save
    setEditingStory(JSON.parse(JSON.stringify(story)));
    setActiveSlideTab(0);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Удалить историю "${title}" из шапки магазина?`)) {
      triggerHaptic('medium');
      await onDeleteStory(id);
      onRefresh();
    }
  };

  const handleReset = async () => {
    if (confirm('Сбросить все истории к исходному набору образцов (Хиты, Новинки, Byredo, Le Labo и др.)? Все текущие изменения будут заменены.')) {
      triggerHaptic('medium');
      await onResetStories();
      onRefresh();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory?.title?.trim()) {
      alert('Укажите название истории');
      return;
    }
    if (!editingStory.avatarUrl?.trim()) {
      alert('Укажите ссылку на обложку кружочка');
      return;
    }
    if (!editingStory.slides || editingStory.slides.length === 0) {
      alert('В истории должен быть хотя бы один слайд');
      return;
    }

    // Validate slides
    for (let i = 0; i < editingStory.slides.length; i++) {
      const s = editingStory.slides[i];
      if (!s.title?.trim()) {
        alert(`Укажите заголовок для слайда #${i + 1}`);
        setActiveSlideTab(i);
        return;
      }
      if (!s.imageUrl?.trim()) {
        alert(`Укажите фото для слайда #${i + 1}`);
        setActiveSlideTab(i);
        return;
      }
    }

    setIsSaving(true);
    triggerHaptic('medium');
    try {
      await onSaveStory(editingStory);
      setIsModalOpen(false);
      setEditingStory(null);
      onRefresh();
    } finally {
      setIsSaving(false);
    }
  };

  // Slide management helpers
  const handleAddSlide = () => {
    if (!editingStory?.slides) return;
    const newSlide: StorySlide = {
      id: 'slide-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      badge: 'НОВИНКА',
      title: 'Новый слайд',
      subtitle: '',
      description: 'Описание аромата или условия акции...',
      imageUrl: editingStory.avatarUrl || 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
      ctaText: 'Смотреть в каталоге'
    };
    const updated = [...editingStory.slides, newSlide];
    setEditingStory({ ...editingStory, slides: updated });
    setActiveSlideTab(updated.length - 1);
  };

  const handleRemoveSlide = (index: number) => {
    if (!editingStory?.slides || editingStory.slides.length <= 1) {
      alert('В истории должен оставаться хотя бы один слайд');
      return;
    }
    const updated = editingStory.slides.filter((_, i) => i !== index);
    setEditingStory({ ...editingStory, slides: updated });
    setActiveSlideTab(Math.max(0, index - 1));
  };

  const updateCurrentSlide = (updates: Partial<StorySlide>) => {
    if (!editingStory?.slides) return;
    const updated = [...editingStory.slides];
    updated[activeSlideTab] = { ...updated[activeSlideTab], ...updates };
    setEditingStory({ ...editingStory, slides: updated });
  };

  const handleAttachProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    updateCurrentSlide({
      productId: product.id,
      brandFilter: undefined,
      title: product.name,
      subtitle: `${product.brand} • ${product.direction}`,
      tag: product.brand,
      badge: product.is_popular ? 'ХИТ ПРОДАЖ' : product.is_new ? 'НОВИНКА' : 'АРОМАТ В НАЛИЧИИ',
      description: product.description,
      imageUrl: product.image_url,
      priceFrom: product.variants[0]?.price,
      notesPreview: product.notes.main.slice(0, 4),
      ctaText: `Смотреть ${product.name}`
    });
  };

  const currentSlide = editingStory?.slides?.[activeSlideTab];

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#262835] border border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[#c5a880] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Контент в шапке магазина</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1">
            Управление историями (Stories)
          </h2>
          <p className="text-xs text-[#8e8e93] mt-1 max-w-xl">
            Создавайте яркие кружочки вверху магазина: рассказывайте о промо-акциях,
            подборках брендов, новинках и правилах распива. Привязывайте ароматы для покупки в один клик.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#a1a1aa] hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Восстановить базовый набор историй"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Сбросить</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-xl bg-[#c5a880] hover:bg-[#d8bf9b] text-black text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-[#c5a880]/15 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить историю</span>
          </button>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.map((story) => (
          <div
            key={story.id}
            className="p-4 rounded-2xl bg-[#262835] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              {/* Header: Circle Avatar + Info */}
              <div className="flex items-start gap-3">
                {/* Story Circle Preview */}
                <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-[#c5a880] via-[#f7e7ce] to-[#8d6f46] shadow-md shadow-[#c5a880]/20 flex-shrink-0">
                  <div className="p-[2px] bg-[#1e2029] rounded-full">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-[#282a38] relative">
                      <img
                        src={story.avatarUrl}
                        alt={story.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  {story.badgeType && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#c5a880] border-2 border-[#1e2029] flex items-center justify-center">
                      {getBadgeIcon(story.badgeType)}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-bold text-white truncate">
                      {story.title}
                    </h3>
                  </div>
                  <div className="text-xs text-[#a1a1aa] mt-0.5">
                    {story.slides.length}{' '}
                    {story.slides.length === 1
                      ? 'слайд'
                      : story.slides.length < 5
                      ? 'слайда'
                      : 'слайдов'}
                  </div>

                  {story.badgeType && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#c5a880] font-medium mt-1">
                      {story.badgeType === 'flame' && '🔥 Хит продаж'}
                      {story.badgeType === 'sparkles' && '✨ Новинка'}
                      {story.badgeType === 'award' && '👑 Премиум'}
                      {story.badgeType === 'droplet' && '🧪 О распиве'}
                    </span>
                  )}
                </div>
              </div>

              {/* Slides Chips Preview */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] uppercase tracking-wider text-[#71717a] font-medium">
                  Слайды истории:
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {story.slides.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-4 h-4 rounded-full bg-black/40 text-[10px] flex items-center justify-center text-[#c5a880] flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-white truncate font-medium">{s.title}</span>
                      </div>
                      {s.productId && (
                        <span className="text-[10px] text-[#c5a880] px-1.5 py-0.5 rounded bg-[#c5a880]/10 flex-shrink-0">
                          Товар
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Bottom Bar */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2 mt-4">
              {onPreviewStory && (
                <button
                  onClick={() => onPreviewStory(story)}
                  className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#e4e4e7] flex items-center gap-1.5 transition-colors"
                  title="Просмотреть как в сторис"
                >
                  <Eye className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>Превью</span>
                </button>
              )}

              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => handleOpenEdit(story)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white hover:text-[#c5a880] transition-colors"
                  title="Редактировать историю"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(story.id, story.title)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/10 text-[#71717a] hover:text-rose-400 transition-colors"
                  title="Удалить историю"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT STORY MODAL */}
      {isModalOpen && editingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#242532] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-6 my-auto max-h-[92vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 flex-shrink-0">
              <div>
                <span className="text-xs font-semibold text-[#c5a880] uppercase tracking-wider">
                  Редактор историй
                </span>
                <h3 className="font-serif text-xl font-bold text-white mt-0.5">
                  {editingStory.id ? `Редактирование: ${editingStory.title}` : 'Создание новой истории'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-[#71717a] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* Story Circle Preview & Base Settings */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>Кружочек в шапке магазина</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title under circle */}
                  <div>
                    <label className="text-xs text-[#a1a1aa] block mb-1.5 font-medium">
                      Подпись под кружочком *
                    </label>
                    <input
                      type="text"
                      value={editingStory.title || ''}
                      onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                      placeholder="Например: Акции, Хит недели, Byredo"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>

                  {/* Badge selector */}
                  <div>
                    <label className="text-xs text-[#a1a1aa] block mb-1.5 font-medium">
                      Иконка бейджа на кружке
                    </label>
                    <select
                      value={editingStory.badgeType || ''}
                      onChange={(e) =>
                        setEditingStory({
                          ...editingStory,
                          badgeType: (e.target.value || undefined) as any
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e2029] border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                    >
                      <option value="" className="bg-[#1e2029]">Без бейджа</option>
                      <option value="flame" className="bg-[#1e2029]">🔥 Огонь (Хит продаж)</option>
                      <option value="sparkles" className="bg-[#1e2029]">✨ Искорка (Новинка / Акция)</option>
                      <option value="award" className="bg-[#1e2029]">👑 Корона (Эксклюзив)</option>
                      <option value="droplet" className="bg-[#1e2029]">🧪 Капля (Распив)</option>
                    </select>
                  </div>
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="text-xs text-[#a1a1aa] block mb-1.5 font-medium">
                    Ссылка на фото обложки (аватар кружочка) *
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="url"
                      value={editingStory.avatarUrl || ''}
                      onChange={(e) => setEditingStory({ ...editingStory, avatarUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      required
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                    />

                    {/* Circle preview */}
                    <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#c5a880] to-[#8d6f46] flex-shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden bg-black">
                        <img
                          src={editingStory.avatarUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Photo Presets from catalog */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2">
                    <span className="text-[10px] text-[#71717a] flex-shrink-0">Из каталога:</span>
                    {products.slice(0, 6).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setEditingStory({ ...editingStory, avatarUrl: p.image_url })}
                        className="w-6 h-6 rounded-full overflow-hidden border border-white/20 flex-shrink-0 hover:scale-110 transition-transform"
                        title={p.name}
                      >
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SLIDES MANAGER */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-base font-bold text-white">
                      Слайды истории ({editingStory.slides?.length || 0})
                    </h4>
                    <p className="text-xs text-[#8e8e93]">
                      Слайды показываются по очереди в полноэкранном окне при нажатии на кружочек
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSlide}
                    className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#c5a880] flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить слайд</span>
                  </button>
                </div>

                {/* Slides Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {editingStory.slides?.map((slide, idx) => (
                    <button
                      key={slide.id || idx}
                      type="button"
                      onClick={() => setActiveSlideTab(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 flex-shrink-0 transition-all ${
                        activeSlideTab === idx
                          ? 'bg-[#c5a880] text-black font-semibold shadow-md shadow-[#c5a880]/20'
                          : 'bg-white/5 text-[#a1a1aa] hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>Слайд {idx + 1}</span>
                      {editingStory.slides!.length > 1 && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSlide(idx);
                          }}
                          className="hover:text-rose-600 p-0.5"
                          title="Удалить слайд"
                        >
                          <X className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Active Slide Form Fields */}
                {currentSlide && (
                  <div className="p-4 rounded-2xl bg-[#1e2029] border border-white/10 space-y-4">
                    {/* Quick attach product dropdown */}
                    <div className="p-3 rounded-xl bg-black/40 border border-[#c5a880]/30 space-y-1.5">
                      <label className="text-xs font-semibold text-[#c5a880] flex items-center gap-1.5">
                        <Link className="w-3.5 h-3.5" />
                        <span>Быстро привязать аромат из каталога:</span>
                      </label>
                      <select
                        value={currentSlide.productId || ''}
                        onChange={(e) => handleAttachProduct(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#242532] border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                      >
                        <option value="">-- Выберите парфюм для автозаполнения --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.brand} • {p.name} ({p.variants[0]?.price} ₽)
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-[#71717a]">
                        При выборе аромата заголовок, фото, ноты, цена и кнопка перехода сформируются автоматически.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Slide Title */}
                      <div>
                        <label className="text-xs text-[#a1a1aa] block mb-1 font-medium">
                          Заголовок слайда *
                        </label>
                        <input
                          type="text"
                          value={currentSlide.title || ''}
                          onChange={(e) => updateCurrentSlide({ title: e.target.value })}
                          placeholder="Например: Скидка 20% на Ganymede"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>

                      {/* Subtitle */}
                      <div>
                        <label className="text-xs text-[#a1a1aa] block mb-1 font-medium">
                          Подзаголовок
                        </label>
                        <input
                          type="text"
                          value={currentSlide.subtitle || ''}
                          onChange={(e) => updateCurrentSlide({ subtitle: e.target.value })}
                          placeholder="Например: Только до конца недели"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Badge tag text */}
                      <div>
                        <label className="text-xs text-[#a1a1aa] block mb-1 font-medium">
                          Бейдж-лейбл
                        </label>
                        <input
                          type="text"
                          value={currentSlide.badge || ''}
                          onChange={(e) => updateCurrentSlide({ badge: e.target.value })}
                          placeholder="АКЦИЯ / ХИТ / СКИДКА"
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>

                      {/* Tag author */}
                      <div>
                        <label className="text-xs text-[#a1a1aa] block mb-1 font-medium">
                          Плашка бренда / автора
                        </label>
                        <input
                          type="text"
                          value={currentSlide.tag || ''}
                          onChange={(e) => updateCurrentSlide({ tag: e.target.value })}
                          placeholder="Marc-Antoine Barrois"
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>

                      {/* Price preview */}
                      <div>
                        <label className="text-xs text-[#a1a1aa] block mb-1 font-medium">
                          Цена от (₽, опционально)
                        </label>
                        <input
                          type="number"
                          value={currentSlide.priceFrom || ''}
                          onChange={(e) =>
                            updateCurrentSlide({
                              priceFrom: e.target.value ? Number(e.target.value) : undefined
                            })
                          }
                          placeholder="700"
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-xs text-[#a1a1aa] block mb-1 font-medium">
                        Текст описания акции или аромата
                      </label>
                      <textarea
                        rows={3}
                        value={currentSlide.description || ''}
                        onChange={(e) => updateCurrentSlide({ description: e.target.value })}
                        placeholder="Подробно расскажите об аромате или условиях специального предложения..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>

                    {/* Image URL */}
                    <div>
                      <label className="text-xs text-[#a1a1aa] block mb-1 font-medium">
                        Фото фона слайда (высокое разрешение) *
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="url"
                          value={currentSlide.imageUrl || ''}
                          onChange={(e) => updateCurrentSlide({ imageUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          required
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                        />
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                          <img
                            src={currentSlide.imageUrl}
                            alt="slide preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes preview chips */}
                    <div>
                      <label className="text-xs text-[#a1a1aa] block mb-1 font-medium">
                        Ключевые фишки / ноты (через запятую)
                      </label>
                      <input
                        type="text"
                        value={currentSlide.notesPreview?.join(', ') || ''}
                        onChange={(e) =>
                          updateCurrentSlide({
                            notesPreview: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean)
                          })
                        }
                        placeholder="Скидка 20%, Оригинал 100%, Подарок к заказу"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>

                    {/* Target Action Button */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="text-xs text-[#a1a1aa] block mb-1 font-medium">
                          Текст главной кнопки (CTA)
                        </label>
                        <input
                          type="text"
                          value={currentSlide.ctaText || ''}
                          onChange={(e) => updateCurrentSlide({ ctaText: e.target.value })}
                          placeholder="Смотреть аромат / Заказать по акции"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-[#a1a1aa] block mb-1 font-medium">
                          Или фильтр по категории / бренду
                        </label>
                        <select
                          value={currentSlide.categoryFilter || currentSlide.brandFilter || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'decant' || val === 'bottles' || val === 'new' || val === 'all') {
                              updateCurrentSlide({ categoryFilter: val, brandFilter: undefined });
                            } else if (val) {
                              updateCurrentSlide({ brandFilter: val, categoryFilter: undefined });
                            } else {
                              updateCurrentSlide({ categoryFilter: undefined, brandFilter: undefined });
                            }
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1c22] border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                        >
                          <option value="">Без фильтра (только товар или инфо)</option>
                          <option value="decant">Категория: Распив (отливанты)</option>
                          <option value="bottles">Категория: Полные флаконы</option>
                          <option value="new">Категория: Новинки</option>
                          <option value="Byredo">Бренд: Byredo</option>
                          <option value="Marc-Antoine Barrois">Бренд: Marc-Antoine Barrois</option>
                          <option value="Le Labo">Бренд: Le Labo</option>
                          <option value="Kilian">Бренд: Kilian</option>
                          <option value="Parfums de Marly">Бренд: Parfums de Marly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3 sticky bottom-0 bg-[#141418] pb-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl hover:bg-white/10 text-xs font-medium text-[#a1a1aa] transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-5 rounded-xl bg-[#c5a880] hover:bg-[#d8bf9b] text-black text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-[#c5a880]/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Сохранение...' : 'Сохранить историю'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
