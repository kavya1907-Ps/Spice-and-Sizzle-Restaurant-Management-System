import React, { useState } from 'react';
import { ArrowRight, Plus, X } from 'lucide-react';
import { ALL_CATEGORIES, CATEGORY_DESCRIPTIONS } from '../data/sampleData';
import { FoodCategory, MenuItem } from '../types';
import { formatINRWhole } from '../utils/posUtils';
import { FoodImage } from '../components/FoodImage';

interface CategoriesViewProps {
  menuItems: MenuItem[];
  onOpenCategoryInMenu: (category: FoodCategory) => void;
  onAddNewDish: (dish: MenuItem) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  menuItems,
  onOpenCategoryInMenu,
  onAddNewDish,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState<FoodCategory>('South Indian');
  const [dishPrice, setDishPrice] = useState('160');
  const [dishIsVeg, setDishIsVeg] = useState(true);
  const [dishDesc, setDishDesc] = useState('');

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;
    const representative = menuItems.find((m) => m.category === dishCategory) || menuItems[0];
    const newItem: MenuItem = {
      id: `dish-custom-${Date.now()}`,
      name: dishName.trim(),
      category: dishCategory,
      price: Math.max(20, Number(dishPrice) || 150),
      isVeg: dishIsVeg,
      description:
        dishDesc.trim() ||
        `Freshly prepared house specialty from our ${dishCategory} kitchen.`,
      image: representative?.image || '',
      prepMinutes: 12,
      available: true,
      ordersToday: 1,
    };
    onAddNewDish(newItem);
    setDishName('');
    setDishDesc('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1618]">
            Menu Categories
          </h1>
          <p className="text-sm text-[#6E5C60] mt-1">
            Explore all 8 kitchen stations or add a new seasonal dish to the catalog
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5C1422] hover:bg-[#EA580C] text-white text-sm font-semibold transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Dish</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {ALL_CATEGORIES.map((category) => {
          const items = menuItems.filter((m) => m.category === category);
          const minPrice = items.length ? Math.min(...items.map((i) => i.price)) : 0;
          const maxPrice = items.length ? Math.max(...items.map((i) => i.price)) : 0;
          const coverImage = items[0]?.image || '';

          return (
            <button
              key={category}
              type="button"
              onClick={() => onOpenCategoryInMenu(category)}
              className="group bg-white rounded-2xl border border-[#E6DDD0] overflow-hidden text-left hover:border-[#C69214] hover:shadow-md transition-all duration-200 flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFE8DE]">
                <FoodImage
                  src={coverImage}
                  alt={category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                  <h2 className="font-display text-xl font-bold text-white">{category}</h2>
                  <span className="font-mono tabular-nums text-xs text-[#FCD34D] font-semibold">
                    {items.length} {items.length === 1 ? 'dish' : 'dishes'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <p className="text-xs text-[#6E5C60] leading-relaxed">
                  {CATEGORY_DESCRIPTIONS[category]}
                </p>

                <div className="pt-2.5 border-t border-[#F1EAE0] flex items-center justify-between text-xs">
                  <span className="font-mono tabular-nums font-semibold text-[#5C1422]">
                    {items.length > 0
                      ? minPrice === maxPrice
                        ? formatINRWhole(minPrice)
                        : `${formatINRWhole(minPrice)} – ${formatINRWhole(maxPrice)}`
                      : 'Empty'}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#EA580C] group-hover:translate-x-0.5 transition-transform">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Add Dish Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-[#E6DDD0] w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="font-display text-xl font-bold text-[#1F1618]">
                Add New Dish to Menu
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[#6E5C60] hover:bg-[#FAF6F0]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDish} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                  Dish Name
                </label>
                <input
                  type="text"
                  required
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="e.g., Chettinad Pepper Chicken"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] text-sm focus:outline-none focus:border-[#5C1422]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                    Category
                  </label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value as FoodCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E6DDD0] text-sm bg-white focus:outline-none focus:border-[#5C1422]"
                  >
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min={20}
                    required
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] text-sm font-mono tabular-nums focus:outline-none focus:border-[#5C1422]"
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                  Dietary Type
                </span>
                <div className="inline-flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDishIsVeg(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      dishIsVeg
                        ? 'bg-[#DCFCE7] border-[#15803D] text-[#15803D]'
                        : 'bg-white border-[#E6DDD0] text-[#6E5C60]'
                    }`}
                  >
                    Vegetarian
                  </button>
                  <button
                    type="button"
                    onClick={() => setDishIsVeg(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      !dishIsVeg
                        ? 'bg-[#FEE2E2] border-[#B91C1C] text-[#B91C1C]'
                        : 'bg-white border-[#E6DDD0] text-[#6E5C60]'
                    }`}
                  >
                    Non-Vegetarian
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                  placeholder="Aromatic spices, fresh ingredients..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] text-sm focus:outline-none focus:border-[#5C1422]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[#6E5C60] hover:bg-[#FAF6F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#D94E07] text-white text-sm font-semibold transition-colors"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
