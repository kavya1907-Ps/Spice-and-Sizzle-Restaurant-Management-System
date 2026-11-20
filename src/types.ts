export type UserRole = 'user' | 'restaurant';

export interface AuthSession {
  role: UserRole;
  name: string;
  identifier: string; // phone or email/staff ID
  staffTitle?: string;
}

export type CustomerSection = 'browse' | 'cart' | 'my-orders' | 'my-bills';

export type NavSection =
  | 'dashboard'
  | 'menu'
  | 'categories'
  | 'new-order'
  | 'kitchen'
  | 'billing'
  | 'reports'
  | 'settings';

export type FoodCategory =
  | 'South Indian'
  | 'North Indian'
  | 'Biryani'
  | 'Chinese'
  | 'Starters'
  | 'Snacks'
  | 'Desserts'
  | 'Beverages';

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Completed';

export type OrderType = 'Dine-in' | 'Takeaway';

export type PaymentMethod = 'Cash' | 'UPI' | 'Card';

export interface MenuItem {
  id: string;
  name: string;
  category: FoodCategory;
  price: number;
  isVeg: boolean;
  description: string;
  image: string;
  prepMinutes: number;
  popular?: boolean;
  available: boolean;
  ordersToday: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  category: FoodCategory;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: string;
  deliveryLocation?: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string; // ISO string or display time
  elapsedMinutes: number;
  notes?: string;
  paymentStatus: 'Unpaid' | 'Paid';
  paymentMethod?: PaymentMethod;
  discountPercent: number;
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  gstin: string;
  fssai: string;
  cgstRate: number;
  sgstRate: number;
  totalTables: number;
  upiId: string;
}

export interface HourlySalePoint {
  label: string;
  revenue: number;
  orders: number;
}
