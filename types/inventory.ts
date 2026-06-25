export interface MasterInventoryItem {
  id: string;
  name: string;
  nameAmharic: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number; // Price per unit in ETB
  lowStockThreshold: number;
  lastUpdated: Date;
  updatedBy?: string;
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export function getStockStatus(quantity: number): StockStatus {
  if (quantity === 0) return 'out-of-stock';
  if (quantity <= 5) return 'low-stock';
  return 'in-stock';
}
