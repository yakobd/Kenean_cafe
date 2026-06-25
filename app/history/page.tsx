'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Receipt, Calendar, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import { Order } from '@/types/order';
import DateRangeFilter, { DateRange } from '@/components/DateRangeFilter';
import DatePickerModal from '@/components/DatePickerModal';

export default function CustomerHistoryPage() {
  const { orderSession } = useApp();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('daily');
  const [customDate, setCustomDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Load all completed orders for this customer
  useEffect(() => {
    const loadHistory = () => {
      const storedOrders = localStorage.getItem('cafe-orders-history');
      if (storedOrders) {
        const history: Order[] = JSON.parse(storedOrders);
        // Filter by customer name (in production, use user ID)
        const customerOrders = history.filter(
          order => order.customerName === orderSession.activeOrder?.customerName
        );
        setAllOrders(customerOrders.reverse()); // Most recent first
      }
    };

    loadHistory();
  }, [orderSession.activeOrder?.customerName]);

  // Filter by date range
  useEffect(() => {
    const filterByDateRange = () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      let filtered: Order[] = [];

      switch (dateRange) {
        case 'daily':
          filtered = allOrders.filter(order => {
            const orderDate = new Date(order.timestamp);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === now.getTime();
          });
          break;

        case 'weekly':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          weekAgo.setHours(0, 0, 0, 0);
          filtered = allOrders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate >= weekAgo;
          });
          break;

        case 'monthly':
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          monthAgo.setHours(0, 0, 0, 0);
          filtered = allOrders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate >= monthAgo;
          });
          break;

        case 'custom':
          if (customDate) {
            filtered = allOrders.filter(order => {
              const orderDate = new Date(order.timestamp).toISOString().split('T')[0];
              return orderDate === customDate;
            });
          } else {
            filtered = allOrders;
          }
          break;

        default:
          filtered = allOrders;
      }

      setFilteredOrders(filtered);
      setCurrentPage(1);
    };

    filterByDateRange();
  }, [dateRange, customDate, allOrders]);

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
  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const completedCount = filteredOrders.filter(o => o.status === 'completed').length;

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          <CheckCircle2 size={14} />
          Completed
        </span>
      );
    } else if (status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <XCircle size={14} />
          Cancelled
        </span>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen pb-24 bg-cream">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-charcoal/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-serif text-charcoal mb-2">Order History</h1>
          <p className="text-sm text-charcoal/60">View your past orders at ከነአን Café</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Date Range Filter */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <DateRangeFilter
            selectedRange={dateRange}
            onRangeChange={handleDateRangeChange}
            onCalendarClick={() => setShowDatePicker(true)}
            customDateLabel={dateRange === 'custom' && customDate ? getDateRangeLabel() : undefined}
            theme="light"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <p className="text-charcoal/60 text-sm mb-1">Showing</p>
            <p className="text-2xl font-bold text-charcoal">{getDateRangeLabel()}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <p className="text-charcoal/60 text-sm mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-charcoal">{filteredOrders.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <p className="text-charcoal/60 text-sm mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-gold">{totalAmount} ብር</p>
          </div>
        </div>

        {/* Date Picker Modal */}
        <DatePickerModal
          isOpen={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelectDate={handleCustomDateSelect}
          theme="light"
        />

        {/* Orders List */}
        {currentOrders.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="mx-auto text-charcoal/20 mb-4" size={64} />
            <h2 className="text-xl font-semibold text-charcoal mb-2">
              No Orders Found
            </h2>
            <p className="text-charcoal/60">
              No orders found for {getDateRangeLabel().toLowerCase()}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {currentOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 hover:border-gold/30 transition-colors"
                >
                  {/* Order Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="text-gold" size={18} />
                          <span className="text-sm font-medium text-charcoal">
                            {new Date(order.timestamp).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal/60">
                          {new Date(order.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} • Table {order.tableNumber}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-charcoal/60 mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-gold">{order.total} ብር</p>
                      </div>
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-charcoal hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        View Details
                        {expandedOrderId === order.id ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedOrderId === order.id && (
                    <div className="border-t border-gray-200 bg-gray-50 p-5">
                      <h3 className="text-sm font-bold text-charcoal mb-3">Order Summary</h3>
                      
                      {/* Items */}
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-charcoal">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-semibold text-charcoal">
                                {item.price * item.quantity} ብር
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-charcoal/60 mb-1">Payment Method</p>
                          <p className="text-sm font-medium text-charcoal">
                            {order.paymentMethod === 'cash' ? '💵 Cash' : '📱 Bank Transfer'}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-charcoal/60 mb-1">Transaction ID</p>
                          <p className="text-xs font-mono font-bold text-charcoal">
                            {order.id.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      {/* Special Instructions */}
                      {order.specialInstructions && (
                        <div className="bg-white rounded-lg p-3 mb-4">
                          <p className="text-xs text-charcoal/60 mb-1">Special Instructions</p>
                          <p className="text-sm text-charcoal italic">{order.specialInstructions}</p>
                        </div>
                      )}

                      {/* Feedback */}
                      {order.customerFeedback && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-700 mb-1">Your Feedback</p>
                          <p className="text-sm text-blue-900">{order.customerFeedback}</p>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {order.status === 'rejected' && order.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-xs text-red-700 mb-1">Cancellation Reason</p>
                          <p className="text-sm text-red-900">{order.rejectionReason}</p>
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
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-charcoal hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-gold text-white'
                          : 'bg-white text-charcoal hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-charcoal hover:bg-gray-100 border border-gray-300'
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
