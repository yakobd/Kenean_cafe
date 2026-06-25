export interface Transaction {
  id: string;
  orderId: string;
  tableNumber: number;
  customerName: string;
  amount: number;
  paymentMethod: 'cash' | 'bank-transfer';
  timestamp: Date;
  type: 'revenue';
}

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

export interface Expense {
  id: string;
  category: 'supplies' | 'utilities' | 'staff' | 'maintenance' | 'other';
  amount: number;
  description: string;
  timestamp: Date;
  type: 'expense';
  status: ExpenseStatus;
  submittedBy: string; // Cashier name
  reviewedBy?: string; // Admin name
  reviewedAt?: Date;
  rejectionReason?: string;
}

export interface DailySummary {
  totalRevenue: number;
  totalExpenses: number;
  netCash: number;
  transactionCount: number;
  expenseCount: number;
}
