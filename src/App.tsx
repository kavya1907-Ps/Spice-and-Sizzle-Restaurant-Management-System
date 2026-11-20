import React, { useMemo, useState } from 'react';
import { LogOut, Menu, Plus, ShoppingCart } from 'lucide-react';
import {
  DEFAULT_SETTINGS,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
} from './data/sampleData';
import {
  AuthSession,
  CartItem,
  FoodCategory,
  MenuItem,
  NavSection,
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
  RestaurantSettings,
} from './types';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './views/LoginView';
import { CustomerPortalView } from './views/CustomerPortalView';
import { DashboardView } from './views/DashboardView';
import { FoodMenuView } from './views/FoodMenuView';
import { CategoriesView } from './views/CategoriesView';
import { NewOrderView } from './views/NewOrderView';
import { KitchenDisplayView } from './views/KitchenDisplayView';
import { BillingView } from './views/BillingView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

const SECTION_LABELS: Record<NavSection, string> = {
  dashboard: 'Dashboard',
  menu: 'Food Menu',
  categories: 'Categories',
  'new-order': 'New Order',
  kitchen: 'Kitchen Display',
  billing: 'Billing & GST Receipt',
  reports: 'Sales Reports',
  settings: 'Settings',
};

export function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<FoodCategory | 'All'>('All');
  const [billingOrderId, setBillingOrderId] = useState<string>(INITIAL_ORDERS[0].id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const activeKitchenCount = useMemo(
    () => orders.filter((o) => o.status === 'Pending' || o.status === 'Preparing').length,
    [orders]
  );

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
    showToast(`Added ${item.name} to order tray`);
  };

  const handleUpdateCartQty = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menuItem.id === menuItemId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const handlePlaceOrder = (payload: {
    customerName: string;
    customerPhone: string;
    orderType: OrderType;
    tableNumber?: string;
    deliveryAddress?: string;
    deliveryLocation?: string;
    notes?: string;
  }): Order => {
    const nextNum = 1049 + (orders.length - INITIAL_ORDERS.length);
    const nowTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `SS-${nextNum}`,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      orderType: payload.orderType,
      tableNumber: payload.tableNumber,
      deliveryAddress: payload.deliveryAddress,
      deliveryLocation: payload.deliveryLocation,
      items: cart.map((c) => ({
        menuItemId: c.menuItem.id,
        name: c.menuItem.name,
        price: c.menuItem.price,
        quantity: c.quantity,
        isVeg: c.menuItem.isVeg,
        category: c.menuItem.category,
      })),
      status: 'Pending',
      createdAt: nowTime,
      elapsedMinutes: 1,
      notes: payload.notes,
      paymentStatus: 'Unpaid',
      discountPercent: 0,
    };

    // Increment daily popularity counts
    setMenuItems((prev) =>
      prev.map((m) => {
        const ordered = cart.find((c) => c.menuItem.id === m.id);
        return ordered ? { ...m, ordersToday: m.ordersToday + ordered.quantity } : m;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setBillingOrderId(newOrder.id);
    showToast(`Ticket #${newOrder.orderNumber} sent to Kitchen Display`);
    return newOrder;
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    showToast(`Kitchen ticket updated to ${nextStatus}`);
  };

  const handleSetDiscount = (orderId: string, discountPercent: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, discountPercent } : o))
    );
  };

  const handleCompletePayment = (orderId: string, method: PaymentMethod) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: 'Paid',
              paymentMethod: method,
              status: 'Completed',
            }
          : o
      )
    );
    showToast(`Payment settled via ${method}`);
  };

  const handleOpenCategoryInMenu = (cat: FoodCategory) => {
    setMenuCategoryFilter(cat);
    setActiveSection('menu');
  };

  const handleOpenBillingForOrder = (orderId: string) => {
    setBillingOrderId(orderId);
    setActiveSection('billing');
  };

  const handleAddNewDish = (dish: MenuItem) => {
    setMenuItems((prev) => [dish, ...prev]);
    showToast(`${dish.name} added to ${dish.category}`);
  };

  const handleResetDemoData = () => {
    setMenuItems(INITIAL_MENU_ITEMS);
    setOrders(INITIAL_ORDERS);
    setCart([]);
    setSettings(DEFAULT_SETTINGS);
    setBillingOrderId(INITIAL_ORDERS[0].id);
    showToast('Sample restaurant data restored');
  };

  const handleLogout = () => {
    setAuthSession(null);
    setMobileMenuOpen(false);
    setCart([]);
  };

  if (!authSession) {
    return (
      <LoginView
        settings={settings}
        onLogin={(session) => {
          setAuthSession(session);
          setActiveSection('dashboard');
          showToast(
            session.role === 'user'
              ? `Welcome, ${session.name}`
              : `Signed in as ${session.staffTitle || 'Staff'}`
          );
        }}
      />
    );
  }

  if (authSession.role === 'user') {
    return (
      <>
        <CustomerPortalView
          session={authSession}
          settings={settings}
          menuItems={menuItems}
          orders={orders}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateCartQty={handleUpdateCartQty}
          onClearCart={() => setCart([])}
          onPlaceCustomerOrder={handlePlaceOrder}
          onLogout={handleLogout}
        />
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#171315] text-[#FAF6F0] border border-[#D4AF37]/40 shadow-lg text-xs font-medium"
          >
            {toastMessage}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FAF6F0] text-[#1F1618]">
      {/* Dark Charcoal Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        cartCount={cartCount}
        activeKitchenCount={activeKitchenCount}
        restaurantName={settings.name}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Clean Three-Zone Top Bar */}
        <header className="sticky top-0 z-20 bg-[#FAF6F0]/92 backdrop-blur-md border-b border-[#E6DDD0] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-[#E6DDD0] text-[#1F1618]"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-medium text-[#6E5C60] flex items-center gap-2 whitespace-nowrap truncate">
              <span className="hidden sm:inline text-[#1F1618] font-semibold">{settings.name}</span>
              <span className="hidden sm:inline" aria-hidden="true">/</span>
              <span className="text-[#5C1422] font-semibold">
                {SECTION_LABELS[activeSection]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline text-xs text-[#6E5C60] whitespace-nowrap">
              {authSession.name} · <span className="font-semibold text-[#5C1422]">{authSession.staffTitle}</span>
            </span>

            <button
              type="button"
              onClick={() => setActiveSection('new-order')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E6DDD0] hover:border-[#5C1422] text-xs font-semibold text-[#1F1618] transition-colors whitespace-nowrap"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#5C1422]" />
              <span>Tray</span>
              <span className="font-mono tabular-nums px-1.5 py-0.5 rounded-md bg-[#F5E8EB] text-[#5C1422]">
                {cartCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('menu')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#D94E07] text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Quick Order</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#171315] hover:bg-[#2B2226] text-[#FAF6F0] text-xs font-semibold transition-colors whitespace-nowrap"
              title="Logout or switch portal"
            >
              <LogOut className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Active View Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1440px] w-full mx-auto">
          {activeSection === 'dashboard' && (
            <DashboardView
              orders={orders}
              menuItems={menuItems}
              settings={settings}
              onNavigate={setActiveSection}
              onAddToCart={handleAddToCart}
              onSelectOrderForBilling={handleOpenBillingForOrder}
            />
          )}

          {activeSection === 'menu' && (
            <FoodMenuView
              menuItems={menuItems}
              cart={cart}
              selectedCategory={menuCategoryFilter}
              onSelectCategory={setMenuCategoryFilter}
              onAddToCart={handleAddToCart}
              onUpdateQty={handleUpdateCartQty}
              onGoToOrder={() => setActiveSection('new-order')}
            />
          )}

          {activeSection === 'categories' && (
            <CategoriesView
              menuItems={menuItems}
              onOpenCategoryInMenu={handleOpenCategoryInMenu}
              onAddNewDish={handleAddNewDish}
            />
          )}

          {activeSection === 'new-order' && (
            <NewOrderView
              menuItems={menuItems}
              cart={cart}
              settings={settings}
              onAddToCart={handleAddToCart}
              onUpdateQty={handleUpdateCartQty}
              onClearCart={() => setCart([])}
              onPlaceOrder={handlePlaceOrder}
              onNavigate={setActiveSection}
              onOpenBillingForOrder={handleOpenBillingForOrder}
            />
          )}

          {activeSection === 'kitchen' && (
            <KitchenDisplayView
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
              onOpenBilling={handleOpenBillingForOrder}
            />
          )}

          {activeSection === 'billing' && (
            <BillingView
              orders={orders}
              selectedOrderId={billingOrderId}
              settings={settings}
              onSelectOrder={setBillingOrderId}
              onSetDiscount={handleSetDiscount}
              onCompletePayment={handleCompletePayment}
            />
          )}

          {activeSection === 'reports' && (
            <ReportsView
              orders={orders}
              menuItems={menuItems}
              settings={settings}
            />
          )}

          {activeSection === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={(updated) => {
                setSettings(updated);
                showToast('POS settings saved');
              }}
              onResetSampleData={handleResetDemoData}
            />
          )}
        </main>
      </div>

      {/* Subtle Bottom-Right Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#171315] text-[#FAF6F0] border border-[#D4AF37]/40 shadow-lg text-xs font-medium"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
