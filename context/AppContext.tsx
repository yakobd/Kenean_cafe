'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '@/types/menu';
import { Order, OrderSession, OrderStatus } from '@/types/order';

interface AppContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  orderSession: OrderSession;
  placeOrder: (orderDetails: {
    customerName: string;
    tableNumber: number;
    paymentMethod: 'cash' | 'bank-transfer';
    specialInstructions?: string;
  }) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  hasNotification: boolean;
  clearNotification: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('cafe-cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [orderSession, setOrderSession] = useState<OrderSession>({
    orders: [],
    activeOrder: null,
  });
  const [hasNotification, setHasNotification] = useState(false);

  // Persist cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem('cafe-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const placeOrder = (orderDetails: {
    customerName: string;
    tableNumber: number;
    paymentMethod: 'cash' | 'bank-transfer';
    specialInstructions?: string;
  }) => {
    if (cartItems.length === 0) return;

    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      items: [...cartItems],
      status: 'pending',
      timestamp: new Date(),
      total,
      customerName: orderDetails.customerName,
      tableNumber: orderDetails.tableNumber,
      paymentMethod: orderDetails.paymentMethod,
      specialInstructions: orderDetails.specialInstructions,
    };

    setOrderSession((prev) => ({
      orders: [...prev.orders, newOrder],
      activeOrder: newOrder,
    }));

    // Save to localStorage for waiter dashboard
    const existingOrders = localStorage.getItem('cafe-orders');
    const allOrders = existingOrders ? JSON.parse(existingOrders) : [];
    allOrders.push(newOrder);
    localStorage.setItem('cafe-orders', JSON.stringify(allOrders));

    clearCart();
    localStorage.removeItem('cafe-cart');
    setHasNotification(true);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrderSession((prev) => ({
      ...prev,
      orders: prev.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
      activeOrder:
        prev.activeOrder?.id === orderId
          ? { ...prev.activeOrder, status }
          : prev.activeOrder,
    }));

    // Update localStorage for waiter dashboard
    const storedOrders = JSON.parse(localStorage.getItem('cafe-orders') || '[]');
    const updatedOrders = storedOrders.map((order: Order) =>
      order.id === orderId ? { ...order, status } : order
    );

    // Archive completed or rejected orders to history and remove from active list
    if (status === 'completed' || status === 'rejected') {
      const orderToArchive = updatedOrders.find((o: Order) => o.id === orderId);
      if (orderToArchive) {
        const history = JSON.parse(localStorage.getItem('cafe-orders-history') || '[]');
        history.push(orderToArchive);
        localStorage.setItem('cafe-orders-history', JSON.stringify(history));
      }
      const activeOrders = updatedOrders.filter((o: Order) => o.id !== orderId);
      localStorage.setItem('cafe-orders', JSON.stringify(activeOrders));
    } else {
      localStorage.setItem('cafe-orders', JSON.stringify(updatedOrders));
    }
  };

  const clearNotification = () => {
    setHasNotification(false);
  };

  return (
    <AppContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        clearCart,
        orderSession,
        placeOrder,
        updateOrderStatus,
        hasNotification,
        clearNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
