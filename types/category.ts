export interface Category {
  id: string;
  name: string;
  nameAmharic: string;
  description?: string;
  order: number; // For sorting categories
  createdAt: Date;
}

export interface CategoryWithCount extends Category {
  itemCount: number;
}
