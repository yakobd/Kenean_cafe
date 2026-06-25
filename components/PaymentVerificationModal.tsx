'use client';

import { useState } from 'react';
import { X, ZoomIn, CheckCircle2, AlertCircle, User, Hash, Receipt, CreditCard, Calendar, FileText } from 'lucide-react';
import { Order } from '@/types/order';

interface PaymentVerificationModalProps {
  order: Order;
  role: 'waiter' | 'cashier';
  onVerify: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}

export default function PaymentVerificationModal({
  order,
  role,
  onVerify,
  onReject,
  onClose,
}: PaymentVerificationModalProps) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [checklist, setChecklist] = useState({
    amountMatches: false,
    accountNameMatches: false,
    screenshotAuthentic: false,
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const transactionId = order.id.toUpperCase();
  const isCash = order.paymentMethod === 'cash';

  const allChecked = isCash 
    ? checklist.amountMatches && checklist.screenshotAuthentic
    : checklist.amountMatches && checklist.accountNameMatches && checklist.screenshotAuthentic;

  const toggleChecklistItem = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVerify = () => {
    if (allChecked) {
      onVerify();
    }
  };

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason.trim());
      setShowRejectForm(false);
      setRejectionReason('');
    }
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {role === 'waiter' ? 'Payment Verification' : 'Final Payment Confirmation'}
              </h2>
              <p className="text-blue-100 text-sm">
                {role === 'waiter' ? 'Review and verify payment details' : 'Perform final confirmation and close order'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Split View Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Left Side - Order Data */}
              <div className="space-y-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Receipt size={20} />
                    Order Information
                  </h3>

                  {/* Transaction ID */}
                  <div className="bg-white rounded-lg p-4 mb-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash size={16} className="text-blue-600" />
                      <span className="text-xs text-blue-700 font-medium">Transaction ID</span>
                    </div>
                    <p className="font-mono font-bold text-blue-900 text-lg">{transactionId}</p>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-white rounded-lg p-4 mb-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} className="text-blue-600" />
                      <span className="text-xs text-blue-700 font-medium">Customer Details</span>
                    </div>
                    <p className="font-semibold text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white rounded-lg p-4 mb-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard size={16} className="text-blue-600" />
                      <span className="text-xs text-blue-700 font-medium">Payment Method</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {isCash ? '💵 Cash Payment' : '📱 Bank Transfer'}
                    </p>
                  </div>

                  {/* Submission Time */}
                  <div className="bg-white rounded-lg p-4 mb-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={16} className="text-blue-600" />
                      <span className="text-xs text-blue-700 font-medium">Submitted At</span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {order.paymentProof 
                        ? new Date(order.paymentProof.uploadedAt).toLocaleString()
                        : new Date().toLocaleString()}
                    </p>
                  </div>

                  {/* Reference Note */}
                  {order.paymentReferenceNote && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={16} className="text-blue-600" />
                        <span className="text-xs text-blue-700 font-medium">Reference Note</span>
                      </div>
                      <p className="text-sm text-gray-900">{order.paymentReferenceNote}</p>
                    </div>
                  )}
                </div>

                {/* Itemized Bill */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Itemized Bill</h3>
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
                  <div className="pt-3 border-t-2 border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-600">{order.total} ብር</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Payment Proof */}
              <div className="space-y-4">
                {!isCash && order.paymentProof ? (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Receipt size={20} />
                        Payment Screenshot
                      </h3>
                      <button
                        onClick={() => setShowLightbox(true)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                      >
                        <ZoomIn size={16} />
                        View Full Size
                      </button>
                    </div>

                    {/* Thumbnail */}
                    <div 
                      className="relative rounded-lg overflow-hidden border-2 border-gray-300 bg-white cursor-pointer hover:border-blue-400 transition-colors"
                      onClick={() => setShowLightbox(true)}
                    >
                      <img
                        src={order.paymentProof.fileData}
                        alt="Payment proof"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="bg-white/90 rounded-full p-3 opacity-0 hover:opacity-100 transition-opacity">
                          <ZoomIn size={24} className="text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Click image to view full size • {order.paymentProof.fileName}
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                      <CreditCard size={20} />
                      Cash Payment
                    </h3>
                    <p className="text-sm text-green-700 mb-3">
                      Customer will pay {order.total} ብር in cash at the counter.
                    </p>
                    <div className="bg-white rounded-lg p-3 border border-green-300">
                      <p className="text-xs text-green-600 mb-1">Transaction ID for Reference:</p>
                      <p className="font-mono font-bold text-green-900">{transactionId}</p>
                    </div>
                  </div>
                )}

                {/* Validation Checklist */}
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-yellow-900 mb-4 flex items-center gap-2">
                    <AlertCircle size={20} />
                    Verification Checklist
                  </h3>
                  <div className="space-y-3">
                    {/* Amount Check */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checklist.amountMatches}
                        onChange={() => toggleChecklistItem('amountMatches')}
                        className="mt-1 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          Amount matches bill total
                        </p>
                        <p className="text-xs text-gray-600">
                          Verify: {order.total} ብር
                        </p>
                      </div>
                    </label>

                    {/* Account Name Check */}
                    {!isCash && (
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checklist.accountNameMatches}
                          onChange={() => toggleChecklistItem('accountNameMatches')}
                          className="mt-1 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            Account name matches
                          </p>
                          <p className="text-xs text-gray-600">
                            Expected: Yakob Dereje Negash
                          </p>
                        </div>
                      </label>
                    )}

                    {/* Authenticity Check */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checklist.screenshotAuthentic}
                        onChange={() => toggleChecklistItem('screenshotAuthentic')}
                        className="mt-1 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {isCash ? 'Cash payment confirmed' : 'Screenshot looks authentic'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {isCash ? 'Customer paid at counter' : 'No signs of tampering or editing'}
                        </p>
                      </div>
                    </label>
                  </div>

                  {!allChecked && (
                    <div className="mt-4 bg-yellow-100 border border-yellow-400 rounded-lg p-3">
                      <p className="text-xs text-yellow-800 font-medium">
                        ⚠️ Please complete all checklist items before proceeding
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t-2 border-gray-200 pt-6">
              {!showRejectForm ? (
                <div className="flex gap-4">
                  {/* Verify Button */}
                  <button
                    onClick={handleVerify}
                    disabled={!allChecked}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                      allChecked
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 size={24} />
                    {role === 'waiter' ? 'Verify & Forward to Cashier' : 'Final Confirmation & Close Table'}
                  </button>

                  {/* Reject Button */}
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="px-6 py-4 rounded-xl font-bold text-lg border-2 border-red-500 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <AlertCircle size={24} />
                    {role === 'waiter' ? 'Reject' : 'Flag Issue'}
                  </button>
                </div>
              ) : (
                // Rejection Form
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={20} />
                    {role === 'waiter' ? 'Reject Payment' : 'Flag Discrepancy'}
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    {role === 'waiter' 
                      ? 'Please provide a reason for rejecting this payment. The customer will be notified.'
                      : 'Describe the issue. This will be sent back to the waiter for review.'}
                  </p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-4"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleReject}
                      disabled={!rejectionReason.trim()}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                        rejectionReason.trim()
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectionReason('');
                      }}
                      className="px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && order.paymentProof && (
        <div 
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:bg-white/20 p-3 rounded-lg transition-colors z-10"
          >
            <X size={32} />
          </button>
          <div className="max-w-7xl max-h-full overflow-auto">
            <img
              src={order.paymentProof.fileData}
              alt="Payment proof full size"
              className="w-auto h-auto max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 px-6 py-3 rounded-full">
            <p className="text-sm text-gray-900 font-medium">
              Click anywhere to close • {order.paymentProof.fileName}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
