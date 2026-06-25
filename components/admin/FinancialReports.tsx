'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart } from 'lucide-react';
import { Transaction, Expense } from '@/types/finance';
import { FinancialPeriod } from '@/types/admin';
import DateRangeFilter, { DateRange } from '@/components/DateRangeFilter';
import DatePickerModal from '@/components/DatePickerModal';

export default function FinancialReports() {
  const [dateRange, setDateRange] = useState<DateRange>('daily');
  const [customDate, setCustomDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [financialData, setFinancialData] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    orders: 0,
  });

  useEffect(() => {
    calculateFinancials();
  }, [dateRange, customDate]);

  const calculateFinancials = () => {
    const transactions: Transaction[] = JSON.parse(localStorage.getItem('cafe-transactions') || '[]');
    const expenses: Expense[] = JSON.parse(localStorage.getItem('cafe-expenses') || '[]');

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let filteredTransactions: Transaction[] = [];
    let filteredExpenses: Expense[] = [];

    switch (dateRange) {
      case 'daily':
        filteredTransactions = transactions.filter(t => {
          const date = new Date(t.timestamp);
          date.setHours(0, 0, 0, 0);
          return date.getTime() === now.getTime();
        });
        // Only include approved expenses
        filteredExpenses = expenses.filter(e => {
          const date = new Date(e.timestamp);
          date.setHours(0, 0, 0, 0);
          return date.getTime() === now.getTime() && e.status === 'approved';
        });
        break;

      case 'weekly':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        filteredTransactions = transactions.filter(t => new Date(t.timestamp) >= weekAgo);
        // Only include approved expenses
        filteredExpenses = expenses.filter(e => new Date(e.timestamp) >= weekAgo && e.status === 'approved');
        break;

      case 'monthly':
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        monthAgo.setHours(0, 0, 0, 0);
        filteredTransactions = transactions.filter(t => new Date(t.timestamp) >= monthAgo);
        // Only include approved expenses
        filteredExpenses = expenses.filter(e => new Date(e.timestamp) >= monthAgo && e.status === 'approved');
        break;

      case 'custom':
        if (customDate) {
          filteredTransactions = transactions.filter(t => {
            const date = new Date(t.timestamp).toISOString().split('T')[0];
            return date === customDate;
          });
          // Only include approved expenses
          filteredExpenses = expenses.filter(e => {
            const date = new Date(e.timestamp).toISOString().split('T')[0];
            return date === customDate && e.status === 'approved';
          });
        } else {
          filteredTransactions = transactions;
          filteredExpenses = expenses.filter(e => e.status === 'approved');
        }
        break;

      default:
        filteredTransactions = transactions;
        filteredExpenses = expenses.filter(e => e.status === 'approved');
    }

    const revenue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const expenseTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    setFinancialData({
      revenue,
      expenses: expenseTotal,
      profit: revenue - expenseTotal,
      orders: filteredTransactions.length,
    });
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

  const currentData = financialData;
  const profitMargin = currentData.revenue > 0 ? ((currentData.profit / currentData.revenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Business health and analytics</p>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
          <DateRangeFilter
            selectedRange={dateRange}
            onRangeChange={handleDateRangeChange}
            onCalendarClick={() => setShowDatePicker(true)}
            customDateLabel={dateRange === 'custom' && customDate ? getDateRangeLabel() : undefined}
            theme="light"
          />
        </div>

        {/* Date Picker Modal */}
        <DatePickerModal
          isOpen={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelectDate={handleCustomDateSelect}
          theme="light"
        />

        {/* Period Label */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-700">
            Showing financial data for: <span className="font-bold">{getDateRangeLabel()}</span>
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp size={32} />
              <span className="text-sm opacity-90">Revenue</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {currentData.revenue.toFixed(2)} ብር
            </div>
            <div className="text-sm opacity-90">
              {currentData.orders} orders
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingDown size={32} />
              <span className="text-sm opacity-90">Expenses</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {currentData.expenses.toFixed(2)} ብር
            </div>
            <div className="text-sm opacity-90">
              Operating costs
            </div>
          </div>

          {/* Net Profit */}
          <div className={`bg-gradient-to-br ${
            currentData.profit >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'
          } rounded-xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <DollarSign size={32} />
              <span className="text-sm opacity-90">Net Profit</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {currentData.profit.toFixed(2)} ብር
            </div>
            <div className="text-sm opacity-90">
              {profitMargin}% margin
            </div>
          </div>

          {/* Average Order */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart size={32} />
              <span className="text-sm opacity-90">Avg Order</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {currentData.orders > 0 ? (currentData.revenue / currentData.orders).toFixed(2) : '0.00'} ብር
            </div>
            <div className="text-sm opacity-90">
              Per transaction
            </div>
          </div>
        </div>

        {/* Business Health Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Business Health Summary</h2>
          
          <div className="space-y-4">
            {/* Revenue Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Revenue</span>
                <span className="text-sm font-bold text-green-600">
                  {currentData.revenue.toFixed(2)} ብር
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Expenses Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Expenses</span>
                <span className="text-sm font-bold text-red-600">
                  {currentData.expenses.toFixed(2)} ብር
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all"
                  style={{
                    width: currentData.revenue > 0
                      ? `${(currentData.expenses / currentData.revenue) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>

            {/* Profit Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Net Profit</span>
                <span className={`text-sm font-bold ${
                  currentData.profit >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {currentData.profit.toFixed(2)} ብር ({profitMargin}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    currentData.profit >= 0 ? 'bg-blue-500' : 'bg-orange-500'
                  }`}
                  style={{
                    width: currentData.revenue > 0
                      ? `${Math.abs((currentData.profit / currentData.revenue) * 100)}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Insights</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">Total Orders</span>
                <span className="font-bold text-green-600">{currentData.orders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">Profit Margin</span>
                <span className="font-bold text-blue-600">{profitMargin}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-700">Avg Order Value</span>
                <span className="font-bold text-purple-600">
                  {currentData.orders > 0 ? (currentData.revenue / currentData.orders).toFixed(2) : '0.00'} ብር
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Status</h3>
            <div className="space-y-3">
              {currentData.profit >= 0 ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-green-600" size={20} />
                    <span className="font-semibold text-green-900">Profitable</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your business is generating positive returns. Keep up the good work!
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="text-orange-600" size={20} />
                    <span className="font-semibold text-orange-900">Operating at Loss</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Expenses exceed revenue. Consider reviewing costs and pricing.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
