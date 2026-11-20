import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCheck,
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  MapPin,
  Receipt,
  Search,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { VegNonVegBadge } from '../components/VegNonVegBadge';

interface KitchenDisplayViewProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onOpenBilling: (orderId: string) => void;
}

const STATUS_FILTERS: (OrderStatus | 'All')[] = [
  'All',
  'Pending',
  'Preparing',
  'Ready',
  'Completed',
];

const HEADER_BAR_STYLES: Record<OrderStatus, string> = {
  Pending: 'bg-[#FEF3C7] border-b border-[#FDE68A]',
  Preparing: 'bg-[#FFEDD5] border-b border-[#FDBA74]',
  Ready: 'bg-[#DCFCE7] border-b border-[#86EFAC]',
  Completed: 'bg-[#F5E8EB] border-b border-[#E2C2C9]',
};

export const KitchenDisplayView: React.FC<KitchenDisplayViewProps> = ({
  orders,
  onUpdateStatus,
  onOpenBilling,
}) => {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All'>('All');
  const [search, setSearch] = useState('');

  const counts = useMemo(() => {
    return {
      All: orders.length,
      Pending: orders.filter((o) => o.status === 'Pending').length,
      Preparing: orders.filter((o) => o.status === 'Preparing').length,
      Ready: orders.filter((o) => o.status === 'Ready').length,
      Completed: orders.filter((o) => o.status === 'Completed').length,
    };
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      const statusOk = filterStatus === 'All' || order.status === filterStatus;
      const queryOk =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        (order.tableNumber || '').toLowerCase().includes(q);
      return statusOk && queryOk;
    });
  }, [orders, filterStatus, search]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1618]">
            Kitchen Display System
          </h1>
          <p className="text-sm text-[#6E5C60] mt-1">
            Process multiple live tickets simultaneously across prep, plating &amp; dispatch
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#8A7579] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by ticket #, guest or table..."
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E6DDD0] text-sm text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((status) => {
          const isActive = filterStatus === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#5C1422] text-white border-[#5C1422]'
                  : 'bg-white text-[#5A494C] border-[#E6DDD0] hover:border-[#C69214]/60'
              }`}
            >
              <span>{status}</span>
              <span
                className={`font-mono tabular-nums px-1.5 py-0.5 rounded-md text-[11px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#FAF6F0] text-[#5C1422]'
                }`}
              >
                {counts[status]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kitchen Tickets Grid */}
      {visibleOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E6DDD0] p-12 text-center">
          <ChefHat className="w-10 h-10 text-[#9E8B8F] mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-[#1F1618]">
            No kitchen orders in {filterStatus}
          </h3>
          <p className="text-sm text-[#6E5C60] mt-1">
            Switch status tabs or place a new order from the POS terminal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {visibleOrders.map((order) => (
            <article
              key={order.id}
              className="bg-white rounded-2xl border border-[#E6DDD0] overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
            >
              <div>
                {/* Ticket Header */}
                <div className={`px-5 py-3.5 flex items-center justify-between gap-2 ${HEADER_BAR_STYLES[order.status]}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono tabular-nums text-base font-bold text-[#1F1618]">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs font-semibold text-[#5A494C]">
                        {order.orderType === 'Dine-in' && order.tableNumber
                          ? order.tableNumber
                          : 'Takeaway'}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A494C] mt-0.5">
                      {order.customerName} · {order.createdAt}
                    </p>
                  </div>

                  <OrderStatusBadge status={order.status} />
                </div>

                {/* Dish Checklist */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#6E5C60]">
                    <span>Ordered Dishes</span>
                    <span className="font-mono tabular-nums inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {order.elapsedMinutes}m elapsed
                    </span>
                  </div>

                  <ul className="divide-y divide-[#F3ECE2]">
                    {order.items.map((item, idx) => (
                      <li
                        key={`${order.id}-${item.menuItemId}-${idx}`}
                        className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <VegNonVegBadge isVeg={item.isVeg} />
                          <span className="text-sm font-medium text-[#1F1618] truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-mono tabular-nums text-sm font-bold text-[#5C1422] shrink-0">
                          × {item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {(order.deliveryAddress || order.deliveryLocation) && (
                    <div className="rounded-xl bg-[#FFF7ED] border border-[#FDBA74]/60 px-3.5 py-2.5 text-xs text-[#9A3412] flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#EA580C] shrink-0 mt-0.5" />
                      <div>
                        {order.deliveryAddress && (
                          <p className="font-medium text-[#1F1618]">{order.deliveryAddress}</p>
                        )}
                        {order.deliveryLocation && (
                          <p className="font-mono text-[11px] text-[#9A3412] mt-0.5">
                            {order.deliveryLocation}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {order.notes && (
                    <div className="rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] px-3.5 py-2.5 text-xs text-[#5A494C]">
                      <span className="font-semibold text-[#1F1618]">Note:</span> {order.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Controls */}
              <div className="px-5 py-3.5 bg-[#FAF6F0]/60 border-t border-[#EFE8DE] flex items-center justify-between gap-2.5">
                {order.status === 'Pending' && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(order.id, 'Preparing')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#EA580C] hover:bg-[#D94E07] text-white text-xs font-semibold transition-colors"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Start Preparing</span>
                  </button>
                )}

                {order.status === 'Preparing' && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(order.id, 'Ready')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Ready</span>
                  </button>
                )}

                {order.status === 'Ready' && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(order.id, 'Completed')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#5C1422] hover:bg-[#450D18] text-white text-xs font-semibold transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Complete Order</span>
                  </button>
                )}

                {order.status === 'Completed' && (
                  <span className="flex-1 text-xs font-medium text-[#5C1422] inline-flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4" />
                    <span>Dispatched from Kitchen</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onOpenBilling(order.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-[#E6DDD0] hover:border-[#5C1422] text-xs font-semibold text-[#1F1618] transition-colors whitespace-nowrap"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#5C1422]" />
                  <span>Bill</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
