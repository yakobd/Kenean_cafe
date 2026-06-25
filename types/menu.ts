export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // Changed from union type to string for dynamic categories
  image: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
