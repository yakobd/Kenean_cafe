export interface Feedback {
  id: string;
  orderId: string;
  customerName: string;
  tableNumber: number;
  comment: string;
  rating?: number; // 1-5 stars
  timestamp: Date;
  waiterName?: string;
  cashierName?: string;
  pinned: boolean;
  archived: boolean;
}
