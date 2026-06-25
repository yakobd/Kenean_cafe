export type NotificationType = 
  | 'order-placed'           // Waiter: New order
  | 'order-accepted'         // Customer: Order accepted
  | 'order-rejected'         // Customer: Order rejected
  | 'bill-requested'         // Waiter: Customer requested bill
  | 'bill-approved'          // Customer: Bill approved
  | 'bill-forwarded'         // Cashier: Bill from waiter
  | 'payment-submitted'      // Waiter: Customer submitted payment
  | 'payment-verified'       // Customer: Payment verified
  | 'payment-forwarded'      // Cashier: Payment from waiter
  | 'expense-submitted'      // Admin: Cashier submitted expense
  | 'expense-approved'       // Cashier: Expense approved
  | 'expense-rejected'       // Cashier: Expense rejected
  | 'low-stock'              // Admin: Low stock alert
  | 'feedback-submitted';    // Admin: New feedback

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  orderId?: string;
  tableNumber?: number;
  customerName?: string;
}

export interface NotificationCounts {
  customer: number;
  waiter: number;
  cashier: number;
  admin: number;
}
