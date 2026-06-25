'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Activity,
  Search,
  Star,
  MessageCircle,
  Receipt,
} from 'lucide-react';
import { Order } from '@/types/order';
import { Expense } from '@/types/finance';
import { Feedback } from '@/types/feedback';
import {
  WaiterPerformance,
  CashierPerformance,
  ActivityLogEntry,
  StaffComparison,
} from '@/types/staff-monitoring';

export default function StaffMonitoring() {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'waiter' | 'cashier' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [waiterPerformance, setWaiterPerformance] = useState<Record<string, WaiterPerformance>>({});
  const [cashierPerformance, setCashierPerformance] = useState<Record<string, CashierPerformance>>({});
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [staffComparison, setStaffComparison] = useState<StaffComparison[]>([]);

  useEffect(() => {
    loadPerformanceData();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(loadPerformanceData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = () => {
    const orders: Order[] = JSON.parse(localStorage.getItem('cafe-orders-history') || '[]');
    const expenses: Expense[] = JSON.parse(localStorage.getItem('cafe-expenses') || '[]');
    const feedback: Feedback[] = JSON.parse(localStorage.getItem('cafe-feedback') || '[]');

    // Calculate waiter performance
    const waiterStats: Record<string, WaiterPerformance> = {};

    orders.forEach((order) => {
      const waiterName = order.billReviewedByWaiter?.waiterName || order.paymentVerifiedByWaiter?.waiterName;
      if (waiterName) {
        if (!waiterStats[waiterName]) {
          waiterStats[waiterName] = {
            name: waiterName,
            totalOrdersServed: 0,
            ordersAccepted: 0,
            ordersRejected: 0,
            orderAccuracyRate: 0,
            averageRating: 0,
            totalFeedback: 0,
            positiveFeedback: 0,
            totalRevenue: 0,
          };
        }

        waiterStats[waiterName].totalOrdersServed++;
        
        if (order.status === 'rejected') {
          waiterStats[waiterName].ordersRejected++;
        } else if (order.status === 'completed' || order.status === 'preparing' || order.status === 'served') {
          waiterStats[waiterName].ordersAccepted++;
        }

        if (order.status === 'completed') {
          waiterStats[waiterName].totalRevenue += order.total;
        }
      }
    });

    // Calculate accuracy rates
    Object.keys(waiterStats).forEach((name) => {
      const stats = waiterStats[name];
      const total = stats.ordersAccepted + stats.ordersRejected;
      stats.orderAccuracyRate = total > 0 ? (stats.ordersAccepted / total) * 100 : 0;
    });

    // Add feedback data
    feedback.forEach((fb) => {
      if (fb.waiterName && waiterStats[fb.waiterName]) {
        waiterStats[fb.waiterName].totalFeedback++;
        if (fb.rating && fb.rating >= 4) {
          waiterStats[fb.waiterName].positiveFeedback++;
        }
      }
    });

    // Calculate average ratings
    Object.keys(waiterStats).forEach((name) => {
      const waiterFeedback = feedback.filter((f) => f.waiterName === name && f.rating);
      if (waiterFeedback.length > 0) {
        const avgRating = waiterFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / waiterFeedback.length;
        waiterStats[name].averageRating = avgRating;
      }
    });

    setWaiterPerformance(waiterStats);

    // Calculate cashier performance
    const cashierStats: Record<string, CashierPerformance> = {};
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    orders.forEach((order) => {
      const cashierName = order.billApprovedByCashier?.cashierName || order.paymentConfirmedByCashier?.cashierName;
      if (cashierName) {
        if (!cashierStats[cashierName]) {
          cashierStats[cashierName] = {
            name: cashierName,
            dailySalesVolume: 0,
            weeklySalesVolume: 0,
            totalTransactions: 0,
            expensesSubmitted: 0,
            expensesApproved: 0,
            expensesRejected: 0,
            expenseApprovalRate: 0,
            recentPaymentVerifications: [],
          };
        }

        if (order.status === 'completed') {
          cashierStats[cashierName].totalTransactions++;
          cashierStats[cashierName].weeklySalesVolume += order.total;

          const orderDate = new Date(order.timestamp);
          if (orderDate >= todayStart) {
            cashierStats[cashierName].dailySalesVolume += order.total;
          }

          // Add to recent verifications (last 10)
          if (order.paymentConfirmedByCashier && cashierStats[cashierName].recentPaymentVerifications.length < 10) {
            cashierStats[cashierName].recentPaymentVerifications.push({
              orderId: order.id,
              customerName: order.customerName,
              amount: order.total,
              timestamp: order.paymentConfirmedByCashier.timestamp,
              paymentMethod: order.paymentMethod,
              paymentProof: order.paymentProof,
            });
          }
        }
      }
    });

    // Add expense data
    expenses.forEach((expense) => {
      if (expense.submittedBy && cashierStats[expense.submittedBy]) {
        cashierStats[expense.submittedBy].expensesSubmitted++;
        if (expense.status === 'approved') {
          cashierStats[expense.submittedBy].expensesApproved++;
        } else if (expense.status === 'rejected') {
          cashierStats[expense.submittedBy].expensesRejected++;
        }
      }
    });

    // Calculate approval rates
    Object.keys(cashierStats).forEach((name) => {
      const stats = cashierStats[name];
      const total = stats.expensesApproved + stats.expensesRejected;
      stats.expenseApprovalRate = total > 0 ? (stats.expensesApproved / total) * 100 : 0;
    });

    setCashierPerformance(cashierStats);

    // Generate activity log
    generateActivityLog(orders, expenses);

    // Generate staff comparison
    generateStaffComparison(waiterStats, cashierStats, feedback);
  };

  const generateActivityLog = (orders: Order[], expenses: Expense[]) => {
    const activities: ActivityLogEntry[] = [];

    // Add order activities
    orders.slice(-50).forEach((order) => {
      if (order.billReviewedByWaiter) {
        activities.push({
          id: `${order.id}-waiter-bill`,
          timestamp: order.billReviewedByWaiter.timestamp,
          staffName: order.billReviewedByWaiter.waiterName,
          staffRole: 'waiter',
          action: 'reviewed bill',
          orderId: order.id,
          amount: order.total,
          details: `Table ${order.tableNumber} - ${order.customerName}`,
        });
      }

      if (order.paymentVerifiedByWaiter) {
        activities.push({
          id: `${order.id}-waiter-payment`,
          timestamp: order.paymentVerifiedByWaiter.timestamp,
          staffName: order.paymentVerifiedByWaiter.waiterName,
          staffRole: 'waiter',
          action: 'verified payment',
          orderId: order.id,
          amount: order.total,
          details: `Table ${order.tableNumber} - ${order.customerName}`,
        });
      }

      if (order.billApprovedByCashier) {
        activities.push({
          id: `${order.id}-cashier-bill`,
          timestamp: order.billApprovedByCashier.timestamp,
          staffName: order.billApprovedByCashier.cashierName,
          staffRole: 'cashier',
          action: 'approved bill',
          orderId: order.id,
          amount: order.total,
          details: `Table ${order.tableNumber} - ${order.customerName}`,
        });
      }

      if (order.paymentConfirmedByCashier) {
        activities.push({
          id: `${order.id}-cashier-payment`,
          timestamp: order.paymentConfirmedByCashier.timestamp,
          staffName: order.paymentConfirmedByCashier.cashierName,
          staffRole: 'cashier',
          action: 'confirmed payment',
          orderId: order.id,
          amount: order.total,
          details: `Table ${order.tableNumber} - ${order.customerName}`,
        });
      }

      if (order.status === 'rejected' && order.rejectionReason) {
        activities.push({
          id: `${order.id}-rejected`,
          timestamp: order.timestamp,
          staffName: 'Waiter',
          staffRole: 'waiter',
          action: 'rejected order',
          orderId: order.id,
          details: order.rejectionReason,
        });
      }
    });

    // Add expense activities
    expenses.slice(-20).forEach((expense) => {
      activities.push({
        id: `${expense.id}-submitted`,
        timestamp: expense.timestamp,
        staffName: expense.submittedBy,
        staffRole: 'cashier',
        action: 'submitted expense',
        amount: expense.amount,
        details: `${expense.category} - ${expense.description}`,
      });
    });

    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setActivityLog(activities.slice(0, 50));
  };

  const generateStaffComparison = (
    waiterStats: Record<string, WaiterPerformance>,
    cashierStats: Record<string, CashierPerformance>,
    feedback: Feedback[]
  ) => {
    const comparison: StaffComparison[] = [];

    // Add waiters
    Object.values(waiterStats).forEach((waiter) => {
      const performanceScore =
        (waiter.orderAccuracyRate * 0.4) +
        (waiter.averageRating * 20 * 0.3) +
        ((waiter.positiveFeedback / Math.max(waiter.totalFeedback, 1)) * 100 * 0.3);

      comparison.push({
        name: waiter.name,
        role: 'waiter',
        totalOrders: waiter.totalOrdersServed,
        totalRevenue: waiter.totalRevenue,
        averageRating: waiter.averageRating,
        performanceScore: Math.round(performanceScore),
      });
    });

    // Add cashiers
    Object.values(cashierStats).forEach((cashier) => {
      const performanceScore =
        (cashier.expenseApprovalRate * 0.3) +
        ((cashier.totalTransactions / 10) * 0.7);

      comparison.push({
        name: cashier.name,
        role: 'cashier',
        totalOrders: cashier.totalTransactions,
        totalRevenue: cashier.weeklySalesVolume,
        averageRating: 0,
        performanceScore: Math.min(100, Math.round(performanceScore)),
      });
    });

    // Sort by performance score
    comparison.sort((a, b) => b.performanceScore - a.performanceScore);

    setStaffComparison(comparison);
  };

  const handleStaffSelect = (name: string, role: 'waiter' | 'cashier') => {
    setSelectedStaff(name);
    setSelectedRole(role);
  };

  const filteredWaiters = Object.values(waiterPerformance).filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCashiers = Object.values(cashierPerformance).filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedWaiterData = selectedStaff && selectedRole === 'waiter' ? waiterPerformance[selectedStaff] : null;
  const selectedCashierData = selectedStaff && selectedRole === 'cashier' ? cashierPerformance[selectedStaff] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-400" size={32} />
          <div>
            <h2 className="text-2xl font-bold text-white">Staff Performance Monitoring</h2>
            <p className="text-gray-400 text-sm">Track and analyze staff activity and performance</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search staff by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Total Waiters</p>
            <Users className="text-blue-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">{Object.keys(waiterPerformance).length}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Total Cashiers</p>
            <Users className="text-green-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">{Object.keys(cashierPerformance).length}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Total Orders</p>
            <Receipt className="text-yellow-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">
            {Object.values(waiterPerformance).reduce((sum, w) => sum + w.totalOrdersServed, 0)}
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <DollarSign className="text-green-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">
            {Object.values(waiterPerformance).reduce((sum, w) => sum + w.totalRevenue, 0).toFixed(0)} ብር
          </p>
        </div>
      </div>

      {/* Staff Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waiters */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="text-blue-400" size={20} />
            Waiters
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredWaiters.map((waiter) => (
              <button
                key={waiter.name}
                onClick={() => handleStaffSelect(waiter.name, 'waiter')}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  selectedStaff === waiter.name && selectedRole === 'waiter'
                    ? 'bg-blue-600 border-2 border-blue-400'
                    : 'bg-gray-900 border border-gray-700 hover:border-blue-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{waiter.name}</span>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                    {waiter.totalOrdersServed} orders
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400" />
                    {waiter.averageRating.toFixed(1)}
                  </span>
                  <span>{waiter.orderAccuracyRate.toFixed(0)}% accuracy</span>
                </div>
              </button>
            ))}
            {filteredWaiters.length === 0 && (
              <p className="text-center text-gray-500 py-8">No waiters found</p>
            )}
          </div>
        </div>

        {/* Cashiers */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="text-green-400" size={20} />
            Cashiers
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCashiers.map((cashier) => (
              <button
                key={cashier.name}
                onClick={() => handleStaffSelect(cashier.name, 'cashier')}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  selectedStaff === cashier.name && selectedRole === 'cashier'
                    ? 'bg-green-600 border-2 border-green-400'
                    : 'bg-gray-900 border border-gray-700 hover:border-green-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{cashier.name}</span>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                    {cashier.totalTransactions} transactions
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{cashier.dailySalesVolume.toFixed(0)} ብር today</span>
                  <span>{cashier.expenseApprovalRate.toFixed(0)}% approved</span>
                </div>
              </button>
            ))}
            {filteredCashiers.length === 0 && (
              <p className="text-center text-gray-500 py-8">No cashiers found</p>
            )}
          </div>
        </div>
      </div>

      {/* Selected Staff Details */}
      {selectedWaiterData && (
        <div className="bg-gray-800 rounded-xl p-6 border-2 border-blue-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="text-blue-400" size={28} />
              {selectedWaiterData.name} - Waiter Performance
            </h3>
            <button
              onClick={() => setSelectedStaff(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Orders Served</p>
              <p className="text-3xl font-bold text-white">{selectedWaiterData.totalOrdersServed}</p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Order Accuracy</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-green-400">{selectedWaiterData.orderAccuracyRate.toFixed(1)}%</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {selectedWaiterData.ordersAccepted} accepted / {selectedWaiterData.ordersRejected} rejected
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-400">{selectedWaiterData.totalRevenue.toFixed(0)} ብር</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="text-yellow-400" size={20} />
                <h4 className="font-semibold text-white">Customer Sentiment</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Average Rating:</span>
                  <span className="text-yellow-400 font-semibold">
                    {selectedWaiterData.averageRating.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Feedback:</span>
                  <span className="text-white font-semibold">{selectedWaiterData.totalFeedback}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Positive Reviews:</span>
                  <span className="text-green-400 font-semibold">
                    {selectedWaiterData.positiveFeedback} ({selectedWaiterData.totalFeedback > 0 ? ((selectedWaiterData.positiveFeedback / selectedWaiterData.totalFeedback) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="text-blue-400" size={20} />
                <h4 className="font-semibold text-white">Performance Metrics</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Accuracy Rate</span>
                    <span className="text-white">{selectedWaiterData.orderAccuracyRate.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${selectedWaiterData.orderAccuracyRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Customer Satisfaction</span>
                    <span className="text-white">{((selectedWaiterData.averageRating / 5) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(selectedWaiterData.averageRating / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCashierData && (
        <div className="bg-gray-800 rounded-xl p-6 border-2 border-green-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="text-green-400" size={28} />
              {selectedCashierData.name} - Cashier Performance
            </h3>
            <button
              onClick={() => setSelectedStaff(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Daily Sales Volume</p>
              <p className="text-3xl font-bold text-green-400">{selectedCashierData.dailySalesVolume.toFixed(0)} ብር</p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Weekly Sales Volume</p>
              <p className="text-3xl font-bold text-blue-400">{selectedCashierData.weeklySalesVolume.toFixed(0)} ብር</p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Transactions</p>
              <p className="text-3xl font-bold text-white">{selectedCashierData.totalTransactions}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="text-green-400" size={20} />
                <h4 className="font-semibold text-white">Expense Integrity</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Submitted:</span>
                  <span className="text-white font-semibold">{selectedCashierData.expensesSubmitted}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Approved:</span>
                  <span className="text-green-400 font-semibold">{selectedCashierData.expensesApproved}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Rejected:</span>
                  <span className="text-red-400 font-semibold">{selectedCashierData.expensesRejected}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                  <span className="text-gray-400">Approval Rate:</span>
                  <span className="text-green-400 font-semibold">{selectedCashierData.expenseApprovalRate.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="text-blue-400" size={20} />
                <h4 className="font-semibold text-white">Performance Metrics</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Expense Approval Rate</span>
                    <span className="text-white">{selectedCashierData.expenseApprovalRate.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${selectedCashierData.expenseApprovalRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Payment Verifications */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Receipt className="text-blue-400" size={20} />
              Recent Payment Verifications
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedCashierData.recentPaymentVerifications.map((verification) => (
                <div
                  key={verification.orderId}
                  className="bg-gray-800 rounded-lg p-3 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{verification.customerName}</span>
                    <span className="text-sm font-bold text-green-400">{verification.amount} ብር</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Order #{verification.orderId.slice(0, 8)}</span>
                    <span>{new Date(verification.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      verification.paymentMethod === 'cash'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {verification.paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'}
                    </span>
                  </div>
                </div>
              ))}
              {selectedCashierData.recentPaymentVerifications.length === 0 && (
                <p className="text-center text-gray-500 py-4">No recent verifications</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Performance Comparison */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <Award className="text-yellow-400" size={28} />
          <div>
            <h3 className="text-xl font-bold text-white">Performance Comparison</h3>
            <p className="text-sm text-gray-400">Top performers ranked by overall score</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Role</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Orders</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Revenue</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Rating</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {staffComparison.map((staff, index) => (
                <tr
                  key={staff.name}
                  className={`hover:bg-gray-900 transition-colors ${
                    index === 0 ? 'bg-yellow-500/10' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    {index === 0 && (
                      <span className="text-2xl">🏆</span>
                    )}
                    {index === 1 && (
                      <span className="text-2xl">🥈</span>
                    )}
                    {index === 2 && (
                      <span className="text-2xl">🥉</span>
                    )}
                    {index > 2 && (
                      <span className="text-gray-400 font-semibold">#{index + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleStaffSelect(staff.name, staff.role)}
                      className="font-semibold text-white hover:text-blue-400 transition-colors"
                    >
                      {staff.name}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                      staff.role === 'waiter'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white font-semibold">{staff.totalOrders}</td>
                  <td className="px-4 py-3 text-right text-white font-semibold">{staff.totalRevenue.toFixed(0)} ብር</td>
                  <td className="px-4 py-3 text-right">
                    {staff.role === 'waiter' ? (
                      <span className="text-yellow-400 font-semibold">{staff.averageRating.toFixed(1)} ⭐</span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            staff.performanceScore >= 80
                              ? 'bg-green-500'
                              : staff.performanceScore >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${staff.performanceScore}%` }}
                        />
                      </div>
                      <span className="text-white font-bold w-8">{staff.performanceScore}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="text-blue-400" size={28} />
          <div>
            <h3 className="text-xl font-bold text-white">Live Activity Feed</h3>
            <p className="text-sm text-gray-400">Recent staff actions and transactions</p>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {activityLog.map((activity) => (
            <div
              key={activity.id}
              className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                      activity.staffRole === 'waiter'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {activity.staffRole}
                    </span>
                    <span className="font-semibold text-white">{activity.staffName}</span>
                    <span className="text-gray-400 text-sm">{activity.action}</span>
                  </div>
                  {activity.details && (
                    <p className="text-sm text-gray-400">{activity.details}</p>
                  )}
                  {activity.orderId && (
                    <p className="text-xs text-gray-500 mt-1">Order #{activity.orderId.slice(0, 8)}</p>
                  )}
                </div>
                <div className="text-right">
                  {activity.amount && (
                    <p className="text-sm font-bold text-green-400">{activity.amount} ብር</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {activityLog.length === 0 && (
            <p className="text-center text-gray-500 py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
