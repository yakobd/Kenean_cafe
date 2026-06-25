export interface WaiterPerformance {
  name: string;
  totalOrdersServed: number;
  ordersAccepted: number;
  ordersRejected: number;
  orderAccuracyRate: number; // percentage
  averageRating: number;
  totalFeedback: number;
  positiveFeedback: number;
  totalRevenue: number;
  averageServiceTime?: number; // in minutes
}

export interface CashierPerformance {
  name: string;
  dailySalesVolume: number;
  weeklySalesVolume: number;
  totalTransactions: number;
  expensesSubmitted: number;
  expensesApproved: number;
  expensesRejected: number;
  expenseApprovalRate: number; // percentage
  recentPaymentVerifications: PaymentVerification[];
}

export interface PaymentVerification {
  orderId: string;
  customerName: string;
  amount: number;
  timestamp: Date;
  paymentMethod: 'cash' | 'bank-transfer';
  paymentProof?: {
    fileName: string;
    fileData: string;
  };
}

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  staffName: string;
  staffRole: 'waiter' | 'cashier';
  action: string;
  orderId?: string;
  amount?: number;
  details?: string;
}

export interface StaffComparison {
  name: string;
  role: 'waiter' | 'cashier';
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  performanceScore: number; // 0-100
}
