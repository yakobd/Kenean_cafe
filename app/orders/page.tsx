'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Clock, CheckCircle2, ChefHat, Receipt, User, Hash, Upload, XCircle, MessageSquare } from 'lucide-react';
import { OrderStatus } from '@/types/order';
import SuccessModal from '@/components/SuccessModal';
import Toast from '@/components/Toast';
import PaymentInvoice from '@/components/PaymentInvoice';

export default function OrdersPage() {
  const { orderSession, clearNotification, hasNotification, updateOrderStatus } = useApp();
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [feedback, setFeedback] = useState('');

  // Keep cafe-active-order in sync so NotificationContext can find the customer's order
  useEffect(() => {
    const order = orderSession.activeOrder;
    if (!order) return;

    if (order.status === 'completed' || order.status === 'rejected') {
      localStorage.removeItem('cafe-active-order');
    } else {
      localStorage.setItem('cafe-active-order', JSON.stringify(order));
    }
  }, [orderSession.activeOrder]);

  // Poll localStorage for status updates from waiter/cashier
  useEffect(() => {
    const checkForUpdates = () => {
      if (!orderSession.activeOrder) return;

      const storedOrders = localStorage.getItem('cafe-orders');
      if (storedOrders) {
        const orders = JSON.parse(storedOrders);
        const currentOrder = orders.find((o: any) => o.id === orderSession.activeOrder?.id);
        
        if (currentOrder && currentOrder.status !== orderSession.activeOrder.status) {
          updateOrderStatus(currentOrder.id, currentOrder.status);
          
          // Show appropriate toast
          if (currentOrder.status === 'preparing') {
            setToastMessage('Order Accepted! Your food is now being prepared. 🍳');
            setToastType('success');
            setShowToast(true);
          } else if (currentOrder.status === 'served') {
            setToastMessage('Your food has arrived! Enjoy your meal! 🍽️');
            setToastType('success');
            setShowToast(true);
          } else if (currentOrder.status === 'rejected') {
            setToastMessage('Order Declined. Please check your cart or ask a waiter for assistance. ❌');
            setToastType('error');
            setShowToast(true);
          } else if (currentOrder.status === 'bill-cashier-review') {
            setToastMessage('Waiter approved! Cashier is reviewing your bill... ✓');
            setToastType('info');
            setShowToast(true);
          } else if (currentOrder.status === 'awaiting-payment') {
            setToastMessage('Bill approved! You can now proceed with payment. 💳');
            setToastType('success');
            setShowToast(true);
          } else if (currentOrder.status === 'payment-waiter-verified') {
            setToastMessage('Waiter verified! Cashier is confirming payment... ✓');
            setToastType('info');
            setShowToast(true);
          } else if (currentOrder.status === 'payment-confirmed') {
            setToastMessage('Payment confirmed! Thank you for visiting ከነአን. ✨');
            setToastType('success');
            setShowToast(true);
          }
        }
      }
    };

    const interval = setInterval(checkForUpdates, 2000);
    return () => clearInterval(interval);
  }, [orderSession.activeOrder, updateOrderStatus]);

  useEffect(() => {
    if (hasNotification) {
      setShowToast(true);
      clearNotification();
    }
  }, [hasNotification, clearNotification]);

  const handleRequestBill = () => {
    if (orderSession.activeOrder) {
      updateOrderStatus(orderSession.activeOrder.id, 'bill-waiter-review');
      setSuccessModal({
        isOpen: true,
        message: 'Bill request sent to waiter for review.',
      });
    }
  };

  const handlePaymentSubmit = async (file: File | null, referenceNote?: string) => {
    if (!orderSession.activeOrder) return;

    if (orderSession.activeOrder.paymentMethod === 'bank-transfer' && !file) {
      setToastMessage('Please select a payment proof file');
      setShowToast(true);
      return;
    }

    if (file) {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        
        // Update order with payment proof
        const storedOrders = JSON.parse(localStorage.getItem('cafe-orders') || '[]');
        const updatedOrders = storedOrders.map((order: any) =>
          order.id === orderSession.activeOrder?.id
            ? {
                ...order,
                status: 'payment-submitted',
                paymentProof: {
                  fileName: file.name,
                  fileData: base64,
                  uploadedAt: new Date(),
                },
                paymentReferenceNote: referenceNote,
              }
            : order
        );
        localStorage.setItem('cafe-orders', JSON.stringify(updatedOrders));

        updateOrderStatus(orderSession.activeOrder!.id, 'payment-submitted');
        setSuccessModal({
          isOpen: true,
          message: 'Payment proof submitted! Awaiting verification.',
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Cash payment
      const storedOrders = JSON.parse(localStorage.getItem('cafe-orders') || '[]');
      const updatedOrders = storedOrders.map((order: any) =>
        order.id === orderSession.activeOrder?.id
          ? { ...order, status: 'payment-submitted' }
          : order
      );
      localStorage.setItem('cafe-orders', JSON.stringify(updatedOrders));
      updateOrderStatus(orderSession.activeOrder.id, 'payment-submitted');
      setSuccessModal({
        isOpen: true,
        message: 'Cash payment confirmed! Awaiting verification.',
      });
    }
  };

  const handleFeedbackSubmit = () => {
    if (!orderSession.activeOrder) return;

    const storedOrders = JSON.parse(localStorage.getItem('cafe-orders') || '[]');
    const updatedOrders = storedOrders.map((order: any) =>
      order.id === orderSession.activeOrder?.id
        ? { 
            ...order, 
            customerFeedback: feedback.trim() || 'No feedback provided',
            status: 'completed'
          }
        : order
    );
    localStorage.setItem('cafe-orders', JSON.stringify(updatedOrders));

    updateOrderStatus(orderSession.activeOrder.id, 'completed');
    setToastMessage('Thank you for your feedback!');
    setShowToast(true);
    setFeedback('');
  };

  const handleSkipFeedback = () => {
    if (!orderSession.activeOrder) return;

    const storedOrders = JSON.parse(localStorage.getItem('cafe-orders') || '[]');
    const updatedOrders = storedOrders.map((order: any) =>
      order.id === orderSession.activeOrder?.id
        ? { ...order, status: 'completed' }
        : order
    );
    localStorage.setItem('cafe-orders', JSON.stringify(updatedOrders));

    updateOrderStatus(orderSession.activeOrder.id, 'completed');
    setToastMessage('Session completed. See you again!');
    setShowToast(true);
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500 animate-pulse" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      case 'preparing':
        return <ChefHat className="text-blue-500" size={20} />;
      case 'served':
        return <CheckCircle2 className="text-green-500" size={20} />;
      case 'bill-waiter-review':
        return <Receipt className="text-orange-500 animate-pulse" size={20} />;
      case 'bill-cashier-review':
        return <Receipt className="text-orange-600 animate-pulse" size={20} />;
      case 'awaiting-payment':
        return <Receipt className="text-purple-500" size={20} />;
      case 'payment-submitted':
        return <Upload className="text-blue-500 animate-pulse" size={20} />;
      case 'payment-waiter-verified':
        return <Upload className="text-blue-600 animate-pulse" size={20} />;
      case 'payment-confirmed':
        return <CheckCircle2 className="text-green-500" size={20} />;
      case 'completed':
        return <CheckCircle2 className="text-green-600" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'Awaiting Confirmation';
      case 'rejected':
        return 'Order Rejected';
      case 'preparing':
        return 'Being Prepared';
      case 'served':
        return 'Served - Enjoy Your Meal!';
      case 'bill-waiter-review':
        return 'Bill - Waiter Review';
      case 'bill-cashier-review':
        return 'Bill - Cashier Approval';
      case 'awaiting-payment':
        return 'Ready for Payment';
      case 'payment-submitted':
        return 'Payment - Waiter Verification';
      case 'payment-waiter-verified':
        return 'Payment - Cashier Confirmation';
      case 'payment-confirmed':
        return 'Payment Successful!';
      case 'completed':
        return 'Session Completed';
      default:
        return 'Unknown';
    }
  };

  const activeOrder = orderSession.activeOrder;
  const canRequestBill = activeOrder?.status === 'served';
  const showBillReview = activeOrder && ['bill-waiter-review', 'bill-cashier-review'].includes(activeOrder.status);
  const showPaymentInvoice = activeOrder?.status === 'awaiting-payment';
  const showPaymentVerification = activeOrder && ['payment-submitted', 'payment-waiter-verified'].includes(activeOrder.status);
  const showPaymentSuccess = activeOrder && ['payment-confirmed', 'completed'].includes(activeOrder.status);
  const showFeedback = activeOrder?.status === 'payment-confirmed';

  return (
    <main className="min-h-screen pb-24 bg-cream">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-charcoal/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-serif text-charcoal">My Orders</h1>
          <p className="text-sm text-charcoal/60 mt-1">Active Session</p>
          {activeOrder && (
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-2 text-charcoal/70">
                <User size={16} className="text-gold" />
                <span>{activeOrder.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal/70">
                <Hash size={16} className="text-gold" />
                <span>Table {activeOrder.tableNumber}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {!activeOrder ? (
          // Empty State
          <div className="text-center py-16">
            <Receipt className="mx-auto text-charcoal/20 mb-4" size={64} />
            <h2 className="text-xl font-semibold text-charcoal mb-2">
              No Active Orders
            </h2>
            <p className="text-charcoal/60 mb-6">
              Start ordering from the menu to see your items here
            </p>
          </div>
        ) : (
          <>
            {/* Order Status Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon(activeOrder.status)}
                <span className="font-medium text-charcoal text-lg">
                  {getStatusText(activeOrder.status)}
                </span>
              </div>

              {/* Pending Order Message */}
              {activeOrder.status === 'pending' && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    ⏳ Your order has been sent to the kitchen
                  </p>
                  <p className="text-xs text-blue-700">
                    Please wait while our waiter reviews and confirms your order. This usually takes just a moment!
                  </p>
                </div>
              )}

              {/* Rejection Message */}
              {activeOrder.status === 'rejected' && activeOrder.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-800">
                    <strong>Reason:</strong> {activeOrder.rejectionReason}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    Please modify your order and try again.
                  </p>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {activeOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-charcoal">
                        {item.name}
                      </p>
                      <p className="text-sm text-charcoal/60">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gold">
                      {item.price * item.quantity} ብር
                    </p>
                  </div>
                ))}
              </div>

              {activeOrder.specialInstructions && (
                <div className="mt-4 pt-4 border-t border-charcoal/10">
                  <p className="text-sm text-charcoal/60 mb-1">Special Instructions:</p>
                  <p className="text-sm text-charcoal italic">
                    {activeOrder.specialInstructions}
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-charcoal/10 flex justify-between items-center">
                <span className="text-charcoal/60 font-medium">Total</span>
                <span className="text-2xl font-bold text-gold">
                  {activeOrder.total} ብር
                </span>
              </div>
            </div>

            {/* Bill Details & Payment */}
            {showBillReview && (
              <div className="bg-orange-50 rounded-2xl p-6 shadow-sm mb-6 border-2 border-orange-300">
                <h2 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <Receipt className="text-orange-600 animate-pulse" size={24} />
                  Bill Review in Progress
                </h2>
                <div className="space-y-3">
                  {activeOrder.status === 'bill-waiter-review' && (
                    <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="font-semibold text-orange-900">Step 1: Waiter Review</span>
                      </div>
                      <p className="text-sm text-orange-700 ml-6">
                        Your waiter is reviewing the items and prices for accuracy...
                      </p>
                    </div>
                  )}
                  {activeOrder.status === 'bill-cashier-review' && (
                    <>
                      <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle2 className="text-green-600" size={20} />
                          <span className="font-semibold text-green-900">Step 1: Waiter Approved</span>
                        </div>
                        {activeOrder.billReviewedByWaiter && (
                          <p className="text-xs text-green-700 ml-8">
                            Reviewed by {activeOrder.billReviewedByWaiter.waiterName} at{' '}
                            {new Date(activeOrder.billReviewedByWaiter.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="font-semibold text-orange-900">Step 2: Cashier Approval</span>
                        </div>
                        <p className="text-sm text-orange-700 ml-6">
                          Cashier is performing final bill approval...
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Payment Verification Status */}
            {showPaymentVerification && (
              <div className="bg-blue-50 rounded-2xl p-6 shadow-sm mb-6 border-2 border-blue-300">
                <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Upload className="text-blue-600 animate-pulse" size={24} />
                  Payment Verification in Progress
                </h2>
                
                {/* Please Stay Message */}
                <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    ⏳ Please stay on this page
                  </p>
                  <p className="text-xs text-blue-700">
                    Our staff is currently reviewing your payment. You'll be notified once verification is complete.
                  </p>
                </div>

                <div className="space-y-3">
                  {activeOrder.status === 'payment-submitted' && (
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="font-semibold text-blue-900">Step 1: Waiter Verification</span>
                      </div>
                      <p className="text-sm text-blue-700 ml-6">
                        Your waiter is verifying the payment details...
                      </p>
                    </div>
                  )}
                  {activeOrder.status === 'payment-waiter-verified' && (
                    <>
                      <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle2 className="text-green-600" size={20} />
                          <span className="font-semibold text-green-900">Step 1: Waiter Verified</span>
                        </div>
                        {activeOrder.paymentVerifiedByWaiter && (
                          <p className="text-xs text-green-700 ml-8">
                            Verified by {activeOrder.paymentVerifiedByWaiter.waiterName} at{' '}
                            {new Date(activeOrder.paymentVerifiedByWaiter.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="font-semibold text-blue-900">Step 2: Cashier Confirmation</span>
                        </div>
                        <p className="text-sm text-blue-700 ml-6">
                          Cashier is performing final payment confirmation...
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Payment Invoice */}
            {showPaymentInvoice && (
              <PaymentInvoice
                order={activeOrder}
                onPaymentSubmit={handlePaymentSubmit}
              />
            )}

            {/* Payment Success */}
            {showPaymentSuccess && (
              <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 shadow-sm mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="text-green-600" size={32} />
                  <h3 className="text-xl font-bold text-green-900">Payment Successful!</h3>
                </div>
                <p className="text-sm text-green-700 mb-4">
                  Thank you for visiting ከነአን Café. We hope to see you again soon!
                </p>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-xs text-green-600 mb-1">Transaction ID</p>
                  <p className="font-mono font-bold text-green-900">{activeOrder.id.toUpperCase()}</p>
                </div>
              </div>
            )}

            {/* Request Bill Button */}
            {canRequestBill && (
              <button
                onClick={handleRequestBill}
                className="w-full bg-gold text-white py-4 rounded-full font-semibold text-lg hover:bg-gold/90 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-lg mb-6"
              >
                <Receipt size={20} />
                Request Bill
              </button>
            )}

            {/* Feedback Section */}
            {showFeedback && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
                  <MessageSquare className="text-gold" size={20} />
                  Share Your Feedback
                </h3>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="How was your experience at ከነአን Café?"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold resize-none mb-3"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleFeedbackSubmit}
                    className="flex-1 bg-gold text-white py-3 rounded-lg font-semibold transition-colors hover:bg-gold/90"
                  >
                    Submit Feedback
                  </button>
                  <button
                    onClick={handleSkipFeedback}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors hover:bg-gray-400"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        message={successModal.message}
      />

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
    </main>
  );
}
