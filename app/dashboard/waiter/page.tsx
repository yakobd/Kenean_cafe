'use client';

import { useEffect, useState } from 'react';
import { Clock, ChefHat, CheckCircle2, Receipt, User, CreditCard, AlertCircle, Bell, XCircle, Upload } from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import Toast from '@/components/Toast';
import PaymentVerificationModal from '@/components/PaymentVerificationModal';

export default function WaiterDashboard() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [showNewOrderToast, setShowNewOrderToast] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const waiterName = 'Waiter-1'; // In production, this would come from auth

  // Load orders from localStorage
  useEffect(() => {
    const loadOrders = () => {
      const storedOrders = localStorage.getItem('cafe-orders');
      if (storedOrders) {
        const orders: Order[] = JSON.parse(storedOrders);
        setAllOrders(orders);

        // Check for new orders
        const pendingCount = orders.filter(o => o.status === 'pending').length;
        if (pendingCount > lastOrderCount) {
          setShowNewOrderToast(true);
          setLastOrderCount(pendingCount);
        }
      }
    };

    loadOrders();
    const interval = setInterval(loadOrders, 2000);
    return () => clearInterval(interval);
  }, [lastOrderCount]);

  const updateOrderStatus = (orderId: string, status: OrderStatus, auditField?: string) => {
    const updated = allOrders.map(order => {
      if (order.id === orderId) {
        const updatedOrder: any = { ...order, status };
        
        // Add audit trail
        if (auditField === 'billReviewedByWaiter') {
          updatedOrder.billReviewedByWaiter = {
            timestamp: new Date(),
            waiterName: waiterName,
          };
        } else if (auditField === 'paymentVerifiedByWaiter') {
          updatedOrder.paymentVerifiedByWaiter = {
            timestamp: new Date(),
            waiterName: waiterName,
          };
        }
        
        return updatedOrder;
      }
      return order;
    });
    setAllOrders(updated);
    localStorage.setItem('cafe-orders', JSON.stringify(updated));
  };

  const handleVerifyPayment = () => {
    if (!verifyingOrder) return;
    
    updateOrderStatus(verifyingOrder.id, 'payment-waiter-verified', 'paymentVerifiedByWaiter');
    setVerifyingOrder(null);
  };

  const handleRejectPayment = (reason: string) => {
    if (!verifyingOrder) return;

    const updated = allOrders.map(order =>
      order.id === verifyingOrder.id
        ? { ...order, status: 'awaiting-payment' as OrderStatus, rejectionReason: reason }
        : order
    );
    setAllOrders(updated);
    localStorage.setItem('cafe-orders', JSON.stringify(updated));
    setVerifyingOrder(null);
  };

  const finishSession = (orderId: string) => {
    // Remove order from active orders
    const updated = allOrders.filter(order => order.id !== orderId);
    setAllOrders(updated);
    localStorage.setItem('cafe-orders', JSON.stringify(updated));
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return allOrders.filter(order => order.status === status);
  };

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          icon: AlertCircle,
          color: 'bg-red-500',
          textColor: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'rejected':
        return {
          label: 'Rejected',
          icon: XCircle,
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
      case 'preparing':
        return {
          label: 'Preparing',
          icon: ChefHat,
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 'served':
        return {
          label: 'Served',
          icon: CheckCircle2,
          color: 'bg-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'bill-waiter-review':
        return {
          label: 'Bill Review',
          icon: Receipt,
          color: 'bg-orange-500',
          textColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
        };
      case 'payment-submitted':
        return {
          label: 'Payment Verification',
          icon: Upload,
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'completed':
        return {
          label: 'Completed',
          icon: CheckCircle2,
          color: 'bg-purple-500',
          textColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
        };
      default:
        return {
          label: 'Unknown',
          icon: Clock,
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const config = getStatusConfig(order.status);
    const Icon = config.icon;

    return (
      <div className={`bg-white rounded-xl border-2 ${config.borderColor} shadow-md hover:shadow-lg transition-all`}>
        {/* Header */}
        <div className={`${config.bgColor} p-4 border-b-2 ${config.borderColor}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`${config.color} p-2 rounded-lg ${order.status === 'pending' ? 'animate-pulse' : ''}`}>
                <Icon className="text-white" size={20} />
              </div>
              <span className={`font-bold text-lg ${config.textColor}`}>
                Table {order.tableNumber}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(order.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Customer Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User size={14} />
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CreditCard size={14} />
              <span>{order.paymentMethod === 'cash' ? '💵 Cash' : '📱 Bank Transfer'}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-4">
          <div className="space-y-2 mb-4">
            {order.items.map((item) => (
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

          {order.specialInstructions && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800 font-medium mb-1">Special Instructions:</p>
              <p className="text-sm text-amber-900 italic">{order.specialInstructions}</p>
            </div>
          )}

          <div className="pt-3 border-t border-gray-200 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="text-xl font-bold text-gray-900">{order.total} ብር</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {order.status === 'pending' && (
              <button
                onClick={() => updateOrderStatus(order.id, 'preparing')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ChefHat size={18} />
                Approve Order
              </button>
            )}

            {order.status === 'preparing' && (
              <button
                onClick={() => updateOrderStatus(order.id, 'served')}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                Mark as Served
              </button>
            )}

            {order.status === 'served' && (
              <div className="text-center py-2 text-gray-500 text-sm">
                Waiting for bill request...
              </div>
            )}

            {order.status === 'bill-waiter-review' && (
              <>
                <button
                  onClick={() => updateOrderStatus(order.id, 'bill-cashier-review', 'billReviewedByWaiter')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 animate-pulse"
                >
                  <Receipt size={18} />
                  Approve & Forward to Cashier
                </button>
                <p className="text-xs text-center text-gray-500">
                  Review items and prices
                </p>
              </>
            )}

            {order.status === 'payment-submitted' && (
              <>
                <div className="mb-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-700 mb-1">Transaction ID:</p>
                  <p className="font-mono font-bold text-blue-900 text-sm">{order.id.toUpperCase()}</p>
                </div>
                {order.paymentReferenceNote && (
                  <div className="mb-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Reference Note:</p>
                    <p className="text-sm text-gray-800">{order.paymentReferenceNote}</p>
                  </div>
                )}
                {order.paymentProof && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Payment Proof:</p>
                    <img 
                      src={order.paymentProof.fileData} 
                      alt="Payment proof" 
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Uploaded: {new Date(order.paymentProof.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setVerifyingOrder(order)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 animate-pulse"
                >
                  <CheckCircle2 size={18} />
                  Open Verification Portal
                </button>
                <p className="text-xs text-center text-gray-500">
                  Review payment details
                </p>
              </>
            )}

            {order.status === 'completed' && (
              <>
                <button
                  onClick={() => finishSession(order.id)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Finish Session
                </button>
                <p className="text-xs text-center text-gray-500">
                  Payment completed - clear table
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const pendingOrders = getOrdersByStatus('pending');
  const preparingOrders = getOrdersByStatus('preparing');
  const servedOrders = getOrdersByStatus('served');
  const billReviewOrders = getOrdersByStatus('bill-waiter-review');
  const paymentVerificationOrders = getOrdersByStatus('payment-submitted');
  const completedOrders = getOrdersByStatus('completed');

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Waiter Dashboard</h1>
              <p className="text-gray-400">ከነአን Café</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{allOrders.length}</div>
                <div className="text-xs text-gray-400">Active Orders</div>
              </div>
              {pendingOrders.length > 0 && (
                <div className="relative">
                  <Bell className="text-red-500 animate-pulse" size={32} />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingOrders.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Columns */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {allOrders.length === 0 ? (
          <div className="text-center py-20">
            <Receipt className="mx-auto text-gray-600 mb-4" size={64} />
            <h2 className="text-2xl font-semibold text-gray-400 mb-2">
              No Active Orders
            </h2>
            <p className="text-gray-500">
              New orders will appear here automatically
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {/* Pending Column */}
            <div>
              <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-3 mb-4">
                <h2 className="font-bold text-lg text-red-400 flex items-center gap-2">
                  <AlertCircle size={20} />
                  Pending ({pendingOrders.length})
                </h2>
              </div>
              <div className="space-y-4">
                {pendingOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>

            {/* Preparing Column */}
            <div>
              <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-lg p-3 mb-4">
                <h2 className="font-bold text-lg text-yellow-400 flex items-center gap-2">
                  <ChefHat size={20} />
                  Preparing ({preparingOrders.length})
                </h2>
              </div>
              <div className="space-y-4">
                {preparingOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>

            {/* Served Column */}
            <div>
              <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-3 mb-4">
                <h2 className="font-bold text-lg text-green-400 flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  Served ({servedOrders.length})
                </h2>
              </div>
              <div className="space-y-4">
                {servedOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>

            {/* Bill Review Column */}
            <div>
              <div className="bg-orange-500/20 border-2 border-orange-500 rounded-lg p-3 mb-4">
                <h2 className="font-bold text-lg text-orange-400 flex items-center gap-2">
                  <Receipt size={20} />
                  Bill Review ({billReviewOrders.length})
                </h2>
              </div>
              <div className="space-y-4">
                {billReviewOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>

            {/* Payment Verification Column */}
            <div>
              <div className="bg-blue-500/20 border-2 border-blue-500 rounded-lg p-3 mb-4">
                <h2 className="font-bold text-lg text-blue-400 flex items-center gap-2">
                  <Upload size={20} />
                  Payment Verification ({paymentVerificationOrders.length})
                </h2>
              </div>
              <div className="space-y-4">
                {paymentVerificationOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>

            {/* Completed Column */}
            <div>
              <div className="bg-purple-500/20 border-2 border-purple-500 rounded-lg p-3 mb-4">
                <h2 className="font-bold text-lg text-purple-400 flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  Completed ({completedOrders.length})
                </h2>
              </div>
              <div className="space-y-4">
                {completedOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Verification Modal */}
      {verifyingOrder && (
        <PaymentVerificationModal
          order={verifyingOrder}
          role="waiter"
          onVerify={handleVerifyPayment}
          onReject={handleRejectPayment}
          onClose={() => setVerifyingOrder(null)}
        />
      )}

      <Toast
        message="New order received!"
        isVisible={showNewOrderToast}
        onClose={() => setShowNewOrderToast(false)}
      />
    </main>
  );
}
