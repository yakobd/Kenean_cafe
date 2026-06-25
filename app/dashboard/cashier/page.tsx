'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingDown, TrendingUp, Wallet, Receipt, User, CreditCard, CheckCircle, CheckCircle2, Plus, Calendar } from 'lucide-react';
import { Order } from '@/types/order';
import { Transaction, Expense, DailySummary } from '@/types/finance';
import Toast from '@/components/Toast';
import PaymentVerificationModal from '@/components/PaymentVerificationModal';

export default function CashierDashboard() {
  const [activeTab, setActiveTab] = useState<'bills' | 'expenses'>('bills');
  const [billApprovalOrders, setBillApprovalOrders] = useState<Order[]>([]);
  const [paymentConfirmationOrders, setPaymentConfirmationOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const cashierName = 'Cashier-1'; // In production, this would come from auth

  // Expense form state
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('supplies');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      // Load orders needing cashier action
      const storedOrders = localStorage.getItem('cafe-orders');
      if (storedOrders) {
        const orders: Order[] = JSON.parse(storedOrders);
        const billApprovals = orders.filter(o => o.status === 'bill-cashier-review');
        const paymentConfirmations = orders.filter(o => o.status === 'payment-waiter-verified');
        setBillApprovalOrders(billApprovals);
        setPaymentConfirmationOrders(paymentConfirmations);
      }

      // Load transactions
      const storedTransactions = localStorage.getItem('cafe-transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }

      // Load expenses
      const storedExpenses = localStorage.getItem('cafe-expenses');
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const approveBill = (order: Order) => {
    // Update order status to awaiting-payment with audit trail
    const storedOrders = JSON.parse(localStorage.getItem('cafe-orders') || '[]');
    const updatedOrders = storedOrders.map((o: any) =>
      o.id === order.id
        ? {
            ...o,
            status: 'awaiting-payment',
            billApprovedByCashier: {
              timestamp: new Date(),
              cashierName: cashierName,
            },
          }
        : o
    );
    localStorage.setItem('cafe-orders', JSON.stringify(updatedOrders));

    setToastMessage('Bill approved! Customer can now pay.');
    setShowToast(true);
  };

  const handleConfirmPayment = () => {
    if (!verifyingOrder) return;
    confirmPayment(verifyingOrder);
    setVerifyingOrder(null);
  };

  const handleFlagPayment = (reason: string) => {
    if (!verifyingOrder) return;

    const storedOrders = JSON.parse(localStorage.getItem('cafe-orders') || '[]');
    const updatedOrders = storedOrders.map((order: any) =>
      order.id === verifyingOrder.id
        ? { ...order, status: 'payment-submitted', rejectionReason: reason }
        : order
    );
    localStorage.setItem('cafe-orders', JSON.stringify(updatedOrders));
    
    setToastMessage('Payment flagged and sent back to waiter');
    setShowToast(true);
    setVerifyingOrder(null);
  };

  const confirmPayment = (order: Order) => {
    // Create transaction record
    const transaction: Transaction = {
      id: `txn-${Date.now()}`,
      orderId: order.id,
      tableNumber: order.tableNumber,
      customerName: order.customerName,
      amount: order.total,
      paymentMethod: order.paymentMethod,
      timestamp: new Date(),
      type: 'revenue',
    };

    // Save transaction
    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    localStorage.setItem('cafe-transactions', JSON.stringify(updatedTransactions));

    // Update order status to payment-confirmed with audit trail
    const storedOrders = JSON.parse(localStorage.getItem('cafe-orders') || '[]');
    const updatedOrders = storedOrders.map((o: any) =>
      o.id === order.id
        ? {
            ...o,
            status: 'payment-confirmed',
            paymentConfirmedByCashier: {
              timestamp: new Date(),
              cashierName: cashierName,
            },
          }
        : o
    );
    localStorage.setItem('cafe-orders', JSON.stringify(updatedOrders));

    setToastMessage('Payment confirmed successfully!');
    setShowToast(true);
  };

  const addExpense = () => {
    if (!expenseAmount || parseFloat(expenseAmount) <= 0 || !expenseDescription.trim()) {
      setToastMessage('Please fill in all expense fields');
      setShowToast(true);
      return;
    }

    const expense: Expense = {
      id: `exp-${Date.now()}`,
      category: expenseCategory,
      amount: parseFloat(expenseAmount),
      description: expenseDescription.trim(),
      timestamp: new Date(),
      type: 'expense',
      status: 'pending',
      submittedBy: cashierName,
    };

    const updatedExpenses = [...expenses, expense];
    setExpenses(updatedExpenses);
    localStorage.setItem('cafe-expenses', JSON.stringify(updatedExpenses));

    // Reset form
    setExpenseAmount('');
    setExpenseDescription('');
    setExpenseCategory('supplies');

    setToastMessage('Expense submitted for approval!');
    setShowToast(true);
  };

  const calculateSummary = (): DailySummary => {
    const today = new Date().toDateString();
    
    const todayTransactions = transactions.filter(
      t => new Date(t.timestamp).toDateString() === today
    );
    // Only include approved expenses in calculations
    const todayExpenses = expenses.filter(
      e => new Date(e.timestamp).toDateString() === today && e.status === 'approved'
    );

    const totalRevenue = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      totalRevenue,
      totalExpenses,
      netCash: totalRevenue - totalExpenses,
      transactionCount: todayTransactions.length,
      expenseCount: todayExpenses.length,
    };
  };

  const summary = calculateSummary();

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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Cashier Dashboard</h1>
              <p className="text-gray-600">ከነአን Café - Financial Management</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Today's Revenue</span>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {summary.totalRevenue.toFixed(2)} ብር
            </div>
            <div className="text-xs text-gray-500">
              {summary.transactionCount} transactions
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Today's Expenses</span>
              <TrendingDown className="text-red-500" size={20} />
            </div>
            <div className="text-3xl font-bold text-red-600 mb-1">
              {summary.totalExpenses.toFixed(2)} ብር
            </div>
            <div className="text-xs text-gray-500">
              {summary.expenseCount} expenses
            </div>
          </div>

          {/* Net Cash */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Net Cash</span>
              <Wallet className="text-blue-500" size={20} />
            </div>
            <div className={`text-3xl font-bold mb-1 ${
              summary.netCash >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
              {summary.netCash.toFixed(2)} ብር
            </div>
            <div className="text-xs text-gray-500">
              In drawer
            </div>
          </div>

          {/* Pending Bills */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Pending Actions</span>
              <Receipt className="text-orange-500" size={20} />
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {billApprovalOrders.length + paymentConfirmationOrders.length}
            </div>
            <div className="text-xs text-gray-500">
              Awaiting review
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('bills')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors relative ${
                  activeTab === 'bills'
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Receipt size={20} />
                  Bills & Payments
                  {(billApprovalOrders.length + paymentConfirmationOrders.length) > 0 && (
                    <span className="bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {billApprovalOrders.length + paymentConfirmationOrders.length}
                    </span>
                  )}
                </div>
                {activeTab === 'bills' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors relative ${
                  activeTab === 'expenses'
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <TrendingDown size={20} />
                  Expense Logger
                </div>
                {activeTab === 'expenses' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'bills' ? (
              // Bills & Payments Tab
              <div className="space-y-8">
                {/* Bill Approval Section */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Receipt className="text-orange-500" size={24} />
                    Bills Awaiting Approval
                    {billApprovalOrders.length > 0 && (
                      <span className="bg-orange-500 text-white text-sm font-bold rounded-full px-3 py-1">
                        {billApprovalOrders.length}
                      </span>
                    )}
                  </h3>
                  {billApprovalOrders.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Receipt className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-500">No bills awaiting approval</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {billApprovalOrders.map((bill) => (
                        <div
                          key={bill.id}
                          className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200 hover:border-orange-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
                                  Table {bill.tableNumber}
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                  <User size={16} />
                                  <span className="font-medium">{bill.customerName}</span>
                                </div>
                              </div>

                              {/* Waiter Review Info */}
                              {bill.billReviewedByWaiter && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle2 className="text-green-600" size={16} />
                                    <span className="text-sm font-semibold text-green-900">
                                      Waiter Approved
                                    </span>
                                  </div>
                                  <p className="text-xs text-green-700 ml-6">
                                    By {bill.billReviewedByWaiter.waiterName} at{' '}
                                    {new Date(bill.billReviewedByWaiter.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              )}

                              {/* Order Items */}
                              <div className="bg-white rounded-lg p-4 mb-3">
                                <div className="space-y-2">
                                  {bill.items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                      <span className="text-gray-700">
                                        {item.quantity}x {item.name}
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        {item.price * item.quantity} ብር
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Payment Method */}
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                <CreditCard size={16} />
                                <span>
                                  Payment: {bill.paymentMethod === 'cash' ? '💵 Cash' : '📱 Bank Transfer'}
                                </span>
                              </div>

                              {/* Total */}
                              <div className="flex items-center justify-between bg-orange-100 rounded-lg p-3 border border-orange-300">
                                <span className="text-gray-700 font-medium">Total Amount</span>
                                <span className="text-2xl font-bold text-orange-600">
                                  {bill.total} ብር
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => approveBill(bill)}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={20} />
                            Approve Bill
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment Confirmation Section */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="text-blue-500" size={24} />
                    Payments Awaiting Confirmation
                    {paymentConfirmationOrders.length > 0 && (
                      <span className="bg-blue-500 text-white text-sm font-bold rounded-full px-3 py-1">
                        {paymentConfirmationOrders.length}
                      </span>
                    )}
                  </h3>
                  {paymentConfirmationOrders.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <CheckCircle className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-500">No payments awaiting confirmation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paymentConfirmationOrders.map((payment) => (
                        <div
                          key={payment.id}
                          className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
                                  Table {payment.tableNumber}
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                  <User size={16} />
                                  <span className="font-medium">{payment.customerName}</span>
                                </div>
                              </div>

                              {/* Waiter Verification Info */}
                              {payment.paymentVerifiedByWaiter && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle2 className="text-green-600" size={16} />
                                    <span className="text-sm font-semibold text-green-900">
                                      Waiter Verified
                                    </span>
                                  </div>
                                  <p className="text-xs text-green-700 ml-6">
                                    By {payment.paymentVerifiedByWaiter.waiterName} at{' '}
                                    {new Date(payment.paymentVerifiedByWaiter.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              )}

                              {/* Transaction ID */}
                              <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-3">
                                <p className="text-xs text-blue-700 mb-1">Transaction ID:</p>
                                <p className="font-mono font-bold text-blue-900">{payment.id.toUpperCase()}</p>
                              </div>

                              {/* Reference Note */}
                              {payment.paymentReferenceNote && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                                  <p className="text-xs text-gray-600 mb-1">Reference Note:</p>
                                  <p className="text-sm text-gray-800">{payment.paymentReferenceNote}</p>
                                </div>
                              )}

                              {/* Payment Details */}
                              <div className="bg-white rounded-lg p-4 mb-3">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm text-gray-600">Payment Method:</span>
                                  <span className="font-semibold text-gray-900">
                                    {payment.paymentMethod === 'cash' ? '💵 Cash' : '📱 Bank Transfer'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Amount:</span>
                                  <span className="text-xl font-bold text-blue-600">
                                    {payment.total} ብር
                                  </span>
                                </div>
                              </div>

                              {/* Payment Proof */}
                              {payment.paymentProof && (
                                <div className="mb-3">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Payment Proof:</p>
                                  <img 
                                    src={payment.paymentProof.fileData} 
                                    alt="Payment proof" 
                                    className="w-full max-h-64 object-contain rounded-lg border-2 border-gray-300 bg-white"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Uploaded: {new Date(payment.paymentProof.uploadedAt).toLocaleString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => setVerifyingOrder(payment)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={20} />
                            Open Verification Portal
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Expense Logger Tab
              <div>
                <div className="max-w-2xl mx-auto">
                  {/* Expense Form */}
                  <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Plus size={24} />
                      Record New Expense
                    </h3>

                    <div className="space-y-4">
                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={expenseCategory}
                          onChange={(e) => setExpenseCategory(e.target.value as Expense['category'])}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="supplies">Supplies</option>
                          <option value="utilities">Utilities</option>
                          <option value="staff">Staff</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Amount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount (ብር)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={expenseAmount}
                          onChange={(e) => setExpenseAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={expenseDescription}
                          onChange={(e) => setExpenseDescription(e.target.value)}
                          placeholder="What was this expense for?"
                          rows={3}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={addExpense}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={20} />
                        Add Expense
                      </button>
                    </div>
                  </div>

                  {/* Recent Expenses */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Today's Expenses
                    </h3>
                    {expenses.filter(e => 
                      new Date(e.timestamp).toDateString() === new Date().toDateString()
                    ).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No expenses recorded today
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {expenses
                          .filter(e => 
                            new Date(e.timestamp).toDateString() === new Date().toDateString()
                          )
                          .reverse()
                          .map((expense) => (
                            <div
                              key={expense.id}
                              className="bg-white rounded-lg p-4 border border-gray-200"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                                      {getCategoryLabel(expense.category)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(expense.timestamp).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{expense.description}</p>
                                </div>
                                <div className="text-lg font-bold text-red-600 ml-4">
                                  -{expense.amount} ብር
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Verification Modal */}
      {verifyingOrder && (
        <PaymentVerificationModal
          order={verifyingOrder}
          role="cashier"
          onVerify={handleConfirmPayment}
          onReject={handleFlagPayment}
          onClose={() => setVerifyingOrder(null)}
        />
      )}

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </main>
  );
}
