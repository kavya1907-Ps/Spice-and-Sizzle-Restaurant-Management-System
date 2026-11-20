import React, { useMemo } from 'react';
import { Download, IndianRupee, PieChart, ShoppingBag, TrendingUp } from 'lucide-react';
import { ALL_CATEGORIES } from '../data/sampleData';
import { MenuItem, Order, RestaurantSettings } from '../types';
import { calculateOrderTotals, formatINRWhole } from '../utils/posUtils';
import { FoodImage } from '../components/FoodImage';
import { VegNonVegBadge } from '../components/VegNonVegBadge';

interface ReportsViewProps {
  orders: Order[];
  menuItems: MenuItem[];
  settings: RestaurantSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  menuItems,
  settings,
}) => {
  const summary = useMemo(() => {
    let grossRevenue = 0;
    let totalGst = 0;
    let dineInCount = 0;
    let takeawayCount = 0;
    const paymentTotals = { Cash: 0, UPI: 0, Card: 0, Unpaid: 0 };
    const categoryTotals = new Map<string, number>();

    ALL_CATEGORIES.forEach((cat) => categoryTotals.set(cat, 0));

    orders.forEach((order) => {
      const t = calculateOrderTotals(order, settings);
      grossRevenue += t.grandTotal;
      totalGst += t.totalTax;
      if (order.orderType === 'Dine-in') dineInCount += 1;
      else takeawayCount += 1;

      if (order.paymentStatus === 'Paid' && order.paymentMethod) {
        paymentTotals[order.paymentMethod] += t.grandTotal;
      } else {
        paymentTotals.Unpaid += t.grandTotal;
      }

      order.items.forEach((item) => {
        const prev = categoryTotals.get(item.category) || 0;
        categoryTotals.set(item.category, prev + item.price * item.quantity);
      });
    });

    const avgOrderValue = orders.length > 0 ? grossRevenue / orders.length : 0;

    return {
      grossRevenue,
      totalGst,
      avgOrderValue,
      dineInCount,
      takeawayCount,
      paymentTotals,
      categoryBreakdown: Array.from(categoryTotals.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount),
    };
  }, [orders, settings]);

  const maxCategoryAmount = Math.max(
    ...summary.categoryBreakdown.map((c) => c.amount),
    1
  );

  const topDishes = useMemo(() => {
    return [...menuItems]
      .sort((a, b) => b.ordersToday * b.price - a.ordersToday * a.price)
      .slice(0, 6);
  }, [menuItems]);

  const handleExportCsv = () => {
    const headers = ['OrderNumber', 'Customer', 'Type', 'Status', 'PaymentStatus', 'Method', 'TotalINR'];
    const rows = orders.map((o) => {
      const t = calculateOrderTotals(o, settings);
      return [
        o.orderNumber,
        `"${o.customerName}"`,
        o.orderType,
        o.status,
        o.paymentStatus,
        o.paymentMethod || 'Pending',
        t.grandTotal,
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'spice-and-sizzle-sales-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1618]">
            Sales &amp; Kitchen Reports
          </h1>
          <p className="text-sm text-[#6E5C60] mt-1">
            Live revenue analytics, GST summary, payment modes &amp; category performance
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5C1422] hover:bg-[#EA580C] text-white text-sm font-semibold transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E6DDD0] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6E5C60]">Gross Sales</span>
            <IndianRupee className="w-4 h-4 text-[#5C1422]" />
          </div>
          <p className="mt-2 font-mono tabular-nums text-2xl font-bold text-[#1F1618]">
            {formatINRWhole(summary.grossRevenue)}
          </p>
          <p className="mt-1 text-xs text-[#8A7579]">Across {orders.length} orders</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E6DDD0] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6E5C60]">Average Ticket Size</span>
            <TrendingUp className="w-4 h-4 text-[#EA580C]" />
          </div>
          <p className="mt-2 font-mono tabular-nums text-2xl font-bold text-[#1F1618]">
            {formatINRWhole(summary.avgOrderValue)}
          </p>
          <p className="mt-1 text-xs text-[#8A7579]">Per guest order</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E6DDD0] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6E5C60]">Total GST Collected</span>
            <PieChart className="w-4 h-4 text-[#C69214]" />
          </div>
          <p className="mt-2 font-mono tabular-nums text-2xl font-bold text-[#1F1618]">
            {formatINRWhole(summary.totalGst)}
          </p>
          <p className="mt-1 text-xs text-[#8A7579]">
            CGST {settings.cgstRate}% + SGST {settings.sgstRate}%
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E6DDD0] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6E5C60]">Service Split</span>
            <ShoppingBag className="w-4 h-4 text-[#15803D]" />
          </div>
          <p className="mt-2 font-mono tabular-nums text-2xl font-bold text-[#1F1618]">
            {summary.dineInCount} / {summary.takeawayCount}
          </p>
          <p className="mt-1 text-xs text-[#8A7579]">Dine-in vs Takeaway</p>
        </div>
      </div>

      {/* Category Revenue + Payment Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E6DDD0] p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-[#1F1618]">
            Revenue by Culinary Category
          </h2>
          <div className="space-y-3.5">
            {summary.categoryBreakdown.map((row) => {
              const pct = Math.round((row.amount / maxCategoryAmount) * 100);
              return (
                <div key={row.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1F1618]">{row.category}</span>
                    <span className="font-mono tabular-nums font-bold text-[#5C1422]">
                      {formatINRWhole(row.amount)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#F3ECE2] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#5C1422] to-[#EA580C] transition-all duration-300"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E6DDD0] p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-[#1F1618]">
            Payment Settlement Breakdown
          </h2>
          <div className="divide-y divide-[#F1EAE0]">
            {(
              [
                { label: 'UPI Collections', value: summary.paymentTotals.UPI, tone: 'text-[#15803D]' },
                { label: 'Card Terminals', value: summary.paymentTotals.Card, tone: 'text-[#5C1422]' },
                { label: 'Cash Drawer', value: summary.paymentTotals.Cash, tone: 'text-[#B45309]' },
                { label: 'Open / Unpaid Tables', value: summary.paymentTotals.Unpaid, tone: 'text-[#EA580C]' },
              ] as const
            ).map((entry) => (
              <div key={entry.label} className="py-3.5 flex items-center justify-between text-sm">
                <span className="font-medium text-[#5A494C]">{entry.label}</span>
                <span className={`font-mono tabular-nums font-bold ${entry.tone}`}>
                  {formatINRWhole(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Dishes Table */}
      <div className="bg-white rounded-2xl border border-[#E6DDD0] p-6">
        <h2 className="font-display text-xl font-bold text-[#1F1618] mb-4">
          Top Performing Menu Items
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6DDD0] text-xs text-[#6E5C60]">
                <th className="py-3 pr-4 font-semibold">Dish</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Unit Price</th>
                <th className="py-3 px-4 font-semibold text-right">Orders Today</th>
                <th className="py-3 pl-4 font-semibold text-right">Est. Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3ECE2] text-sm">
              {topDishes.map((dish) => (
                <tr key={dish.id} className="hover:bg-[#FAF6F0]/60 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-9 rounded-lg overflow-hidden shrink-0 bg-[#EFE8DE]">
                        <FoodImage
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <VegNonVegBadge isVeg={dish.isVeg} />
                        <span className="font-semibold text-[#1F1618]">{dish.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#6E5C60]">{dish.category}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {formatINRWhole(dish.price)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-medium">
                    {dish.ordersToday}
                  </td>
                  <td className="py-3 pl-4 text-right font-mono tabular-nums font-bold text-[#5C1422]">
                    {formatINRWhole(dish.ordersToday * dish.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
