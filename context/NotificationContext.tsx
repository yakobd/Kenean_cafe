'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification, NotificationType } from '@/types/notification';
import { Order } from '@/types/order';
import { useRole } from './RoleContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { role } = useRole();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastOrderCheck, setLastOrderCheck] = useState<string>('');

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`cafe-notifications-${role}`);
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
  }, [role]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(`cafe-notifications-${role}`, JSON.stringify(notifications));
    }
  }, [notifications, role]);

  // Monitor orders for changes and generate notifications
  useEffect(() => {
    const checkForNotifications = () => {
      const storedOrders = localStorage.getItem('cafe-orders');
      if (!storedOrders) return;

      const orders: Order[] = JSON.parse(storedOrders);
      const ordersKey = JSON.stringify(orders);

      // Only process if orders have changed
      if (ordersKey === lastOrderCheck) return;
      setLastOrderCheck(ordersKey);

      // Role-specific notification logic
      switch (role) {
        case 'customer':
          checkCustomerNotifications(orders);
          break;
        case 'waiter':
          checkWaiterNotifications(orders);
          break;
        case 'cashier':
          checkCashierNotifications(orders);
          break;
        case 'admin':
        case 'super-admin':
          checkAdminNotifications();
          break;
      }
    };

    checkForNotifications();
    const interval = setInterval(checkForNotifications, 2000);
    return () => clearInterval(interval);
  }, [role, lastOrderCheck]);

  const checkCustomerNotifications = (orders: Order[]) => {
    // Get customer's active order
    const activeOrderStr = localStorage.getItem('cafe-active-order');
    if (!activeOrderStr) return;

    const activeOrder = JSON.parse(activeOrderStr);
    const order = orders.find(o => o.id === activeOrder.id);
    if (!order) return;

    // Check for status changes that should notify customer
    const existingNotificationIds = notifications.map(n => n.orderId);

    // Order accepted
    if (order.status === 'preparing' && !existingNotificationIds.includes(`${order.id}-accepted`)) {
      addNotification({
        type: 'order-accepted',
        title: 'Order Accepted! 🎉',
        message: 'Your order is now being prepared by our kitchen.',
        actionUrl: '/orders',
        orderId: `${order.id}-accepted`,
        tableNumber: order.tableNumber,
      });
    }

    // Order rejected
    if (order.status === 'rejected' && !existingNotificationIds.includes(`${order.id}-rejected`)) {
      addNotification({
        type: 'order-rejected',
        title: 'Order Declined ❌',
        message: order.rejectionReason || 'Please check your cart or ask a waiter.',
        actionUrl: '/orders',
        orderId: `${order.id}-rejected`,
        tableNumber: order.tableNumber,
      });
    }

    // Bill approved
    if (order.status === 'awaiting-payment' && !existingNotificationIds.includes(`${order.id}-bill-approved`)) {
      addNotification({
        type: 'bill-approved',
        title: 'Bill Approved ✅',
        message: 'You can now proceed with payment.',
        actionUrl: '/orders',
        orderId: `${order.id}-bill-approved`,
        tableNumber: order.tableNumber,
      });
    }

    // Payment verified
    if (order.status === 'payment-confirmed' && !existingNotificationIds.includes(`${order.id}-payment-verified`)) {
      addNotification({
        type: 'payment-verified',
        title: 'Payment Confirmed! 💳',
        message: 'Your payment has been verified. Thank you!',
        actionUrl: '/orders',
        orderId: `${order.id}-payment-verified`,
        tableNumber: order.tableNumber,
      });
    }
  };

  const checkWaiterNotifications = (orders: Order[]) => {
    const existingNotificationIds = notifications.map(n => n.orderId);

    orders.forEach(order => {
      // New order placed
      if (order.status === 'pending' && !existingNotificationIds.includes(`${order.id}-placed`)) {
        addNotification({
          type: 'order-placed',
          title: 'New Order! 🔔',
          message: `Table ${order.tableNumber} - ${order.customerName}`,
          actionUrl: '/dashboard/waiter',
          orderId: `${order.id}-placed`,
          tableNumber: order.tableNumber,
          customerName: order.customerName,
        });
      }

      // Bill requested
      if (order.status === 'bill-waiter-review' && !existingNotificationIds.includes(`${order.id}-bill-requested`)) {
        addNotification({
          type: 'bill-requested',
          title: 'Bill Requested 📄',
          message: `Table ${order.tableNumber} - ${order.customerName}`,
          actionUrl: '/dashboard/waiter',
          orderId: `${order.id}-bill-requested`,
          tableNumber: order.tableNumber,
          customerName: order.customerName,
        });
      }

      // Payment submitted
      if (order.status === 'payment-submitted' && !existingNotificationIds.includes(`${order.id}-payment-submitted`)) {
        addNotification({
          type: 'payment-submitted',
          title: 'Payment Submitted 💰',
          message: `Table ${order.tableNumber} - ${order.customerName}`,
          actionUrl: '/dashboard/waiter',
          orderId: `${order.id}-payment-submitted`,
          tableNumber: order.tableNumber,
          customerName: order.customerName,
        });
      }
    });
  };

  const checkCashierNotifications = (orders: Order[]) => {
    const existingNotificationIds = notifications.map(n => n.orderId);

    orders.forEach(order => {
      // Bill forwarded by waiter
      if (order.status === 'bill-cashier-review' && !existingNotificationIds.includes(`${order.id}-bill-forwarded`)) {
        addNotification({
          type: 'bill-forwarded',
          title: 'Bill for Approval 📋',
          message: `Table ${order.tableNumber} - ${order.total} ብር`,
          actionUrl: '/dashboard/cashier',
          orderId: `${order.id}-bill-forwarded`,
          tableNumber: order.tableNumber,
          customerName: order.customerName,
        });
      }

      // Payment forwarded by waiter
      if (order.status === 'payment-waiter-verified' && !existingNotificationIds.includes(`${order.id}-payment-forwarded`)) {
        addNotification({
          type: 'payment-forwarded',
          title: 'Payment for Confirmation 💳',
          message: `Table ${order.tableNumber} - ${order.total} ብር`,
          actionUrl: '/dashboard/cashier',
          orderId: `${order.id}-payment-forwarded`,
          tableNumber: order.tableNumber,
          customerName: order.customerName,
        });
      }
    });

    // Check for expense approvals/rejections
    const expenses = localStorage.getItem('cafe-expenses');
    if (expenses) {
      const expenseItems = JSON.parse(expenses);
      const cashierName = 'Cashier-1'; // In production, from auth
      
      expenseItems.forEach((expense: any) => {
        if (expense.submittedBy === cashierName) {
          // Expense approved
          if (expense.status === 'approved' && !existingNotificationIds.includes(`expense-approved-${expense.id}`)) {
            addNotification({
              type: 'expense-approved',
              title: 'Expense Approved ✅',
              message: `${expense.amount} ብር - ${expense.category}`,
              actionUrl: '/dashboard/cashier',
              orderId: `expense-approved-${expense.id}`,
            });
          }

          // Expense rejected
          if (expense.status === 'rejected' && !existingNotificationIds.includes(`expense-rejected-${expense.id}`)) {
            addNotification({
              type: 'expense-rejected',
              title: 'Expense Rejected ❌',
              message: expense.rejectionReason || `${expense.amount} ብር - ${expense.category}`,
              actionUrl: '/dashboard/cashier',
              orderId: `expense-rejected-${expense.id}`,
            });
          }
        }
      });
    }
  };

  const checkAdminNotifications = () => {
    // Check for pending expenses
    const expenses = localStorage.getItem('cafe-expenses');
    if (expenses) {
      const expenseItems = JSON.parse(expenses);
      const pendingExpenses = expenseItems.filter((e: any) => e.status === 'pending');
      
      pendingExpenses.forEach((expense: any) => {
        const existingNotificationIds = notifications.map(n => n.orderId);
        if (!existingNotificationIds.includes(`expense-${expense.id}`)) {
          addNotification({
            type: 'expense-submitted',
            title: 'Expense Approval Needed 💰',
            message: `${expense.submittedBy}: ${expense.amount} ብር - ${expense.category}`,
            actionUrl: '/dashboard/admin?section=expenses',
            orderId: `expense-${expense.id}`,
          });
        }
      });
    }

    // Check for low stock (placeholder - would need inventory system)
    const inventory = localStorage.getItem('cafe-master-inventory');
    if (inventory) {
      const items = JSON.parse(inventory);
      const lowStockItems = items.filter((item: any) => item.quantity < item.lowStockThreshold);
      
      lowStockItems.forEach((item: any) => {
        const existingNotificationIds = notifications.map(n => n.orderId);
        if (!existingNotificationIds.includes(`low-stock-${item.id}`)) {
          addNotification({
            type: 'low-stock',
            title: 'Low Stock Alert ⚠️',
            message: `${item.name} is running low (${item.quantity} remaining)`,
            actionUrl: '/dashboard/admin?section=inventory',
            orderId: `low-stock-${item.id}`,
          });
        }
      });
    }

    // Check for new feedback (placeholder)
    const feedback = localStorage.getItem('cafe-feedback');
    if (feedback) {
      const feedbackItems = JSON.parse(feedback);
      const unreadFeedback = feedbackItems.filter((f: any) => !f.read);
      
      unreadFeedback.forEach((f: any) => {
        const existingNotificationIds = notifications.map(n => n.orderId);
        if (!existingNotificationIds.includes(`feedback-${f.id}`)) {
          addNotification({
            type: 'feedback-submitted',
            title: 'New Feedback 💬',
            message: f.message.substring(0, 50) + '...',
            actionUrl: '/dashboard/admin?section=feedback',
            orderId: `feedback-${f.id}`,
          });
        }
      });
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem(`cafe-notifications-${role}`);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
