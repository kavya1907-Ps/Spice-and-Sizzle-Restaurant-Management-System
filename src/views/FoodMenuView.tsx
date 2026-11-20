import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  UtensilsCrossed,
} from 'lucide-react';
import { ALL_CATEGORIES } from '../data/sampleData';
import { CartItem, FoodCategory, MenuItem } from '../types';
import { formatINRWhole } from '../utils/posUtils';
import { FoodImage } from '../components/FoodImage';
import { VegNonVegBadge } from '../components/VegNonVegBadge';

interface FoodMenuViewProps {
  menuItems: MenuItem[];
  cart: CartItem[];
  selectedCategory: FoodCategory | 'All';
  onSelectCategory: (cat: FoodCategory | 'All') => void;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQty: (menuItemId: string, delta: number) => void;
  onGoToOrder: () => void;
}

export const FoodMenuView: React.FC<FoodMenuViewProps> = ({
  menuItems,
  cart,
  selectedCategory,
  onSelectCategory,
  onAddToCart,
  onUpdateQty,
  onGoToOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'nonveg'>('all');

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesDiet =
        dietFilter === 'all' ||
        (dietFilter === 'veg' && item.isVeg) ||
        (dietFilter === 'nonveg' && !item.isVeg);
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCat && matchesDiet && matchesSearch;
    });
  }, [menuItems, selectedCategory, dietFilter, searchQuery]);

  const cartQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((c) => map.set(c.menuItem.id, c.quantity));
    return map;
  }, [cart]);

  const totalCartItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalCartSubtotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1618]">
            Culinary Food Menu
          </h1>
          <p className="text-sm text-[#6E5C60] mt-1">
            Select authentic dishes across South Indian, North Indian, Biryani &amp; more
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A7579] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dosa, biryani, naan..."
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E6DDD0] text-sm text-[#1F1618] placeholder:text-[#9E8B8F] focus:outline-none focus:border-[#5C1422]"
            />
          </div>

          {/* Dietary Filter */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#EFE8DE] self-start">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'veg', label: 'Veg Only' },
                { id: 'nonveg', label: 'Non-Veg' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDietFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  dietFilter === tab.id
                    ? 'bg-white text-[#5C1422] shadow-xs'
                    : 'text-[#6E5C60] hover:text-[#1F1618]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['All', ...ALL_CATEGORIES] as const).map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 border ${
                isActive
                  ? 'bg-[#5C1422] text-white border-[#5C1422] shadow-xs'
                  : 'bg-white text-[#5A494C] border-[#E6DDD0] hover:border-[#C69214]/60 hover:text-[#1F1618]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E6DDD0] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF6F0] border border-[#E6DDD0] flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-6 h-6 text-[#5C1422]" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#1F1618]">
            No dishes match your current filter
          </h3>
          <p className="text-sm text-[#6E5C60] mt-1 max-w-md mx-auto">
            Try clearing your search term or switching back to all culinary categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setDietFilter('all');
              onSelectCategory('All');
            }}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#5C1422] hover:bg-[#EA580C] text-white text-sm font-semibold transition-colors"
          >
            Reset Menu Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const qtyInCart = cartQtyMap.get(item.id) || 0;
            return (
              <article
                key={item.id}
                className="group bg-white rounded-2xl border border-[#E6DDD0] overflow-hidden flex flex-col hover:border-[#C69214]/70 hover:shadow-md transition-all duration-200"
              >
                {/* Large Food Photograph */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#EFE8DE]">
                  <FoodImage
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white font-medium">
                    <span>{item.category}</span>
                    <span className="tabular-nums">~{item.prepMinutes} min</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <VegNonVegBadge isVeg={item.isVeg} />
                        <h3 className="font-semibold text-base text-[#1F1618] truncate">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs text-[#6E5C60] mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#F1EAE0]">
                    <span className="font-mono tabular-nums text-lg font-bold text-[#5C1422]">
                      {formatINRWhole(item.price)}
                    </span>

                    {qtyInCart === 0 ? (
                      <button
                        type="button"
                        onClick={() => onAddToCart(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#D94E07] text-white text-xs font-semibold transition-colors whitespace-nowrap shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1 rounded-xl bg-[#FAF6F0] border border-[#5C1422]/25 p-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-[#F5E8EB] text-[#5C1422] flex items-center justify-center transition-colors"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-mono tabular-nums text-xs font-bold text-[#1F1618]">
                          {qtyInCart}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-[#5C1422] hover:bg-[#EA580C] text-white flex items-center justify-center transition-colors"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Floating Cart Action Bar when items exist */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-5 right-5 left-5 lg:left-[288px] z-20 flex justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-2xl rounded-2xl bg-[#171315] text-white px-5 py-3.5 shadow-xl border border-[#D4AF37]/35 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#5C1422] flex items-center justify-center shrink-0">
                <ShoppingCart className="w-4 h-4 text-[#F3D078]" />
              </div>
              <div>
                <p className="text-sm font-semibold tabular-nums">
                  {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} in order tray
                </p>
                <p className="text-xs text-[#C8B9BD] font-mono tabular-nums">
                  Subtotal {formatINRWhole(totalCartSubtotal)} + GST
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onGoToOrder}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#D94E07] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <span>Review &amp; Place Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
