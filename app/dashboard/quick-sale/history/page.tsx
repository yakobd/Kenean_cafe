'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  DollarSign,
  CreditCard,
  Banknote,
  Calendar,
} from 'lucide-react';
import { QuickSale } from '@/types/quick-sale';
import { useRole } from '@/context/RoleContext';
import DateRangeFilter, { DateRange } from '@/components/DateRangeFilter';
import DatePickerModal from '@/components/DatePickerModal';

export default function QuickSaleHistoryPage() {
  const router = useRouter();
  const { role } = useRole();
  const [allSales, setAllSales] = useState<QuickSale[]>([]);
  const [filteredSales, setFilteredSales] = useState<QuickSale[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('daily');
  const [customDate, setCustomDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const salesPerPage = 15;

  // Redirect if not staff
  useEffect(() => {
    if (role === 'customer') {
      router.push('/');
      return;
    }

    loadSales();
  }, [role, router, dateRange, customDate]);

  const loadSales = () => {
    const stored = localStorage.getItem('cafe-quick-sales');
    if (!stored) {
      setAllSales([]);
      setFilteredSales([]);
      return;
    }

    const sales: QuickSale[] = JSON.parse(stored);
    setAllSales(sales.reverse());
    filterByDateRange(sales);
  };

  const filterByDateRange = (sales: QuickSale[]) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let filtered: QuickSale[] = [];

    switch (dateRange) {
      case 'daily':
        filtered = sales.filter(sale => {
          const saleDate = new Date(sale.timestamp);
          saleDate.setHours(0, 0, 0, 0);
          return saleDate.getTime() === now.getTime();
        });
        break;

      case 'weekly':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        filtered = sales.filter(sale => {
          const saleDate = new Date(sale.timestamp);
          return saleDate >= weekAgo;
        });
        break;

      case 'monthly':
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        monthAgo.setHours(0, 0, 0, 0);
        filtered = sales.filter(sale => {
          const saleDate = new Date(sale.timestamp);
          return saleDate >= monthAgo;
        });
        break;

      case 'custom':
        if (customDate) {
          filtered = sales.filter(sale => {
            const saleDate = new Date(sale.timestamp).toISOString().split('T')[0];
            return saleDate === customDate;
          });
        } else {
          filtered = sales;
        }
        break;

      default:
        filtered = sales;
    }

    setFilteredSales(filtered);
    setCurrentPage(1);
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

  const toggleExpand = (saleId: string) => {
    setExpandedSaleId(expandedSaleId === saleId ? null : saleId);
  };

  // Pagination
  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);
  const totalPages = Math.ceil(filteredSales.length / salesPerPage);

  // Calculate stats
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const cashSales = filteredSales.filter(s => s.paymentMethod === 'cash').length;
  const transferSales = filteredSales.filter(s => s.paymentMethod === 'bank-transfer').length;

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="text-blue-400" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-white">Quick Sales History</h1>
                <p className="text-gray-400">Track all direct sales transactions</p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Back
            </button>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Showing</p>
            <p className="text-2xl font-bold text-white">{getDateRangeLabel()}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Sales</p>
            <p className="text-3xl font-bold text-white">{filteredSales.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-400">{totalRevenue.toFixed(0)} ብር</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Payment Methods</p>
            <div className="flex gap-2 mt-2">
              <span className="text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded">
                {cashSales} Cash
              </span>
              <span className="text-sm bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                {transferSales} Transfer
              </span>
            </div>
          </div>
        </div>

        {/* Date Picker Modal */}
        <DatePickerModal
          isOpen={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelectDate={handleCustomDateSelect}
          theme="dark"
        />

        {/* Sales List */}
        {currentSales.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
            <ShoppingCart className="mx-auto text-gray-600 mb-4" size={64} />
            <h2 className="text-xl font-semibold text-gray-300 mb-2">
              No Quick Sales Found
            </h2>
            <p className="text-gray-500">
              No quick sales recorded for {getDateRangeLabel().toLowerCase()}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {currentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500 transition-colors"
                >
                  {/* Sale Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="text-blue-400" size={18} />
                          <span className="text-sm font-medium text-white">
                            {new Date(sale.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {sale.staffName} ({sale.staffRole})
                          </span>
                          <span className="font-mono text-xs">{sale.id.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-400">{sale.total.toFixed(0)} ብር</p>
                        <div className="flex items-center gap-2 mt-2">
                          {sale.paymentMethod === 'cash' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                              <Banknote size={14} />
                              Cash
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                              <CreditCard size={14} />
                              Transfer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(sale.id)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                      View Details
                      {expandedSaleId === sale.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {expandedSaleId === sale.id && (
                    <div className="border-t border-gray-700 bg-gray-900 p-5">
                      {/* Items */}
                      <div className="mb-4">
                        <h4 className="text-sm font-bold text-white mb-3">Items Sold</h4>
                        <div className="space-y-2">
                          {sale.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-300">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-semibold text-white">
                                {(item.price * item.quantity).toFixed(0)} ብር
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-white mb-3">Payment Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Method:</span>
                            <span className="text-white font-semibold">
                              {sale.paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'}
                            </span>
                          </div>
                          {sale.referenceNumber && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Reference:</span>
                              <span className="text-white font-mono text-xs">{sale.referenceNumber}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-gray-700">
                            <span className="text-gray-400">Total:</span>
                            <span className="text-blue-400 font-bold text-lg">{sale.total.toFixed(0)} ብር</span>
                          </div>
                        </div>
                      </div>
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
