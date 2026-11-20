import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Flame,
  LogOut,
  MapPin,
  Minus,
  Plus,
  Printer,
  Receipt,
  Search,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { ALL_CATEGORIES } from '../data/sampleData';
import {
  AuthSession,
  CartItem,
  CustomerSection,
  FoodCategory,
  MenuItem,
  Order,
  OrderStatus,
  OrderType,
  RestaurantSettings,
} from '../types';
import { calculateCartTotals, calculateOrderTotals, formatINR, formatINRWhole } from '../utils/posUtils';
import { FoodImage } from '../components/FoodImage';
import { LocationAddressPicker } from '../components/LocationAddressPicker';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { VegNonVegBadge } from '../components/VegNonVegBadge';

interface CustomerPortalViewProps {
  session: AuthSession;
  settings: RestaurantSettings;
  menuItems: MenuItem[];
  orders: Order[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateCartQty: (menuItemId: string, delta: number) => void;
  onClearCart: () => void;
  onPlaceCustomerOrder: (payload: {
    customerName: string;
    customerPhone: string;
    orderType: OrderType;
    tableNumber?: string;
    deliveryAddress?: string;
    deliveryLocation?: string;
    notes?: string;
  }) => Order;
  onLogout: () => void;
}

const ORDER_STEPS: OrderStatus[] = ['Pending', 'Preparing', 'Ready', 'Completed'];

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  session,
  settings,
  menuItems,
  orders,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onClearCart,
  onPlaceCustomerOrder,
  onLogout,
}) => {
  const [section, setSection] = useState<CustomerSection>('browse');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'All'>('All');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [search, setSearch] = useState('');

  // Checkout fields pre-filled from Customer Login
  const [orderType, setOrderType] = useState<OrderType>('Takeaway');
  const [tableNumber, setTableNumber] = useState('Table 05');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [notes, setNotes] = useState('');
  const [justPlaced, setJustPlaced] = useState<Order | null>(null);
  const [selectedBillId, setSelectedBillId] = useState<string>('');

  const cartCount = useMemo(
    () => cart.reduce((sum, c) => sum + c.quantity, 0),
    [cart]
  );

  const cartQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((c) => map.set(c.menuItem.id, c.quantity));
    return map;
  }, [cart]);

  const filteredMenu = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menuItems.filter((item) => {
      const catOk = selectedCategory === 'All' || item.category === selectedCategory;
      const dietOk =
        dietFilter === 'all' ||
        (dietFilter === 'veg' && item.isVeg) ||
        (dietFilter === 'nonveg' && !item.isVeg);
      const qOk =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return catOk && dietOk && qOk;
    });
  }, [menuItems, selectedCategory, dietFilter, search]);

  // Customer's own orders + sample orders matching customer or placed during session
  const customerOrders = useMemo(() => {
    const mine = orders.filter(
      (o) =>
        o.customerPhone === session.identifier ||
        o.customerName.toLowerCase() === session.name.toLowerCase()
    );
    return mine.length > 0 ? mine : orders.slice(0, 2);
  }, [orders, session]);

  const activeBill = useMemo(() => {
    return (
      customerOrders.find((o) => o.id === selectedBillId) || customerOrders[0] || null
    );
  }, [customerOrders, selectedBillId]);

  const totals = calculateCartTotals(
    cart.map((c) => ({ price: c.menuItem.price, quantity: c.quantity })),
    settings.cgstRate,
    settings.sgstRate
  );

  const tableOptions = useMemo(() => {
    return Array.from({ length: settings.totalTables }, (_, i) => {
      return `Table ${String(i + 1).padStart(2, '0')}`;
    });
  }, [settings.totalTables]);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    if (cart.length === 0) return;

    if (orderType === 'Takeaway' && !deliveryAddress.trim() && !deliveryLocation.trim()) {
      setCheckoutError(
        'Please enter your delivery/takeaway address or tap "Use Current Location" before placing the order.'
      );
      return;
    }

    const created = onPlaceCustomerOrder({
      customerName: session.name,
      customerPhone: session.identifier,
      orderType,
      tableNumber: orderType === 'Dine-in' ? tableNumber : undefined,
      deliveryAddress: orderType === 'Takeaway' ? deliveryAddress.trim() : undefined,
      deliveryLocation: orderType === 'Takeaway' ? deliveryLocation.trim() : undefined,
      notes: notes.trim() || undefined,
    });
    setNotes('');
    setJustPlaced(created);
    setSelectedBillId(created.id);
    setSection('my-orders');
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#1F1618] flex flex-col">
      {/* Customer Header */}
      <header className="sticky top-0 z-30 bg-[#171315] text-[#FAF6F0] border-b border-[#2B2226] px-4 sm:px-8 py-3.5">
        <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6B1525] to-[#3B0B14] border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <p className="font-display text-base font-bold tracking-wide text-white">
                {settings.name}
              </p>
              <p className="text-[11px] text-[#C8B9BD]">
                Guest: {session.name} · {session.identifier}
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto" aria-label="Customer Navigation">
            {(
              [
                { id: 'browse', label: 'Menu', icon: UtensilsCrossed },
                { id: 'cart', label: `Cart (${cartCount})`, icon: ShoppingCart },
                { id: 'my-orders', label: 'Track Orders', icon: Clock },
                { id: 'my-bills', label: 'My Bills', icon: Receipt },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = section === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSection(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#EA580C] text-white'
                      : 'text-[#D6C7CA] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-[#D4AF37]/30 text-xs font-semibold text-[#FAF6F0] transition-colors whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Logout / Switch</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1360px] w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* SECTION: BROWSE MENU */}
        {section === 'browse' && (
          <div className="space-y-6 pb-20">
            {/* Hero Welcome */}
            <div className="rounded-2xl bg-gradient-to-r from-[#450D18] via-[#5C1422] to-[#2B0810] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#F3D078]">
                  Welcome, {session.name}
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1">
                  Order Fresh From Our Indian Kitchen
                </h1>
                <p className="text-sm text-[#E9D8DC] mt-1">
                  Your order goes directly to our live Kitchen Display System for instant prep.
                </p>
              </div>
              {cartCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSection('cart')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E07] text-white text-sm font-semibold transition-colors whitespace-nowrap self-start md:self-auto"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>View Cart ({cartCount}) · {formatINRWhole(totals.subtotal)}</span>
                </button>
              )}
            </div>

            {/* Search & Dietary Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8A7579] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search dosa, biryani, filter coffee..."
                  className="w-full sm:w-72 pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E6DDD0] text-sm focus:outline-none focus:border-[#5C1422]"
                />
              </div>

              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#EFE8DE] self-start">
                {(
                  [
                    { id: 'all', label: 'All Dishes' },
                    { id: 'veg', label: 'Veg Only' },
                    { id: 'nonveg', label: 'Non-Veg' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDietFilter(d.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      dietFilter === d.id
                        ? 'bg-white text-[#5C1422] shadow-xs'
                        : 'text-[#6E5C60] hover:text-[#1F1618]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(['All', ...ALL_CATEGORIES] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#5C1422] text-white border-[#5C1422]'
                      : 'bg-white text-[#5A494C] border-[#E6DDD0] hover:border-[#C69214]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dish Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredMenu.map((item) => {
                const qty = cartQtyMap.get(item.id) || 0;
                return (
                  <article
                    key={item.id}
                    className="group bg-white rounded-2xl border border-[#E6DDD0] overflow-hidden flex flex-col hover:border-[#C69214] hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#EFE8DE]">
                      <FoodImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white font-medium">
                        <span>{item.category}</span>
                        <span className="tabular-nums">~{item.prepMinutes} min</span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <VegNonVegBadge isVeg={item.isVeg} />
                          <h3 className="font-semibold text-base text-[#1F1618] truncate">
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-xs text-[#6E5C60] mt-1.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#F1EAE0]">
                        <span className="font-mono tabular-nums text-lg font-bold text-[#5C1422]">
                          {formatINRWhole(item.price)}
                        </span>

                        {qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => onAddToCart(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#D94E07] text-white text-xs font-semibold transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-1 rounded-xl bg-[#FAF6F0] border border-[#5C1422]/25 p-1">
                            <button
                              type="button"
                              onClick={() => onUpdateCartQty(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-white text-[#5C1422] flex items-center justify-center"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center font-mono tabular-nums text-xs font-bold">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateCartQty(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-[#5C1422] text-white flex items-center justify-center"
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
          </div>
        )}

        {/* SECTION: CUSTOMER CART & CHECKOUT */}
        {section === 'cart' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#E6DDD0] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#EFE8DE] pb-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#1F1618]">
                  Your Order Cart
                </h1>
                <p className="text-xs text-[#6E5C60] mt-0.5">
                  Ordering as {session.name} ({session.identifier})
                </p>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#B91C1C] hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Cart</span>
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart className="w-10 h-10 text-[#9E8B8F] mx-auto mb-3" />
                <h2 className="font-display text-xl font-bold text-[#1F1618]">
                  Your cart is currently empty
                </h2>
                <p className="text-sm text-[#6E5C60] mt-1">
                  Explore our South Indian, North Indian, and Biryani selections to place an order.
                </p>
                <button
                  type="button"
                  onClick={() => setSection('browse')}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E07] text-white text-sm font-semibold transition-colors"
                >
                  Browse Food Menu
                </button>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                <div className="divide-y divide-[#F1EAE0]">
                  {cart.map(({ menuItem, quantity }) => (
                    <div key={menuItem.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-12 rounded-xl overflow-hidden shrink-0 bg-[#EFE8DE]">
                          <FoodImage
                            src={menuItem.image}
                            alt={menuItem.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <VegNonVegBadge isVeg={menuItem.isVeg} />
                            <p className="text-sm font-semibold text-[#1F1618] truncate">
                              {menuItem.name}
                            </p>
                          </div>
                          <p className="text-xs text-[#6E5C60] font-mono tabular-nums mt-0.5">
                            {formatINRWhole(menuItem.price)} each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="inline-flex items-center gap-1 rounded-lg bg-[#FAF6F0] border border-[#E6DDD0] p-1">
                          <button
                            type="button"
                            onClick={() => onUpdateCartQty(menuItem.id, -1)}
                            className="w-6 h-6 rounded hover:bg-white flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-mono tabular-nums text-xs font-bold">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateCartQty(menuItem.id, 1)}
                            className="w-6 h-6 rounded hover:bg-white flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="w-16 text-right font-mono tabular-nums text-sm font-bold text-[#5C1422]">
                          {formatINRWhole(menuItem.price * quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                      Dining Preference
                    </span>
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F3ECE2]">
                      {(['Dine-in', 'Takeaway'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setOrderType(t)}
                          className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                            orderType === t
                              ? 'bg-[#5C1422] text-white'
                              : 'text-[#5A494C] hover:text-[#1F1618]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {orderType === 'Dine-in' && (
                    <div>
                      <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                        Select Your Table
                      </label>
                      <select
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm font-medium focus:outline-none focus:border-[#5C1422]"
                      >
                        {tableOptions.map((tbl) => (
                          <option key={tbl} value={tbl}>
                            {tbl}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {orderType === 'Takeaway' && (
                  <LocationAddressPicker
                    address={deliveryAddress}
                    locationPin={deliveryLocation}
                    onChangeAddress={(v) => {
                      setDeliveryAddress(v);
                      setCheckoutError('');
                    }}
                    onChangeLocationPin={(v) => {
                      setDeliveryLocation(v);
                      setCheckoutError('');
                    }}
                  />
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                    Cooking Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Spice preference, allergies, or extra chutney..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm focus:outline-none focus:border-[#5C1422]"
                  />
                </div>

                <div className="rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-[#5A494C]">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums">{formatINR(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#5A494C]">
                    <span>CGST ({settings.cgstRate}%) + SGST ({settings.sgstRate}%)</span>
                    <span className="font-mono tabular-nums">{formatINR(totals.totalTax)}</span>
                  </div>
                  <div className="pt-2 border-t border-[#E6DDD0] flex justify-between text-base font-bold text-[#5C1422]">
                    <span>Payable Total</span>
                    <span className="font-mono tabular-nums">
                      {formatINRWhole(totals.grandTotal)}
                    </span>
                  </div>
                </div>

                {checkoutError && (
                  <p className="text-xs font-medium text-[#B91C1C] bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl px-3.5 py-2">
                    {checkoutError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#EA580C] hover:bg-[#D94E07] text-white text-sm font-semibold transition-colors"
                >
                  Confirm &amp; Send Order to Kitchen · {formatINRWhole(totals.grandTotal)}
                </button>
              </form>
            )}
          </div>
        )}

        {/* SECTION: TRACK LIVE ORDERS */}
        {section === 'my-orders' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1618]">
                Live Kitchen Order Tracker
              </h1>
              <p className="text-sm text-[#6E5C60] mt-1">
                Real-time preparation status synced with the {settings.name} kitchen display
              </p>
            </div>

            {justPlaced && (
              <div className="rounded-2xl bg-[#ECFDF5] border border-[#86EFAC] p-4 text-xs text-[#166534] flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Order <strong>#{justPlaced.orderNumber}</strong> received by the kitchen! Switch
                  to Restaurant Side anytime to process it live.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {customerOrders.map((order) => {
                const ordTotals = calculateOrderTotals(order, settings);
                const stepIndex = ORDER_STEPS.indexOf(order.status);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-[#E6DDD0] p-5 space-y-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono tabular-nums text-base font-bold text-[#5C1422]">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-xs text-[#6E5C60] mt-0.5">
                          {order.orderType}
                          {order.tableNumber ? ` · ${order.tableNumber}` : ''} · {order.createdAt}
                        </p>
                        {(order.deliveryAddress || order.deliveryLocation) && (
                          <p className="text-xs text-[#5C1422] mt-1.5 flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#EA580C] shrink-0 mt-0.5" />
                            <span>
                              {order.deliveryAddress || order.deliveryLocation}
                              {order.deliveryAddress && order.deliveryLocation
                                ? ` (${order.deliveryLocation})`
                                : ''}
                            </span>
                          </p>
                        )}
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    {/* 4-Stage Progress Stepper */}
                    <div className="grid grid-cols-4 gap-2">
                      {ORDER_STEPS.map((step, idx) => {
                        const reached = idx <= stepIndex;
                        return (
                          <div key={step} className="space-y-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-colors ${
                                reached ? 'bg-[#EA580C]' : 'bg-[#EFE8DE]'
                              }`}
                            />
                            <p
                              className={`text-[11px] font-medium ${
                                reached ? 'text-[#5C1422] font-semibold' : 'text-[#9E8B8F]'
                              }`}
                            >
                              {step}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-[#F1EAE0] pt-3 space-y-1.5 text-xs">
                      {order.items.map((item, i) => (
                        <div key={`${item.menuItemId}-${i}`} className="flex justify-between">
                          <span className="text-[#1F1618]">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-mono tabular-nums text-[#5A494C]">
                            {formatINRWhole(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#F1EAE0] flex items-center justify-between">
                      <span className="font-mono tabular-nums text-sm font-bold text-[#1F1618]">
                        Total: {formatINRWhole(ordTotals.grandTotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBillId(order.id);
                          setSection('my-bills');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] hover:border-[#5C1422] text-xs font-semibold text-[#5C1422]"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION: CUSTOMER BILL RECEIPT */}
        {section === 'my-bills' && activeBill && (
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl font-bold text-[#1F1618]">My GST Receipt</h1>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5C1422] hover:bg-[#EA580C] text-white text-xs font-semibold transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>

            {(() => {
              const t = calculateOrderTotals(activeBill, settings);
              return (
                <div
                  id="printable-receipt"
                  className="bg-white rounded-2xl border border-[#E6DDD0] p-6 font-mono text-xs text-[#1F1618] shadow-sm"
                >
                  <div className="text-center border-b border-dashed border-[#D5C9BA] pb-4">
                    <p className="font-display text-xl font-bold text-[#5C1422]">
                      {settings.name}
                    </p>
                    <p className="text-[11px] font-sans text-[#6E5C60] mt-1">{settings.address}</p>
                    <p className="text-[11px] text-[#6E5C60] mt-0.5">
                      GSTIN: {settings.gstin}
                    </p>
                  </div>

                  <div className="py-3 border-b border-dashed border-[#D5C9BA] space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span>Order #:</span>
                      <span className="font-bold">{activeBill.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Guest:</span>
                      <span className="font-sans font-semibold">{activeBill.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span>
                        {activeBill.orderType}
                        {activeBill.tableNumber ? ` (${activeBill.tableNumber})` : ''}
                      </span>
                    </div>
                    {(activeBill.deliveryAddress || activeBill.deliveryLocation) && (
                      <div className="flex justify-between gap-4">
                        <span className="shrink-0">Address:</span>
                        <span className="font-sans text-right">
                          {activeBill.deliveryAddress || activeBill.deliveryLocation}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span>{activeBill.paymentStatus}</span>
                    </div>
                  </div>

                  <div className="py-3 border-b border-dashed border-[#D5C9BA] space-y-1.5">
                    {activeBill.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="font-sans">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="tabular-nums">
                          {formatINRWhole(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="py-3 space-y-1 text-[11px] border-b border-dashed border-[#D5C9BA]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="tabular-nums">{formatINR(t.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST + SGST</span>
                      <span className="tabular-nums">{formatINR(t.totalTax)}</span>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-between text-base font-bold text-[#5C1422]">
                    <span className="font-sans">TOTAL</span>
                    <span className="tabular-nums">{formatINRWhole(t.grandTotal)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
};
