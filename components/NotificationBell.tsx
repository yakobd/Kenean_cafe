'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';

interface NotificationBellProps {
  theme?: 'light' | 'dark';
}

export default function NotificationBell({ theme = 'light' }: NotificationBellProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const prevUnreadCount = useRef(unreadCount);

  // Trigger ping animation when new notification arrives
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current) {
      setIsPinging(true);
      setTimeout(() => setIsPinging(false), 1000);
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order-placed':
      case 'order-accepted':
        return '🔔';
      case 'order-rejected':
        return '❌';
      case 'bill-requested':
      case 'bill-approved':
      case 'bill-forwarded':
        return '📄';
      case 'payment-submitted':
      case 'payment-verified':
      case 'payment-forwarded':
        return '💳';
      case 'expense-submitted':
      case 'expense-approved':
      case 'expense-rejected':
        return '💰';
      case 'low-stock':
        return '⚠️';
      case 'feedback-submitted':
        return '💬';
      default:
        return '📢';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const isDark = theme === 'dark';
  const bellColor = isDark ? 'text-gray-300' : 'text-charcoal';
  const hoverColor = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${hoverColor}`}
        aria-label="Notifications"
      >
        <Bell className={bellColor} size={24} />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 ${
              isPinging ? 'animate-ping-once' : ''
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Ping Dot Animation */}
        {isPinging && (
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 animate-ping" />
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-xl shadow-2xl border z-50 ${
            isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`font-bold text-lg ${
              isDark ? 'text-white' : 'text-charcoal'
            }`}>
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
                    isDark
                      ? 'text-blue-400 hover:bg-gray-700'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                  title="Mark all as read"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-lg transition-colors ${hoverColor}`}
              >
                <X size={18} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className={`mx-auto mb-3 ${
                  isDark ? 'text-gray-600' : 'text-gray-300'
                }`} size={48} />
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-4 transition-colors ${
                      notification.read
                        ? isDark
                          ? 'bg-gray-800 hover:bg-gray-750'
                          : 'bg-white hover:bg-gray-50'
                        : isDark
                        ? 'bg-gray-700 hover:bg-gray-650'
                        : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`font-semibold text-sm ${
                            isDark ? 'text-white' : 'text-charcoal'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className={`text-sm mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                            {getTimeAgo(notification.timestamp)}
                          </span>
                          {notification.tableNumber && (
                            <span className={`px-2 py-0.5 rounded ${
                              isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}>
                              Table {notification.tableNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mark as read button */}
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className={`p-1 rounded transition-colors ${
                            isDark
                              ? 'hover:bg-gray-600 text-gray-400'
                              : 'hover:bg-gray-200 text-gray-500'
                          }`}
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`p-3 border-t text-center ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => {
                  // Could navigate to a full notifications page
                  setIsOpen(false);
                }}
                className={`text-sm font-medium transition-colors ${
                  isDark
                    ? 'text-blue-400 hover:text-blue-300'
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
