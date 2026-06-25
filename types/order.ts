import { CartItem } from './menu';

export type OrderStatus = 
  | 'pending'                  // Order placed, awaiting waiter acceptance
  | 'rejected'                 // Waiter rejected order
  | 'preparing'                // Waiter accepted, kitchen preparing
  | 'served'                   // Food delivered to table
  | 'bill-waiter-review'       // Waiter reviewing bill request
  | 'bill-cashier-review'      // Cashier reviewing waiter-approved bill
  | 'awaiting-payment'         // Bill approved, waiting for payment
  | 'payment-submitted'        // Customer uploaded payment proof
  | 'payment-waiter-verified'  // Waiter verified payment
  | 'payment-confirmed'        // Cashier confirmed payment
  | 'completed';               // Order fully completed

export type PaymentMethod = 'cash' | 'bank-transfer';

export interface PaymentProof {
  fileName: string;
  fileData: string; // base64 encoded
  uploadedAt: Date;
}

export interface Order {
  id: string;
  items: CartItem[];
  status: OrderStatus;
  timestamp: Date;
  total: number;
  customerName: string;
  tableNumber: number;
  paymentMethod: PaymentMethod;
  specialInstructions?: string;
  rejectionReason?: string;
  paymentProof?: PaymentProof;
  paymentReferenceNote?: string;
  customerFeedback?: string;
  
  // Audit trail for sequential approval
  billReviewedByWaiter?: {
    timestamp: Date;
    waiterName: string;
  };
  billApprovedByCashier?: {
    timestamp: Date;
    cashierName: string;
  };
  paymentVerifiedByWaiter?: {
    timestamp: Date;
    waiterName: string;
  };
  paymentConfirmedByCashier?: {
    timestamp: Date;
    cashierName: string;
  };
}

export interface OrderSession {
  orders: Order[];
  activeOrder: Order | null;
}
