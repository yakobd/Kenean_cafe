'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, User, Receipt, Clock, MessageCircle } from 'lucide-react';
import { Order } from '@/types/order';
import Link from 'next/link';
import DateRangeFilter, { DateRange } from '@/components/DateRangeFilter';
import DatePickerModal from '@/components/DatePickerModal';

export default function WaiterLogsPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('daily');
  const [customDate, setCustomDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, any>>({});
  const ordersPerPage = 15;
  const waiterName = 'Waiter-1'; // In production, from auth

  useEffect(() => {
    loadOrders();
  }, [dateRange, customDate]);

  const loadOrders = () => {
    const history = JSON.parse(localStorage.getItem('cafe-orders-history') || '[]');
    
    // Filter orders handled by this waiter
    const waiterOrders = history.filter((order: Order) =>
      order.billReviewedByWaiter?.waiterName === waiterName ||
      order.paymentVerifiedByWaiter?.waiterName === waiterName
    );

    setAllOrders(waiterOrders.reverse());
    filterByDateRange(waiterOrders);
    
    // Load feedback
    const feedbackData = JSON.parse(localStorage.getItem('cafe-feedback') || '[]');
    const feedbackByOrder: Record<string, any> = {};
    feedbackData.forEach((f: any) => {
      feedbackByOrder[f.orderId] = f;
    });
    setFeedbackMap(feedbackByOrder);
  };

  const filterByDateRange = (orders: Order[]) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let filtered: Order[] = [];

    switch (dateRange) {
      case 'daily':
        filtered = orders.filter(order => {
          const orderDate = new Date(order.timestamp);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === now.getTime();
        });
        break;

      case 'weekly':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        filtered = orders.filter(order => {
          const orderDate = new Date(order.timestamp);
          return orderDate >= weekAgo;
        });
        break;

      case 'monthly':
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        monthAgo.setHours(0, 0, 0, 0);
        filtered = orders.filter(order => {
          const orderDate = new Date(order.timestamp);
          return orderDate >= monthAgo;
        });
        break;

      case 'custom':
        if (customDate) {
          filtered = orders.filter(order => {
            const orderDate = new Date(order.timestamp).toISOString().split('T')[0];
            return orderDate === customDate;
          });
        } else {
          filtered = orders;
        }
        break;

      default:
        filtered = orders;
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    if (range !== 'custom') {
      setCustomDate('');
    }
  };

  const handleCustomDateSelect = (date: string) => {
    setCustomDate(date);
    setDateRange('custom');
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'daily':
        return 'Today';
      case 'weekly':
        return 'Last 7 Days';
      case 'monthly':
        return 'Last 30 Days';
      case 'custom':
        return customDate ? new Date(customDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'Custom Date';
      default:
        return '';
    }
  };

  // Calculate stats
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const completedCount = filteredOrders.filter(o => o.status === 'completed').length;

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Order Logs</h1>
              <p className="text-gray-400">ከነአን Café - Waiter Dashboard</p>
            </div>
            <Link
              href="/dashboard/waiter"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Date Range Filter */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 mb-6">
          <DateRangeFilter
            selectedRange={dateRange}
            onRangeChange={handleDateRangeChange}
            onCalendarClick={() => setShowDatePicker(true)}
            customDateLabel={dateRange === 'custom' && customDate ? getDateRangeLabel() : undefined}
            theme="dark"
          />
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Showing</p>
            <p className="text-2xl font-bold text-white">{getDateRangeLabel()}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-white">{filteredOrders.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-400">{totalRevenue} ብር</p>
          </div>
        </div>

        {/* Date Picker Modal */}
        <DatePickerModal
          isOpen={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelectDate={handleCustomDateSelect}
          theme="dark"
        />

        {/* Orders List */}
        {currentOrders.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
            <Receipt className="mx-auto text-gray-600 mb-4" size={64} />
            <h2 className="text-xl font-semibold text-gray-300 mb-2">
              No Orders Found
            </h2>
            <p className="text-gray-500">
              No orders found for {getDateRangeLabel().toLowerCase()}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {currentOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500 transition-colors"
                >
                  {/* Order Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="text-blue-400" size={18} />
                          <span className="text-sm font-medium text-white">
                            {new Date(order.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {order.customerName}
                          </span>
                          <span>Table {order.tableNumber}</span>
                          <span className="font-mono text-xs">{order.id.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-400">{order.total} ብር</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                          order.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                      View Details
                      {expandedOrderId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {expandedOrderId === order.id && (
                    <div className="border-t border-gray-700 bg-gray-900 p-5">
                      {/* Items */}
                      <div className="mb-4">
                        <h4 className="text-sm font-bold text-white mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-300">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-semibold text-white">
                                {item.price * item.quantity} ብር
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Audit Trail */}
                      {(order.billReviewedByWaiter || order.paymentVerifiedByWaiter) && (
                        <div className="bg-gray-800 rounded-lg p-4 mb-4">
                          <h4 className="text-sm font-bold text-white mb-3">Your Actions</h4>
                          <div className="space-y-2 text-sm">
                            {order.billReviewedByWaiter && (
                              <div className="text-gray-300">
                                ✓ Bill reviewed at {new Date(order.billReviewedByWaiter.timestamp).toLocaleTimeString()}
                              </div>
                            )}
                            {order.paymentVerifiedByWaiter && (
                              <div className="text-gray-300">
                                ✓ Payment verified at {new Date(order.paymentVerifiedByWaiter.timestamp).toLocaleTimeString()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Feedback Button */}
                      {feedbackMap[order.id] && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MessageCircle className="text-blue-400" size={20} />
                              <span className="text-sm font-medium text-blue-400">
                                Customer left feedback for this order
                              </span>
                            </div>
                            <Link
                              href="/dashboard/waiter/feedback"
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              View Feedback
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                  }`}
                >
                  Previous
                </button>
                
                <span className="text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
