import React, { useMemo, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Printer,
  QrCode,
  Receipt,
  Smartphone,
} from 'lucide-react';
import { Order, PaymentMethod, RestaurantSettings } from '../types';
import { calculateOrderTotals, formatINR, formatINRWhole } from '../utils/posUtils';
import { OrderStatusBadge } from '../components/OrderStatusBadge';

interface BillingViewProps {
  orders: Order[];
  selectedOrderId: string;
  settings: RestaurantSettings;
  onSelectOrder: (orderId: string) => void;
  onSetDiscount: (orderId: string, discountPercent: number) => void;
  onCompletePayment: (orderId: string, method: PaymentMethod) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  orders,
  selectedOrderId,
  settings,
  onSelectOrder,
  onSetDiscount,
  onCompletePayment,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [filterPayment, setFilterPayment] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [printFeedback, setPrintFeedback] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filterPayment === 'unpaid') return o.paymentStatus === 'Unpaid';
      if (filterPayment === 'paid') return o.paymentStatus === 'Paid';
      return true;
    });
  }, [orders, filterPayment]);

  const activeOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedOrderId) || orders[0];
  }, [orders, selectedOrderId]);

  const totals = activeOrder
    ? calculateOrderTotals(activeOrder, settings)
    : null;

  const handlePrint = () => {
    setPrintFeedback(true);
    setTimeout(() => setPrintFeedback(false), 2200);
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1618]">
            Billing &amp; GST Tax Invoice
          </h1>
          <p className="text-sm text-[#6E5C60] mt-1">
            Generate Indian GST restaurant receipts and accept Cash, UPI, or Card payments
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#EFE8DE] self-start">
          {(
            [
              { id: 'all', label: 'All Bills' },
              { id: 'unpaid', label: 'Unpaid' },
              { id: 'paid', label: 'Paid' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterPayment(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                filterPayment === tab.id
                  ? 'bg-white text-[#5C1422] shadow-xs'
                  : 'text-[#6E5C60] hover:text-[#1F1618]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Order List */}
        <div className="xl:col-span-5 bg-white rounded-2xl border border-[#E6DDD0] p-4 space-y-2">
          <p className="text-xs font-semibold text-[#6E5C60] px-2 pb-1">
            Select Order to Settle or Print
          </p>

          {filteredOrders.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6E5C60]">
              No orders match this payment filter.
            </div>
          ) : (
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredOrders.map((order) => {
                const ordTotals = calculateOrderTotals(order, settings);
                const isSelected = activeOrder?.id === order.id;
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => onSelectOrder(order.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#FAF6F0] border-[#5C1422] shadow-xs'
                        : 'bg-white border-[#EFE8DE] hover:border-[#C69214]/60'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums text-sm font-bold text-[#5C1422]">
                          #{order.orderNumber}
                        </span>
                        <span className="text-sm font-semibold text-[#1F1618] truncate">
                          {order.customerName}
                        </span>
                      </div>
                      <p className="text-xs text-[#6E5C60] mt-1">
                        {order.orderType === 'Dine-in' && order.tableNumber
                          ? `${order.orderType} · ${order.tableNumber}`
                          : order.orderType}{' '}
                        · {order.paymentStatus === 'Paid' ? `Paid (${order.paymentMethod})` : 'Payment Due'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="font-mono tabular-nums text-sm font-bold text-[#1F1618]">
                        {formatINRWhole(ordTotals.grandTotal)}
                      </span>
                      <OrderStatusBadge status={order.status} compact />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Receipt Preview + Payment Actions */}
        {activeOrder && totals ? (
          <div className="xl:col-span-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Indian Restaurant Receipt Paper */}
            <div
              id="printable-receipt"
              className="lg:col-span-7 bg-white rounded-2xl border border-[#E6DDD0] p-6 shadow-sm font-mono text-xs text-[#1F1618]"
            >
              <div className="text-center border-b border-dashed border-[#D5C9BA] pb-4">
                <p className="font-display text-xl font-bold tracking-wide text-[#5C1422]">
                  {settings.name}
                </p>
                <p className="text-[11px] text-[#5A494C] mt-1 font-sans">{settings.address}</p>
                <p className="text-[11px] text-[#5A494C] mt-0.5 tabular-nums">
                  Tel: {settings.phone}
                </p>
                <p className="text-[11px] text-[#5A494C] mt-0.5 tabular-nums">
                  GSTIN: {settings.gstin} · FSSAI: {settings.fssai}
                </p>
              </div>

              <div className="py-3 border-b border-dashed border-[#D5C9BA] space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#6E5C60]">Invoice No:</span>
                  <span className="font-bold tabular-nums">INV-{activeOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E5C60]">Guest:</span>
                  <span className="font-semibold font-sans">{activeOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E5C60]">Phone:</span>
                  <span className="tabular-nums">{activeOrder.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E5C60]">Service:</span>
                  <span>
                    {activeOrder.orderType}
                    {activeOrder.tableNumber ? ` (${activeOrder.tableNumber})` : ''} ·{' '}
                    {activeOrder.createdAt}
                  </span>
                </div>
                {(activeOrder.deliveryAddress || activeOrder.deliveryLocation) && (
                  <div className="pt-1 flex justify-between gap-4">
                    <span className="text-[#6E5C60] shrink-0">Address:</span>
                    <span className="font-sans text-right text-[#1F1618]">
                      {activeOrder.deliveryAddress || activeOrder.deliveryLocation}
                    </span>
                  </div>
                )}
              </div>

              {/* Line Items */}
              <div className="py-3 border-b border-dashed border-[#D5C9BA]">
                <div className="grid grid-cols-12 font-bold text-[11px] text-[#5A494C] pb-2 border-b border-[#F1EAE0]">
                  <span className="col-span-6">ITEM</span>
                  <span className="col-span-2 text-center">QTY</span>
                  <span className="col-span-2 text-right">RATE</span>
                  <span className="col-span-2 text-right">AMT</span>
                </div>
                <div className="divide-y divide-[#F7F2EB]">
                  {activeOrder.items.map((item, i) => (
                    <div key={`${item.menuItemId}-${i}`} className="grid grid-cols-12 py-2 items-center">
                      <span className="col-span-6 font-sans font-medium pr-2">{item.name}</span>
                      <span className="col-span-2 text-center tabular-nums">{item.quantity}</span>
                      <span className="col-span-2 text-right tabular-nums">{item.price}</span>
                      <span className="col-span-2 text-right font-semibold tabular-nums">
                        {item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & GST */}
              <div className="py-3 space-y-1.5 text-[11px] border-b border-dashed border-[#D5C9BA]">
                <div className="flex justify-between">
                  <span className="text-[#6E5C60]">Subtotal</span>
                  <span className="tabular-nums font-medium">{formatINR(totals.subtotal)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-[#15803D]">
                    <span>Loyalty Discount ({activeOrder.discountPercent}%)</span>
                    <span className="tabular-nums">-{formatINR(totals.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#6E5C60]">CGST @ {settings.cgstRate}%</span>
                  <span className="tabular-nums">{formatINR(totals.cgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E5C60]">SGST @ {settings.sgstRate}%</span>
                  <span className="tabular-nums">{formatINR(totals.sgst)}</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between text-base font-bold text-[#5C1422]">
                <span className="font-sans">GRAND TOTAL</span>
                <span className="tabular-nums">{formatINRWhole(totals.grandTotal)}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-dashed border-[#D5C9BA] text-center text-[11px] text-[#6E5C60] space-y-1">
                <p className="font-semibold text-[#1F1618]">
                  {activeOrder.paymentStatus === 'Paid'
                    ? `PAID VIA ${activeOrder.paymentMethod?.toUpperCase()}`
                    : 'PAYMENT PENDING'}
                </p>
                <p className="font-sans">Thank you for dining with Spice &amp; Sizzle!</p>
              </div>
            </div>

            {/* Payment & Print Control Panel */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E6DDD0] p-5 space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold text-[#1F1618]">
                  Settlement &amp; Print
                </h2>
                <p className="text-xs text-[#6E5C60] mt-0.5">
                  Choose discount &amp; payment mode
                </p>
              </div>

              {/* Quick Discount */}
              <div>
                <span className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                  Apply Guest Discount
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 5, 10].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => onSetDiscount(activeOrder.id, pct)}
                      className={`py-2 rounded-xl text-xs font-mono font-semibold border transition-colors ${
                        activeOrder.discountPercent === pct
                          ? 'bg-[#5C1422] text-white border-[#5C1422]'
                          : 'bg-[#FAF6F0] text-[#5A494C] border-[#E6DDD0] hover:border-[#5C1422]'
                      }`}
                    >
                      {pct === 0 ? 'None' : `${pct}% Off`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <span className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                  Payment Method
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'Cash', icon: Banknote },
                      { id: 'UPI', icon: Smartphone },
                      { id: 'Card', icon: CreditCard },
                    ] as const
                  ).map((method) => {
                    const Icon = method.icon;
                    const active = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold transition-all ${
                          active
                            ? 'bg-[#FFF7ED] border-[#EA580C] text-[#C2410C]'
                            : 'bg-[#FAF6F0] border-[#E6DDD0] text-[#5A494C] hover:border-[#C69214]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{method.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {paymentMethod === 'UPI' && (
                <div className="rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] p-3.5 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white border border-[#E6DDD0] flex items-center justify-center shrink-0">
                    <QrCode className="w-7 h-7 text-[#5C1422]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1F1618]">Instant UPI Collect</p>
                    <p className="text-[11px] font-mono text-[#6E5C60] truncate">
                      {settings.upiId}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2.5 pt-1">
                {activeOrder.paymentStatus === 'Unpaid' ? (
                  <button
                    type="button"
                    onClick={() => onCompletePayment(activeOrder.id, paymentMethod)}
                    className="w-full py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Collect {formatINRWhole(totals.grandTotal)} via {paymentMethod}
                    </span>
                  </button>
                ) : (
                  <div className="w-full py-2.5 px-3 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] text-xs font-semibold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Settled via {activeOrder.paymentMethod}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full py-3 rounded-xl bg-[#5C1422] hover:bg-[#EA580C] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>{printFeedback ? 'Preparing Print Preview...' : 'Print Bill'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="xl:col-span-7 bg-white rounded-2xl border border-[#E6DDD0] p-12 text-center">
            <Receipt className="w-10 h-10 text-[#9E8B8F] mx-auto mb-3" />
            <p className="font-display text-lg font-bold text-[#1F1618]">No order selected</p>
          </div>
        )}
      </div>
    </div>
  );
};
