import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types';
import { Plus, Edit2, Trash2, Check, X, Droplets, Image as ImageIcon, Percent, Sparkles, Flame } from 'lucide-react';
import { triggerHaptic } from '../../lib/telegram';

interface AdminProductsProps {
  products: Product[];
  onRefresh: () => void;
  onSaveProduct: (product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  onRefresh,
  onSaveProduct,
  onDeleteProduct
}) => {
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenAdd = () => {
    triggerHaptic('light');
    setEditingProduct({
      brand: '',
      name: '',
      description: '',
      direction: 'Древесный, фужерный',
      notes: {
        top: ['Бергамот'],
        heart: ['Кедр'],
        base: ['Амбра'],
        main: ['Бергамот', 'Кедр', 'Амбра']
      },
      gender: 'unisex',
      category: 'all',
      image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      is_active: true,
      is_new: true,
      is_popular: false,
      variants: [
        { id: 'v1', volume: '2 мл', price: 700, is_available: true },
        { id: 'v2', volume: '5 мл', price: 1500, is_available: true },
        { id: 'v3', volume: '10 мл', price: 2700, is_available: true }
      ]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    triggerHaptic('light');
    setEditingProduct({ ...prod });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.brand) {
      alert('Укажите название и бренд');
      return;
    }

    setIsSaving(true);
    triggerHaptic('medium');
    try {
      await onSaveProduct(editingProduct);
      setIsModalOpen(false);
      setEditingProduct(null);
      onRefresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Удалить аромат "${name}" из каталога?`)) {
      triggerHaptic('medium');
      await onDeleteProduct(id);
      onRefresh();
    }
  };

  const updateVariant = (index: number, updates: Partial<ProductVariant>) => {
    if (!editingProduct?.variants) return;
    const newVariants = [...editingProduct.variants];
    newVariants[index] = { ...newVariants[index], ...updates };
    setEditingProduct({ ...editingProduct, variants: newVariants });
  };

  const addVariant = () => {
    if (!editingProduct?.variants) return;
    const newVar: ProductVariant = {
      id: 'v-' + Date.now(),
      volume: '15 мл',
      price: 3500,
      is_available: true
    };
    setEditingProduct({
      ...editingProduct,
      variants: [...editingProduct.variants, newVar]
    });
  };

  const removeVariant = (index: number) => {
    if (!editingProduct?.variants) return;
    const newVariants = editingProduct.variants.filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, variants: newVariants });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-white">
          Каталог парфюмерии ({products.length})
        </h3>
        <button
          onClick={handleOpenAdd}
          className="px-3 py-2 rounded-xl bg-[#c5a880] hover:bg-[#d8bf9b] text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить парфюм</span>
        </button>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products.map(product => (
          <div
            key={product.id}
            className="p-3.5 rounded-2xl bg-[#262835] border border-white/10 flex gap-3 items-center justify-between"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-[#1e2029] overflow-hidden flex-shrink-0 border border-white/5">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-[#a1a1aa] block truncate">
                  {product.brand}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  <h4 className="font-serif text-sm font-bold text-white truncate">
                    {product.name}
                  </h4>
                  {product.is_special_offer && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {product.special_offer_badge || 'SALE'}
                    </span>
                  )}
                  {product.is_popular && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ХИТ
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#71717a] mt-0.5 truncate">
                  {product.variants.map(v => `${v.volume} (${v.price}₽${v.old_price ? ` / ~${v.old_price}₽` : ''})`).join(' • ')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => handleOpenEdit(product)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                title="Редактировать"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(product.id, product.name)}
                className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-[#71717a] hover:text-rose-400 transition-colors"
                title="Удалить"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-xl bg-[#242532] border border-white/10 rounded-2xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto smooth-scroll space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingProduct.id ? 'Редактировать аромат' : 'Новый парфюм'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#71717a] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              {/* Brand & Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] mb-1 font-medium">Бренд</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.brand || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    placeholder="Marc-Antoine Barrois"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] mb-1 font-medium">Название</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="Ganymede"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              {/* Direction & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a1aa] mb-1 font-medium">Направление аромата</label>
                  <input
                    type="text"
                    value={editingProduct.direction || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, direction: e.target.value })}
                    placeholder="Минеральный, кожаный"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] mb-1 font-medium">Пол</label>
                  <select
                    value={editingProduct.gender || 'unisex'}
                    onChange={e => setEditingProduct({ ...editingProduct, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#c5a880]"
                  >
                    <option value="unisex" className="bg-[#242532]">Унисекс</option>
                    <option value="men" className="bg-[#242532]">Мужской</option>
                    <option value="women" className="bg-[#242532]">Женский</option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-[#a1a1aa] mb-1 font-medium">Ссылка на фото (URL)</label>
                <input
                  type="text"
                  required
                  value={editingProduct.image_url || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#a1a1aa] mb-1 font-medium">Описание</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Краткое описание парфюма..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#c5a880] resize-none"
                />
              </div>

              {/* Main notes (comma separated) */}
              <div>
                <label className="block text-[#a1a1aa] mb-1 font-medium">
                  Основные ноты (через запятую)
                </label>
                <input
                  type="text"
                  value={editingProduct.notes?.main?.join(', ') || ''}
                  onChange={e => {
                    const notes = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setEditingProduct({
                      ...editingProduct,
                      notes: {
                        ...editingProduct.notes,
                        main: notes
                      }
                    });
                  }}
                  placeholder="Акигалавуд, Замша, Бессмертник"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              {/* Variants / Volumes / Prices */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[#c5a880] font-semibold uppercase tracking-wider text-[11px]">
                    Доступные объёмы и цены
                  </label>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="text-[11px] text-[#c5a880] hover:underline"
                  >
                    + Добавить объём
                  </button>
                </div>

                <div className="space-y-2">
                  {editingProduct.variants?.map((variant, idx) => (
                    <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white/[0.02] p-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[#71717a]">Объём:</span>
                        <input
                          type="text"
                          value={variant.volume}
                          onChange={e => updateVariant(idx, { volume: e.target.value })}
                          placeholder="2 мл"
                          className="w-20 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[#c5a880]">Цена:</span>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={e => updateVariant(idx, { price: Number(e.target.value) })}
                          placeholder="700"
                          className="w-20 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                        />
                        <span className="text-white text-xs">₽</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[#71717a]">Старая:</span>
                        <input
                          type="number"
                          value={variant.old_price || ''}
                          onChange={e => updateVariant(idx, { old_price: e.target.value ? Number(e.target.value) : undefined })}
                          placeholder="900"
                          className="w-20 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[#a1a1aa] text-xs"
                        />
                        <span className="text-[#71717a] text-xs">₽</span>
                      </div>
                      <label className="flex items-center gap-1.5 ml-auto text-[11px] text-[#a1a1aa] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={variant.is_available}
                          onChange={e => updateVariant(idx, { is_available: e.target.checked })}
                          className="rounded border-white/20"
                        />
                        <span>В наличии</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="text-[#71717a] hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges: New / Popular / Special Offer */}
              <div className="pt-2 border-t border-white/5 space-y-3">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-[#d4d4d8]">
                    <input
                      type="checkbox"
                      checked={editingProduct.is_special_offer || false}
                      onChange={e => setEditingProduct({ ...editingProduct, is_special_offer: e.target.checked })}
                    />
                    <span className="text-amber-400 font-medium">Специальное предложение (Скидка)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[#d4d4d8]">
                    <input
                      type="checkbox"
                      checked={editingProduct.is_popular || false}
                      onChange={e => setEditingProduct({ ...editingProduct, is_popular: e.target.checked })}
                    />
                    <span>Хит продаж</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[#d4d4d8]">
                    <input
                      type="checkbox"
                      checked={editingProduct.is_new || false}
                      onChange={e => setEditingProduct({ ...editingProduct, is_new: e.target.checked })}
                    />
                    <span>Новинка</span>
                  </label>
                </div>

                {editingProduct.is_special_offer && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                    <div>
                      <label className="block text-amber-300 mb-1">Бейдж скидки (текст)</label>
                      <input
                        type="text"
                        value={editingProduct.special_offer_badge || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, special_offer_badge: e.target.value })}
                        placeholder="-20%"
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-amber-500/30 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-300 mb-1">Длительность акции</label>
                      <input
                        type="text"
                        value={editingProduct.special_offer_ends_in || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, special_offer_ends_in: e.target.value })}
                        placeholder="до конца недели"
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-amber-500/30 rounded-lg text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#c5a880] hover:bg-[#d8bf9b] text-black font-semibold"
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
