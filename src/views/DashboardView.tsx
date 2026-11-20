import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCheck,
  ChefHat,
  Clock,
  Flame,
  IndianRupee,
  Plus,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { HOURLY_SALES_DATA, WEEKLY_SALES_DATA } from '../data/sampleData';
import { MenuItem, NavSection, Order, RestaurantSettings } from '../types';
import { calculateOrderTotals, formatINRWhole } from '../utils/posUtils';
import { FoodImage } from '../components/FoodImage';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { VegNonVegBadge } from '../components/VegNonVegBadge';

interface DashboardViewProps {
  orders: Order[];
  menuItems: MenuItem[];
  settings: RestaurantSettings;
  onNavigate: (section: NavSection) => void;
  onAddToCart: (item: MenuItem) => void;
  onSelectOrderForBilling: (orderId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  menuItems,
  settings,
  onNavigate,
  onAddToCart,
  onSelectOrderForBilling,
}) => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [chartMode, setChartMode] = useState<'hourly' | 'weekly'>('hourly');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(4);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const preparingOrders = orders.filter((o) => o.status === 'Preparing').length;
  const completedOrders = orders.filter((o) => o.status === 'Completed').length;

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + calculateOrderTotals(order, settings).grandTotal;
  }, 0);

  const chartData = chartMode === 'hourly' ? HOURLY_SALES_DATA : WEEKLY_SALES_DATA;
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  const popularDishes = [...menuItems]
    .sort((a, b) => b.ordersToday - a.ordersToday)
    .slice(0, 6);

  const recentOrders = orders.slice(0, 5);

  const formattedDate = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const kpiCards = [
    {
      label: 'Total Orders',
      value: String(totalOrders),
      subtext: 'Active shift tickets',
      icon: ShoppingBag,
      accent: 'text-[#5C1422] bg-[#F5E8EB]',
    },
    {
      label: 'Total Revenue',
      value: formatINRWhole(totalRevenue),
      subtext: 'Incl. 5% GST',
      icon: IndianRupee,
      accent: 'text-[#B45309] bg-[#FEF3C7]',
    },
    {
      label: 'Pending Orders',
      value: String(pendingOrders),
      subtext: 'Awaiting kitchen',
      icon: Clock,
      accent: 'text-[#92400E] bg-[#FEF3C7]',
    },
    {
      label: 'Preparing Orders',
      value: String(preparingOrders),
      subtext: 'On stove & tandoor',
      icon: Flame,
      accent: 'text-[#C2410C] bg-[#FFEDD5]',
    },
    {
      label: 'Completed Orders',
      value: String(completedOrders),
      subtext: 'Served & settled',
      icon: CheckCheck,
      accent: 'text-[#166534] bg-[#DCFCE7]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hospitality Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#450D18] via-[#5C1422] to-[#2B0810] text-[#FAF6F0] p-6 sm:p-8 shadow-sm border border-[#741A2C]">
        <div
          className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 80% 25%, #D4AF37 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wider uppercase text-[#F3D078] mb-2">
              {settings.tagline}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight text-balance">
              Welcome back to {settings.name}
            </h1>
            <p className="mt-2 text-sm text-[#E9D8DC] flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums">
              <span>{formattedDate}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono font-medium text-[#FCD34D]">{formattedTime}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('new-order')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E07] text-white text-sm font-semibold shadow-sm transition-all duration-150 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Order</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('kitchen')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-[#D4AF37]/35 text-[#FAF6F0] text-sm font-medium transition-all duration-150 whitespace-nowrap"
            >
              <ChefHat className="w-4 h-4 text-[#F3D078]" />
              <span>Kitchen Display</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5 KPI Summary Cards */}
      <section aria-label="Shift Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl border border-[#E6DDD0] p-5 transition-transform duration-150 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[#6E5C60]">{kpi.label}</p>
                  <p className="mt-2 font-mono tabular-nums text-2xl font-bold text-[#1F1618]">
                    {kpi.value}
                  </p>
                  <p className="mt-1 text-xs text-[#8A7579]">{kpi.subtext}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${kpi.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Interactive Sales Chart + Recent Customer Orders */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Interactive Sales Chart */}
        <div className="xl:col-span-7 bg-white rounded-2xl border border-[#E6DDD0] p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#EA580C]" />
                <h2 className="font-display text-xl font-bold text-[#1F1618]">
                  Revenue &amp; Order Velocity
                </h2>
              </div>
              <p className="text-xs text-[#6E5C60] mt-1">
                Hover over any bar to inspect exact revenue in INR and ticket volume
              </p>
            </div>
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F3ECE2] shrink-0 self-start">
              <button
                type="button"
                onClick={() => {
                  setChartMode('hourly');
                  setHoveredIdx(4);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  chartMode === 'hourly'
                    ? 'bg-white text-[#5C1422] shadow-xs'
                    : 'text-[#6E5C60] hover:text-[#1F1618]'
                }`}
              >
                Today (Hourly)
              </button>
              <button
                type="button"
                onClick={() => {
                  setChartMode('weekly');
                  setHoveredIdx(5);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  chartMode === 'weekly'
                    ? 'bg-white text-[#5C1422] shadow-xs'
                    : 'text-[#6E5C60] hover:text-[#1F1618]'
                }`}
              >
                7-Day Trend
              </button>
            </div>
          </div>

          {/* Active Tooltip Strip */}
          {hoveredIdx !== null && chartData[hoveredIdx] && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-[#5C1422]">
                {chartMode === 'hourly' ? 'Window' : 'Day'}: {chartData[hoveredIdx].label}
              </span>
              <div className="flex items-center gap-4 tabular-nums font-mono">
                <span className="text-[#1F1618] font-semibold">
                  Revenue: {formatINRWhole(chartData[hoveredIdx].revenue)}
                </span>
                <span className="text-[#6E5C60]">
                  Orders: {chartData[hoveredIdx].orders}
                </span>
              </div>
            </div>
          )}

          {/* Bar Chart */}
          <div className="relative h-60 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-[#E6DDD0]">
            {/* Horizontal grid lines */}
            <div className="absolute inset-x-0 top-6 bottom-2 flex flex-col justify-between pointer-events-none" aria-hidden="true">
              {[0, 1, 2, 3].map((line) => (
                <div key={line} className="w-full border-t border-dashed border-[#EDE5DA]" />
              ))}
            </div>

            {chartData.map((point, idx) => {
              const heightPct = Math.max(10, Math.round((point.revenue / maxRevenue) * 100));
              const isSelected = hoveredIdx === idx;
              return (
                <button
                  key={point.label}
                  type="button"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onFocus={() => setHoveredIdx(idx)}
                  onClick={() => setHoveredIdx(idx)}
                  className="relative z-10 flex-1 h-full flex flex-col items-center justify-end group focus:outline-none"
                  aria-label={`${point.label}: ${formatINRWhole(point.revenue)}, ${point.orders} orders`}
                >
                  <span
                    className={`mb-1.5 font-mono tabular-nums text-[11px] font-medium transition-opacity duration-150 hidden sm:block ${
                      isSelected ? 'opacity-100 text-[#5C1422] font-semibold' : 'opacity-0 group-hover:opacity-100 text-[#6E5C60]'
                    }`}
                  >
                    ₹{Math.round(point.revenue / 1000)}k
                  </span>
                  <div
                    className={`w-full max-w-[44px] rounded-t-xl transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-t from-[#5C1422] via-[#9E2434] to-[#EA580C] shadow-sm'
                        : 'bg-gradient-to-t from-[#5C1422]/75 to-[#C69214]/75 hover:from-[#5C1422] hover:to-[#EA580C]'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-2 sm:gap-4 pt-2.5">
            {chartData.map((point, idx) => (
              <div
                key={point.label}
                className={`flex-1 text-center text-xs tabular-nums ${
                  hoveredIdx === idx ? 'font-semibold text-[#5C1422]' : 'text-[#6E5C60]'
                }`}
              >
                {point.label}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Customer Orders */}
        <div className="xl:col-span-5 bg-white rounded-2xl border border-[#E6DDD0] p-6 flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-[#1F1618]">
                Recent Customer Orders
              </h2>
              <p className="text-xs text-[#6E5C60] mt-0.5">
                Click any order to open its GST receipt
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('kitchen')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#5C1422] hover:text-[#EA580C] transition-colors whitespace-nowrap"
            >
              <span>View Kitchen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#EFE8DE] flex-1">
            {recentOrders.map((order) => {
              const totals = calculateOrderTotals(order, settings);
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => onSelectOrderForBilling(order.id)}
                  className="w-full py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 text-left hover:bg-[#FAF6F0]/80 px-2 -mx-2 rounded-xl transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#1F1618]">
                      <span className="font-mono tabular-nums text-[#5C1422]">
                        #{order.orderNumber}
                      </span>
                      <span className="truncate">{order.customerName}</span>
                    </div>
                    <p className="text-xs text-[#6E5C60] mt-0.5 truncate">
                      {order.orderType === 'Dine-in' && order.tableNumber
                        ? `${order.orderType} · ${order.tableNumber}`
                        : order.orderType}{' '}
                      · {order.items.reduce((s, i) => s + i.quantity, 0)} items · {order.createdAt}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="font-mono tabular-nums text-sm font-bold text-[#1F1618]">
                      {formatINRWhole(totals.grandTotal)}
                    </span>
                    <OrderStatusBadge status={order.status} compact />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Food Items */}
      <section className="bg-white rounded-2xl border border-[#E6DDD0] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-[#1F1618]">
              Popular Signature Dishes
            </h2>
            <p className="text-xs text-[#6E5C60] mt-0.5">
              Chef favorites ordered most frequently during today&apos;s service
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('menu')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C1422] hover:text-[#EA580C] transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <span>Browse Full Food Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularDishes.map((dish) => (
            <div
              key={dish.id}
              className="group rounded-2xl border border-[#E6DDD0] bg-[#FAF6F0]/45 overflow-hidden flex items-center gap-4 p-3 hover:border-[#C69214]/60 hover:bg-white transition-all duration-150"
            >
              <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-[#EFE8DE]">
                <FoodImage
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <VegNonVegBadge isVeg={dish.isVeg} />
                  <h3 className="text-sm font-semibold text-[#1F1618] truncate">{dish.name}</h3>
                </div>
                <p className="text-xs text-[#6E5C60] mt-0.5">
                  {dish.category} · <span className="tabular-nums">{dish.ordersToday} ordered</span>
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-mono tabular-nums text-sm font-bold text-[#5C1422]">
                    {formatINRWhole(dish.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAddToCart(dish)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#5C1422] hover:bg-[#EA580C] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
