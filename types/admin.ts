export type UserRole = 'admin' | 'super-admin' | 'cashier' | 'waiter';

export interface Employee {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  lastLogin?: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  nameAmharic: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  lastUpdated: Date;
}

export interface MenuItemAdmin {
  id: string;
  name: string;
  nameAmharic: string;
  description: string;
  price: number;
  category: 'Coffee' | 'Breakfast' | 'Pastry';
  image: string;
  inStock: boolean;
  ingredients?: { itemId: string; quantity: number }[];
}

export interface FinancialPeriod {
  daily: {
    revenue: number;
    expenses: number;
    profit: number;
    orders: number;
  };
  monthly: {
    revenue: number;
    expenses: number;
    profit: number;
    orders: number;
  };
  yearly: {
    revenue: number;
    expenses: number;
    profit: number;
    orders: number;
  };
}
