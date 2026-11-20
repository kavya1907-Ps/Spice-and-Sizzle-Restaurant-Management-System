import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChefHat,
  Loader2,
  Minus,
  Phone,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  Trash2,
  User,
  Utensils,
} from 'lucide-react';
import { ALL_CATEGORIES } from '../data/sampleData';
import {
  CartItem,
  FoodCategory,
  MenuItem,
  NavSection,
  Order,
  OrderType,
  RestaurantSettings,
} from '../types';
import { calculateCartTotals, formatINR, formatINRWhole } from '../utils/posUtils';
import { FoodImage } from '../components/FoodImage';
import { LocationAddressPicker } from '../components/LocationAddressPicker';
import { VegNonVegBadge } from '../components/VegNonVegBadge';

interface NewOrderViewProps {
  menuItems: MenuItem[];
  cart: CartItem[];
  settings: RestaurantSettings;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQty: (menuItemId: string, delta: number) => void;
  onClearCart: () => void;
  onPlaceOrder: (payload: {
    customerName: string;
    customerPhone: string;
    orderType: OrderType;
    tableNumber?: string;
    deliveryAddress?: string;
    deliveryLocation?: string;
    notes?: string;
  }) => Order;
  onNavigate: (section: NavSection) => void;
  onOpenBillingForOrder: (orderId: string) => void;
}

export const NewOrderView: React.FC<NewOrderViewProps> = ({
  menuItems,
  cart,
  settings,
  onAddToCart,
  onUpdateQty,
  onClearCart,
  onPlaceOrder,
  onNavigate,
  onOpenBillingForOrder,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FoodCategory | 'All'>('All');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('Dine-in');
  const [tableNumber, setTableNumber] = useState('Table 01');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  const filteredMenu = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menuItems.filter((item) => {
      const catMatch = category === 'All' || item.category === category;
      const qMatch =
        !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
  }, [menuItems, category, search]);

  const cartQtyMap = useMemo(() => {
    const m = new Map<string, number>();
    cart.forEach((c) => m.set(c.menuItem.id, c.quantity));
    return m;
  }, [cart]);

  const totals = calculateCartTotals(
    cart.map((c) => ({ price: c.menuItem.price, quantity: c.quantity })),
    settings.cgstRate,
    settings.sgstRate
  );

  const tableOptions = useMemo(() => {
    return Array.from({ length: settings.totalTables }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      return `Table ${num}`;
    });
  }, [settings.totalTables]);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Please add at least one dish to the cart before placing an order.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Please enter the customer name.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Please enter a valid customer phone number.');
      return;
    }
    if (orderType === 'Takeaway' && !deliveryAddress.trim() && !deliveryLocation.trim()) {
      setErrorMsg('Please enter the Takeaway address or pin a location.');
      return;
    }

    setIsPlacing(true);
    setTimeout(() => {
      const created = onPlaceOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        tableNumber: orderType === 'Dine-in' ? tableNumber : undefined,
        deliveryAddress: orderType === 'Takeaway' ? deliveryAddress.trim() : undefined,
        deliveryLocation: orderType === 'Takeaway' ? deliveryLocation.trim() : undefined,
        notes: notes.trim() || undefined,
      });
      setIsPlacing(false);
      setLastPlacedOrder(created);
      setCustomerName('');
      setCustomerPhone('');
      setDeliveryAddress('');
      setDeliveryLocation('');
      setNotes('');
    }, 350);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1618]">
            New Order Terminal
          </h1>
          <p className="text-sm text-[#6E5C60] mt-1">
            Tap dishes on the left to build the order, then confirm guest details on the right
          </p>
        </div>
      </div>

      {/* Confirmation Banner after placing order */}
      {lastPlacedOrder && (
        <div className="rounded-2xl bg-[#ECFDF5] border border-[#86EFAC] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#14532D]">
                Order #{lastPlacedOrder.orderNumber} sent to Kitchen Display
              </p>
              <p className="text-xs text-[#166534] mt-0.5">
                {lastPlacedOrder.customerName} ·{' '}
                {lastPlacedOrder.orderType === 'Dine-in'
                  ? lastPlacedOrder.tableNumber
                  : 'Takeaway'}{' '}
                · {lastPlacedOrder.items.reduce((s, i) => s + i.quantity, 0)} items
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('kitchen')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Track in Kitchen</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenBillingForOrder(lastPlacedOrder.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#86EFAC] text-[#14532D] hover:bg-[#DCFCE7] text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>View GST Bill</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Quick Add POS Menu */}
        <div className="xl:col-span-7 bg-white rounded-2xl border border-[#E6DDD0] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-[#1F1618]">Quick-Add Dishes</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-[#8A7579] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Quick search..."
                className="w-full sm:w-56 pl-9 pr-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-xs text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['All', ...ALL_CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  category === cat
                    ? 'bg-[#5C1422] text-white'
                    : 'bg-[#FAF6F0] text-[#5A494C] hover:bg-[#EFE8DE]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredMenu.map((item) => {
              const qty = cartQtyMap.get(item.id) || 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-[#EFE8DE] bg-[#FAF6F0]/40 hover:bg-white hover:border-[#C69214]/60 transition-all"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-[#EFE8DE]">
                    <FoodImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <VegNonVegBadge isVeg={item.isVeg} />
                      <p className="text-sm font-semibold text-[#1F1618] truncate">{item.name}</p>
                    </div>
                    <p className="text-[11px] text-[#6E5C60] truncate">{item.category}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="font-mono tabular-nums text-sm font-bold text-[#5C1422]">
                        {formatINRWhole(item.price)}
                      </span>
                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => onAddToCart(item)}
                          className="px-2.5 py-1 rounded-lg bg-[#EA580C] hover:bg-[#D94E07] text-white text-xs font-semibold transition-colors"
                        >
                          + Add
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, -1)}
                            className="w-6 h-6 rounded-md bg-[#EFE8DE] hover:bg-[#E2D6C8] text-[#1F1618] flex items-center justify-center"
                            aria-label={`Remove one ${item.name}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-mono tabular-nums text-xs font-bold">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, 1)}
                            className="w-6 h-6 rounded-md bg-[#5C1422] text-white flex items-center justify-center"
                            aria-label={`Add one ${item.name}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Shopping Cart & Checkout Form */}
        <div className="xl:col-span-5 bg-white rounded-2xl border border-[#E6DDD0] p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#EFE8DE]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F5E8EB] text-[#5C1422] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-[#1F1618]">Current Cart</h2>
                <p className="text-xs text-[#6E5C60] tabular-nums">
                  {cart.reduce((s, c) => s + c.quantity, 0)} items selected
                </p>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#B91C1C] hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Cart Items or Empty State */}
          {cart.length === 0 ? (
            <div className="py-10 px-4 text-center rounded-xl bg-[#FAF6F0]/70 border border-dashed border-[#DFD3C3]">
              <Utensils className="w-8 h-8 text-[#9E8B8F] mx-auto mb-2.5" />
              <p className="font-display text-base font-bold text-[#1F1618]">
                Your order tray is empty
              </p>
              <p className="text-xs text-[#6E5C60] mt-1 max-w-xs mx-auto">
                Tap any dish from the quick-add list or explore our full photography menu.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('menu')}
                className="mt-4 px-4 py-2 rounded-xl bg-[#5C1422] hover:bg-[#EA580C] text-white text-xs font-semibold transition-colors"
              >
                Open Food Menu
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#EFE8DE] max-h-64 overflow-y-auto pr-1">
              {cart.map(({ menuItem, quantity }) => (
                <div key={menuItem.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <VegNonVegBadge isVeg={menuItem.isVeg} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1F1618] truncate">
                        {menuItem.name}
                      </p>
                      <p className="text-xs text-[#6E5C60] font-mono tabular-nums">
                        {formatINRWhole(menuItem.price)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="inline-flex items-center gap-1 rounded-lg bg-[#FAF6F0] border border-[#E6DDD0] p-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(menuItem.id, -1)}
                        className="w-6 h-6 rounded-md hover:bg-white text-[#5C1422] flex items-center justify-center"
                        aria-label={`Decrease ${menuItem.name}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-mono tabular-nums text-xs font-bold">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(menuItem.id, 1)}
                        className="w-6 h-6 rounded-md hover:bg-white text-[#5C1422] flex items-center justify-center"
                        aria-label={`Increase ${menuItem.name}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="w-16 text-right font-mono tabular-nums text-sm font-bold text-[#1F1618]">
                      {formatINRWhole(menuItem.price * quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customer Details & Order Form */}
          <form onSubmit={handleSubmitOrder} className="space-y-4 pt-2 border-t border-[#EFE8DE]">
            {/* Dine-in / Takeaway Selector */}
            <div>
              <span className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                Service Type
              </span>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F3ECE2]">
                {(['Dine-in', 'Takeaway'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                      orderType === type
                        ? 'bg-[#5C1422] text-white shadow-xs'
                        : 'text-[#5A494C] hover:text-[#1F1618]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {orderType === 'Dine-in' && (
              <div>
                <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                  Table Number
                </label>
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm font-medium text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
                >
                  {tableOptions.map((tbl) => (
                    <option key={tbl} value={tbl}>
                      {tbl}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {orderType === 'Takeaway' && (
              <LocationAddressPicker
                address={deliveryAddress}
                locationPin={deliveryLocation}
                onChangeAddress={(v) => {
                  setDeliveryAddress(v);
                  setErrorMsg('');
                }}
                onChangeLocationPin={(v) => {
                  setDeliveryLocation(v);
                  setErrorMsg('');
                }}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                  Customer Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8A7579] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g., Priya Nair"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8A7579] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98400 12345"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm font-mono tabular-nums text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                Kitchen Instructions (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Less spicy, extra chutney, no onion..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
              />
            </div>

            {/* Automatic Total Calculation */}
            <div className="rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] p-4 space-y-2 text-xs">
              <div className="flex justify-between text-[#5A494C]">
                <span>Item Subtotal</span>
                <span className="font-mono tabular-nums font-medium">{formatINR(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#5A494C]">
                <span>CGST ({settings.cgstRate}%)</span>
                <span className="font-mono tabular-nums">{formatINR(totals.cgst)}</span>
              </div>
              <div className="flex justify-between text-[#5A494C]">
                <span>SGST ({settings.sgstRate}%)</span>
                <span className="font-mono tabular-nums">{formatINR(totals.sgst)}</span>
              </div>
              <div className="pt-2 border-t border-[#E6DDD0] flex justify-between items-center text-base font-bold text-[#1F1618]">
                <span>Grand Total</span>
                <span className="font-mono tabular-nums text-[#5C1422]">
                  {formatINRWhole(totals.grandTotal)}
                </span>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-medium text-[#B91C1C] bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl px-3.5 py-2">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isPlacing}
              className="w-full py-3 rounded-xl bg-[#EA580C] hover:bg-[#D94E07] disabled:opacity-70 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isPlacing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Ticket to Kitchen...</span>
                </>
              ) : (
                <span>Place Order · {formatINRWhole(totals.grandTotal)}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
