import { Order, RestaurantSettings } from '../types';

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatINRWhole(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export interface OrderTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  totalTax: number;
  grandTotal: number;
}

export function calculateOrderTotals(
  order: Pick<Order, 'items' | 'discountPercent'>,
  settings: Pick<RestaurantSettings, 'cgstRate' | 'sgstRate'>
): OrderTotals {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * (order.discountPercent || 0)) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const cgst = Number(((taxableAmount * settings.cgstRate) / 100).toFixed(2));
  const sgst = Number(((taxableAmount * settings.sgstRate) / 100).toFixed(2));
  const totalTax = Number((cgst + sgst).toFixed(2));
  const grandTotal = Math.round(taxableAmount + totalTax);

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    cgst,
    sgst,
    totalTax,
    grandTotal,
  };
}

export function calculateCartTotals(
  items: { price: number; quantity: number }[],
  cgstRate: number,
  sgstRate: number,
  discountPercent = 0
): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const cgst = Number(((taxableAmount * cgstRate) / 100).toFixed(2));
  const sgst = Number(((taxableAmount * sgstRate) / 100).toFixed(2));
  const totalTax = Number((cgst + sgst).toFixed(2));
  const grandTotal = Math.round(taxableAmount + totalTax);

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    cgst,
    sgst,
    totalTax,
    grandTotal,
  };
}
