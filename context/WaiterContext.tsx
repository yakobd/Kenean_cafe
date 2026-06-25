'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Order, OrderStatus } from '@/types/order';

interface WaiterContextType {
  allOrders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  hasNewOrders: boolean;
  clearNewOrdersFlag: () => void;
}

const WaiterContext = createContext<WaiterContextType | undefined>(undefined);

export function WaiterProvider({ children }: { children: ReactNode }) {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [hasNewOrders, setHasNewOrders] = useState(false);

  // Listen for new orders from localStorage (simulating real-time)
  useEffect(() => {
    const checkForNewOrders = () => {
      const storedOrders = localStorage.getItem('cafe-orders');
      if (storedOrders) {
        const orders: Order[] = JSON.parse(storedOrders);
        setAllOrders(orders);
        
        // Check if there are any pending orders
        const hasPending = orders.some(order => order.status === 'pending');
        if (hasPending) {
          setHasNewOrders(true);
        }
      }
    };

    // Initial check
    checkForNewOrders();

    // Poll every 2 seconds for new orders
    const interval = setInterval(checkForNewOrders, 2000);

    return () => clearInterval(interval);
  }, []);

  const addOrder = (order: Order) => {
    setAllOrders(prev => {
      const updated = [...prev, order];
      localStorage.setItem('cafe-orders', JSON.stringify(updated));
      return updated;
    });
    setHasNewOrders(true);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setAllOrders(prev => {
      const updated = prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      );
      localStorage.setItem('cafe-orders', JSON.stringify(updated));
      return updated;
    });
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return allOrders.filter(order => order.status === status);
  };

  const clearNewOrdersFlag = () => {
    setHasNewOrders(false);
  };

  return (
    <WaiterContext.Provider
      value={{
        allOrders,
        addOrder,
        updateOrderStatus,
        getOrdersByStatus,
        hasNewOrders,
        clearNewOrdersFlag,
      }}
    >
      {children}
    </WaiterContext.Provider>
  );
}

export function useWaiter() {
  const context = useContext(WaiterContext);
  if (context === undefined) {
    throw new Error('useWaiter must be used within a WaiterProvider');
  }
  return context;
}
