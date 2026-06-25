'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Calendar,
  DollarSign,
  User,
  Filter,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { Expense } from '@/types/finance';
import Toast from '@/components/Toast';
import DateRangeFilter, { DateRange } from '@/components/DateRangeFilter';
import DatePickerModal from '@/components/DatePickerModal';

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('daily');
  const [customDate, setCustomDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [rejectingExpense, setRejectingExpense] = useState<Expense | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const adminName = 'Admin-1'; // In production, from auth

  useEffect(() => {
    loadExpenses();
    const interval = setInterval(loadExpenses, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadExpenses = () => {
    const stored = localStorage.getItem('cafe-expenses');
    if (stored) {
      setExpenses(JSON.parse(stored));
    }
  };

  const saveExpenses = (updatedExpenses: Expense[]) => {
    setExpenses(updatedExpenses);
    localStorage.setItem('cafe-expenses', JSON.stringify(updatedExpenses));
  };

  const approveExpense = (expense: Expense) => {
    const updatedExpenses = expenses.map(e =>
      e.id === expense.id
        ? {
            ...e,
            status: 'approved' as const,
            reviewedBy: adminName,
            reviewedAt: new Date(),
          }
        : e
    );
    saveExpenses(updatedExpenses);
    showToastMessage(`Expense approved: ${expense.amount} ብር`, 'success');
  };

  const rejectExpense = () => {
    if (!rejectingExpense || !rejectionReason.trim()) {
      showToastMessage('Please provide a rejection reason', 'error');
      return;
    }

    const updatedExpenses = expenses.map(e =>
      e.id === rejectingExpense.id
        ? {
            ...e,
            status: 'rejected' as const,
            reviewedBy: adminName,
            reviewedAt: new Date(),
            rejectionReason: rejectionReason.trim(),
          }
        : e
    );
    saveExpenses(updatedExpenses);
    showToastMessage(`Expense rejected: ${rejectingExpense.amount} ብር`, 'warning');
    setRejectingExpense(null);
    setRejectionReason('');
  };

  const filterExpenses = () => {
    let filtered = expenses;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    // Filter by date range
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (dateRange) {
      case 'daily':
        filtered = filtered.filter(e => {
          const expenseDate = new Date(e.timestamp);
          expenseDate.setHours(0, 0, 0, 0);
          return expenseDate.getTime() === now.getTime();
        });
        break;

      case 'weekly':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        filtered = filtered.filter(e => new Date(e.timestamp) >= weekAgo);
        break;

      case 'monthly':
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        monthAgo.setHours(0, 0, 0, 0);
        filtered = filtered.filter(e => new Date(e.timestamp) >= monthAgo);
        break;

      case 'custom':
        if (customDate) {
          filtered = filtered.filter(e => {
            const expenseDate = new Date(e.timestamp).toISOString().split('T')[0];
            return expenseDate === customDate;
          });
        }
        break;
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const getCategoryLabel = (category: Expense['category']) => {
    const labels = {
      supplies: 'Supplies',
      utilities: 'Utilities',
      staff: 'Staff',
      maintenance: 'Maintenance',
      other: 'Other',
    };
    return labels[category];
  };

  const getStatusBadge = (status: Expense['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
            <AlertCircle size={14} />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle size={14} />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle size={14} />
            Rejected
          </span>
        );
    }
  };

  const filteredExpenses = filterExpenses();
  const pendingCount = expenses.filter(e => e.status === 'pending').length;
  const totalAmount = filteredExpenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Expense Management</h1>
          <p className="text-gray-600">Review and approve expense requests</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-orange-700">Pending Approval</span>
              <AlertCircle className="text-orange-600" size={20} />
            </div>
            <div className="text-3xl font-bold text-orange-600">{pendingCount}</div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700">Total Expenses ({getDateRangeLabel()})</span>
              <TrendingDown className="text-green-600" size={20} />
            </div>
            <div className="text-3xl font-bold text-green-600">{totalAmount.toFixed(2)} ብር</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700">Total Records</span>
              <DollarSign className="text-blue-600" size={20} />
            </div>
            <div className="text-3xl font-bold text-blue-600">{filteredExpenses.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="space-y-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <DateRangeFilter
                selectedRange={dateRange}
                onRangeChange={handleDateRangeChange}
                onCalendarClick={() => setShowDatePicker(true)}
                customDateLabel={dateRange === 'custom' && customDate ? getDateRangeLabel() : undefined}
                theme="light"
              />
            </div>

            {/* Status and Category Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="supplies">Supplies</option>
                  <option value="utilities">Utilities</option>
                  <option value="staff">Staff</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Date Picker Modal */}
        <DatePickerModal
          isOpen={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelectDate={handleCustomDateSelect}
          theme="light"
        />

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <DollarSign className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Expenses Found
            </h2>
            <p className="text-gray-600">
              No expenses match your current filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className={`bg-white rounded-xl border-2 p-5 shadow-sm transition-colors ${
                  expense.status === 'pending'
                    ? 'border-orange-200 hover:border-orange-300'
                    : expense.status === 'approved'
                    ? 'border-green-200'
                    : 'border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="text-gray-600" size={18} />
                        <span className="font-semibold text-gray-900">{expense.submittedBy}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        {new Date(expense.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Category</p>
                        <p className="font-semibold text-gray-900">{getCategoryLabel(expense.category)}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Amount</p>
                        <p className="text-xl font-bold text-gray-900">{expense.amount.toFixed(2)} ብር</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Status</p>
                        {getStatusBadge(expense.status)}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <p className="text-xs text-blue-700 mb-1">Description</p>
                      <p className="text-sm text-blue-900">{expense.description}</p>
                    </div>

                    {/* Review Info */}
                    {expense.reviewedBy && (
                      <div className={`rounded-lg p-3 border ${
                        expense.status === 'approved'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <p className={`text-xs mb-1 ${
                          expense.status === 'approved' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {expense.status === 'approved' ? 'Approved' : 'Rejected'} by {expense.reviewedBy}
                        </p>
                        <p className={`text-xs ${
                          expense.status === 'approved' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {expense.reviewedAt && new Date(expense.reviewedAt).toLocaleString()}
                        </p>
                        {expense.rejectionReason && (
                          <p className="text-sm text-red-900 mt-2">
                            Reason: {expense.rejectionReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons (only for pending) */}
                {expense.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => approveExpense(expense)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectingExpense(expense)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Reject Expense</h2>
            </div>

            <p className="text-gray-700 mb-4">
              Rejecting expense of <span className="font-bold">{rejectingExpense.amount} ብር</span> from{' '}
              <span className="font-bold">{rejectingExpense.submittedBy}</span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Explain why this expense is being rejected..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={rejectExpense}
                disabled={!rejectionReason.trim()}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  rejectionReason.trim()
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setRejectingExpense(null);
                  setRejectionReason('');
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
