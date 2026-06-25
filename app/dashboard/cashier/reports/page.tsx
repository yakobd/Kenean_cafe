'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Download,
  Printer,
  CreditCard,
  Wallet,
  BarChart3,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { Transaction, Expense } from '@/types/finance';
import DateRangeFilter, { DateRange } from '@/components/DateRangeFilter';
import DatePickerModal from '@/components/DatePickerModal';

interface PaymentBreakdown {
  cash: number;
  bankTransfer: number;
}

interface DayReport {
  date: string;
  revenue: number;
  expenses: number;
  net: number;
}

export default function CashierReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('daily');
  const [customDate, setCustomDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const printRef = useRef<HTMLDivElement>(null);
  
  const cashierName = 'Cashier-1'; // In production, from auth

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedTransactions = localStorage.getItem('cafe-transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }

    const storedExpenses = localStorage.getItem('cafe-expenses');
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    }
  };

  const filterByDateRange = (items: (Transaction | Expense)[]) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (dateRange) {
      case 'daily':
        return items.filter(item => {
          const itemDate = new Date(item.timestamp);
          itemDate.setHours(0, 0, 0, 0);
          return itemDate.getTime() === now.getTime();
        });

      case 'weekly':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        return items.filter(item => new Date(item.timestamp) >= weekAgo);

      case 'monthly':
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        monthAgo.setHours(0, 0, 0, 0);
        return items.filter(item => new Date(item.timestamp) >= monthAgo);

      case 'custom':
        if (customDate) {
          return items.filter(item => {
            const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
            return itemDate === customDate;
          });
        }
        return items;

      default:
        return items;
    }
  };

  const filteredTransactions = filterByDateRange(transactions) as Transaction[];
  const filteredExpenses = filterByDateRange(expenses).filter((e: any) => e.status === 'approved') as Expense[];

  const calculateSummary = () => {
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalRevenue - totalExpenses;

    const paymentBreakdown: PaymentBreakdown = {
      cash: filteredTransactions
        .filter(t => t.paymentMethod === 'cash')
        .reduce((sum, t) => sum + t.amount, 0),
      bankTransfer: filteredTransactions
        .filter(t => t.paymentMethod === 'bank-transfer')
        .reduce((sum, t) => sum + t.amount, 0),
    };

    return {
      totalRevenue,
      totalExpenses,
      netBalance,
      transactionCount: filteredTransactions.length,
      expenseCount: filteredExpenses.length,
      paymentBreakdown,
    };
  };

  const getWeeklyData = (): DayReport[] => {
    const reports: DayReport[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.timestamp).toISOString().split('T')[0];
        return tDate === dateStr;
      });
      
      const dayExpenses = expenses.filter(e => {
        const eDate = new Date(e.timestamp).toISOString().split('T')[0];
        return eDate === dateStr;
      });
      
      const revenue = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      const expenseTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      reports.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue,
        expenses: expenseTotal,
        net: revenue - expenseTotal,
      });
    }
    
    return reports;
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    if (range !== 'custom') {
      setCustomDate('');
    }
    if (range === 'weekly') {
      setViewMode('weekly');
    } else {
      setViewMode('daily');
    }
  };

  const handleCustomDateSelect = (date: string) => {
    setCustomDate(date);
    setDateRange('custom');
    setViewMode('daily');
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real app, use a library like jsPDF or html2pdf
    // For now, trigger print dialog which allows "Save as PDF"
    window.print();
  };

  const summary = calculateSummary();
  const weeklyData = getWeeklyData();
  const maxValue = Math.max(...weeklyData.map(d => Math.max(d.revenue, d.expenses)));

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Financial Reports</h1>
              <p className="text-gray-400">ከነአን Café - Cashier Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Printer size={18} />
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Download PDF
              </button>
              <Link
                href="/dashboard/cashier"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Date Range Filter */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 mb-6 print:hidden">
          <DateRangeFilter
            selectedRange={dateRange}
            onRangeChange={handleDateRangeChange}
            onCalendarClick={() => setShowDatePicker(true)}
            customDateLabel={dateRange === 'custom' && customDate ? getDateRangeLabel() : undefined}
            theme="dark"
          />
        </div>

        {/* Date Picker Modal */}
        <DatePickerModal
          isOpen={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelectDate={handleCustomDateSelect}
          theme="dark"
        />

        {/* Printable Report Section */}
        <div ref={printRef} className="print:bg-white print:text-black">
          {/* Report Header (Print Only) */}
          <div className="hidden print:block mb-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-serif text-gray-900 mb-2">ከነአን Café</h1>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Financial Report</h2>
              <p className="text-gray-600">{getDateRangeLabel()}</p>
            </div>
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Report Generated:</p>
                  <p className="font-semibold text-gray-900">
                    {new Date().toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Prepared By:</p>
                  <p className="font-semibold text-gray-900">{cashierName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Period Label */}
          <div className="bg-blue-900 border border-blue-700 rounded-xl p-4 mb-6 print:bg-blue-50 print:border-blue-200">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-400 print:text-blue-600" size={24} />
              <div>
                <p className="text-sm text-blue-300 print:text-blue-700">Reporting Period</p>
                <p className="text-xl font-bold text-white print:text-blue-900">{getDateRangeLabel()}</p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Revenue */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 print:bg-green-50 print:border-green-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400 print:text-green-700">Total Revenue</span>
                <TrendingUp className="text-green-500 print:text-green-600" size={24} />
              </div>
              <div className="text-3xl font-bold text-green-400 mb-2 print:text-green-900">
                {summary.totalRevenue.toFixed(2)} ብር
              </div>
              <div className="text-sm text-gray-500 print:text-green-700">
                {summary.transactionCount} transactions
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 print:bg-red-50 print:border-red-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400 print:text-red-700">Total Expenses</span>
                <TrendingDown className="text-red-500 print:text-red-600" size={24} />
              </div>
              <div className="text-3xl font-bold text-red-400 mb-2 print:text-red-900">
                {summary.totalExpenses.toFixed(2)} ብር
              </div>
              <div className="text-sm text-gray-500 print:text-red-700">
                {summary.expenseCount} expenses
              </div>
            </div>

            {/* Net Balance */}
            <div className={`bg-gray-800 rounded-xl p-6 border border-gray-700 ${
              summary.netBalance >= 0 
                ? 'print:bg-blue-50 print:border-blue-200' 
                : 'print:bg-orange-50 print:border-orange-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400 print:text-gray-700">Net Balance</span>
                <DollarSign className={`${
                  summary.netBalance >= 0 ? 'text-blue-500 print:text-blue-600' : 'text-orange-500 print:text-orange-600'
                }`} size={24} />
              </div>
              <div className={`text-3xl font-bold mb-2 ${
                summary.netBalance >= 0 
                  ? 'text-blue-400 print:text-blue-900' 
                  : 'text-orange-400 print:text-orange-900'
              }`}>
                {summary.netBalance.toFixed(2)} ብር
              </div>
              <div className={`text-sm ${
                summary.netBalance >= 0 ? 'text-gray-500 print:text-blue-700' : 'text-gray-500 print:text-orange-700'
              }`}>
                {summary.netBalance >= 0 ? 'Positive balance' : 'Deficit'}
              </div>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6 print:bg-white print:border-gray-300">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 print:text-gray-900">
              <CreditCard className="text-blue-400 print:text-blue-600" size={24} />
              Payment Method Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cash */}
              <div className="bg-gray-700 rounded-lg p-4 print:bg-gray-50 print:border print:border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="text-green-400 print:text-green-600" size={20} />
                    <span className="text-sm text-gray-300 print:text-gray-700">Cash Payments</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-400 print:text-green-900">
                  {summary.paymentBreakdown.cash.toFixed(2)} ብር
                </div>
                <div className="text-xs text-gray-400 mt-1 print:text-gray-600">
                  {((summary.paymentBreakdown.cash / summary.totalRevenue) * 100 || 0).toFixed(1)}% of total
                </div>
              </div>

              {/* Bank Transfer */}
              <div className="bg-gray-700 rounded-lg p-4 print:bg-gray-50 print:border print:border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-blue-400 print:text-blue-600" size={20} />
                    <span className="text-sm text-gray-300 print:text-gray-700">Bank Transfers</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-400 print:text-blue-900">
                  {summary.paymentBreakdown.bankTransfer.toFixed(2)} ብር
                </div>
                <div className="text-xs text-gray-400 mt-1 print:text-gray-600">
                  {((summary.paymentBreakdown.bankTransfer / summary.totalRevenue) * 100 || 0).toFixed(1)}% of total
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Performance Chart */}
          {viewMode === 'weekly' && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6 print:bg-white print:border-gray-300 print:break-inside-avoid">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 print:text-gray-900">
                <BarChart3 className="text-purple-400 print:text-purple-600" size={24} />
                Weekly Performance
              </h3>
              <div className="space-y-4">
                {weeklyData.map((day, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 font-medium print:text-gray-700">{day.date}</span>
                      <span className={`font-bold ${
                        day.net >= 0 ? 'text-green-400 print:text-green-700' : 'text-red-400 print:text-red-700'
                      }`}>
                        Net: {day.net.toFixed(2)} ብር
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Revenue Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-green-400 print:text-green-700">Revenue</span>
                          <span className="text-gray-400 print:text-gray-700">{day.revenue.toFixed(2)}</span>
                        </div>
                        <div className="h-8 bg-gray-700 rounded print:bg-gray-200">
                          <div
                            className="h-full bg-green-500 rounded print:bg-green-600"
                            style={{ width: `${(day.revenue / maxValue) * 100}%` }}
                          />
                        </div>
                      </div>
                      {/* Expenses Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-red-400 print:text-red-700">Expenses</span>
                          <span className="text-gray-400 print:text-gray-700">{day.expenses.toFixed(2)}</span>
                        </div>
                        <div className="h-8 bg-gray-700 rounded print:bg-gray-200">
                          <div
                            className="h-full bg-red-500 rounded print:bg-red-600"
                            style={{ width: `${(day.expenses / maxValue) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Transactions */}
          {viewMode === 'daily' && filteredTransactions.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6 print:bg-white print:border-gray-300 print:break-inside-avoid">
              <h3 className="text-xl font-bold text-white mb-4 print:text-gray-900">
                Transaction Details
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-700 print:border-gray-300">
                    <tr className="text-left">
                      <th className="pb-3 text-gray-400 print:text-gray-700">Time</th>
                      <th className="pb-3 text-gray-400 print:text-gray-700">Table</th>
                      <th className="pb-3 text-gray-400 print:text-gray-700">Customer</th>
                      <th className="pb-3 text-gray-400 print:text-gray-700">Method</th>
                      <th className="pb-3 text-gray-400 text-right print:text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700 print:divide-gray-200">
                    {filteredTransactions.map((txn) => (
                      <tr key={txn.id}>
                        <td className="py-3 text-gray-300 print:text-gray-900">
                          {new Date(txn.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 text-gray-300 print:text-gray-900">{txn.tableNumber}</td>
                        <td className="py-3 text-gray-300 print:text-gray-900">{txn.customerName}</td>
                        <td className="py-3 text-gray-300 print:text-gray-900">
                          {txn.paymentMethod === 'cash' ? '💵 Cash' : '📱 Transfer'}
                        </td>
                        <td className="py-3 text-green-400 font-semibold text-right print:text-green-700">
                          {txn.amount.toFixed(2)} ብር
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detailed Expenses */}
          {viewMode === 'daily' && filteredExpenses.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6 print:bg-white print:border-gray-300 print:break-inside-avoid">
              <h3 className="text-xl font-bold text-white mb-4 print:text-gray-900">
                Expense Details
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-700 print:border-gray-300">
                    <tr className="text-left">
                      <th className="pb-3 text-gray-400 print:text-gray-700">Time</th>
                      <th className="pb-3 text-gray-400 print:text-gray-700">Category</th>
                      <th className="pb-3 text-gray-400 print:text-gray-700">Description</th>
                      <th className="pb-3 text-gray-400 text-right print:text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700 print:divide-gray-200">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id}>
                        <td className="py-3 text-gray-300 print:text-gray-900">
                          {new Date(exp.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 text-gray-300 print:text-gray-900 capitalize">{exp.category}</td>
                        <td className="py-3 text-gray-300 print:text-gray-900">{exp.description}</td>
                        <td className="py-3 text-red-400 font-semibold text-right print:text-red-700">
                          {exp.amount.toFixed(2)} ብር
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Verification Footer */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 print:bg-gray-50 print:border-gray-300 print:mt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1 print:text-gray-600">Report Finalized By:</p>
                <p className="text-lg font-bold text-white print:text-gray-900">{cashierName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1 print:text-gray-600">Timestamp:</p>
                <p className="text-lg font-bold text-white print:text-gray-900">
                  {new Date().toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 print:border-gray-300">
              <p className="text-xs text-gray-500 text-center print:text-gray-600">
                This report was generated by the ከነአን Café Financial Management System
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
