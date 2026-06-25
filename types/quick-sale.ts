import { CartItem } from './menu';
import { PaymentMethod } from './order';

export interface QuickSale {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  timestamp: Date;
  staffName: string;
  staffRole: 'waiter' | 'cashier' | 'admin' | 'super-admin';
  type: 'quick-sale'; // Flag to distinguish from regular orders
}
