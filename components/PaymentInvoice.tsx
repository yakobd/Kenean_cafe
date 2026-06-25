'use client';

import { useState } from 'react';
import { Copy, Upload, CheckCircle2, Receipt, Calendar, Hash, User, CreditCard } from 'lucide-react';
import { Order } from '@/types/order';

interface PaymentInvoiceProps {
  order: Order;
  onPaymentSubmit: (file: File | null, referenceNote?: string) => void;
}

export default function PaymentInvoice({ order, onPaymentSubmit }: PaymentInvoiceProps) {
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [referenceNote, setReferenceNote] = useState('');
  const [copied, setCopied] = useState(false);

  const transactionId = order.id.toUpperCase();
  const invoiceDate = new Date(order.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const invoiceTime = new Date(order.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('1000420841632');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onPaymentSubmit(paymentFile, referenceNote.trim() || undefined);
  };

  const isBankTransfer = order.paymentMethod === 'bank-transfer';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Invoice Document - Paper Style */}
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-gold/10 to-gold/5 border-b-2 border-gold/30 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-serif text-charcoal mb-1">ከነአን</h1>
              <p className="text-sm text-charcoal/60">Café & Restaurant</p>
            </div>
            <div className="text-right">
              <div className="bg-gold/20 px-4 py-2 rounded-lg border border-gold/30">
                <p className="text-xs text-charcoal/60 mb-1">Transaction ID</p>
                <p className="text-sm font-mono font-bold text-charcoal">{transactionId}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-charcoal/70">
              <Calendar size={16} className="text-gold" />
              <span>{invoiceDate} at {invoiceTime}</span>
            </div>
            <div className="flex items-center gap-2 text-charcoal/70">
              <Hash size={16} className="text-gold" />
              <span>Table {order.tableNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-charcoal/70">
              <User size={16} className="text-gold" />
              <span>{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-charcoal/70">
              <CreditCard size={16} className="text-gold" />
              <span>{isBankTransfer ? 'Bank Transfer' : 'Cash'}</span>
            </div>
          </div>
        </div>

        {/* Itemized Bill */}
        <div className="px-6 py-5">
          <h2 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
            <Receipt size={20} className="text-gold" />
            Order Summary
          </h2>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 text-sm font-bold text-charcoal">Item</th>
                  <th className="text-center py-3 text-sm font-bold text-charcoal w-16">Qty</th>
                  <th className="text-right py-3 text-sm font-bold text-charcoal w-24">Price</th>
                  <th className="text-right py-3 text-sm font-bold text-charcoal w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={item.id} className={index !== order.items.length - 1 ? 'border-b border-gray-200' : ''}>
                    <td className="py-3 text-sm text-charcoal">{item.name}</td>
                    <td className="text-center py-3 text-sm text-charcoal">{item.quantity}</td>
                    <td className="text-right py-3 text-sm text-charcoal/70">{item.price} ብር</td>
                    <td className="text-right py-3 text-sm font-semibold text-charcoal">
                      {item.price * item.quantity} ብር
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="bg-gold/10 rounded-lg p-4 border-2 border-gold/30">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-charcoal">Grand Total</span>
              <span className="text-3xl font-bold text-gold">{order.total} ብር</span>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        {isBankTransfer ? (
          <div className="px-6 pb-6">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-5 mb-4">
              <h3 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
                <CreditCard size={20} />
                Bank Transfer Details
              </h3>
              
              <div className="space-y-3 mb-4">
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-700 mb-1">Bank Name</p>
                  <p className="font-semibold text-blue-900">Commercial Bank of Ethiopia (CBE)</p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-blue-700">Account Number</p>
                    <button
                      onClick={handleCopyAccount}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 size={14} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono font-bold text-blue-900 text-lg">1000420841632</p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-700 mb-1">Account Name</p>
                  <p className="font-semibold text-blue-900">Yakob Dereje Negash</p>
                </div>

                <div className="bg-blue-100 rounded-lg p-3 border-2 border-blue-400">
                  <p className="text-xs text-blue-700 mb-1">Amount to Transfer</p>
                  <p className="font-bold text-blue-900 text-2xl">{order.total} ብር</p>
                </div>
              </div>

              <div className="bg-blue-100 rounded-lg p-3 border border-blue-300">
                <p className="text-xs text-blue-800 font-medium">
                  💡 Please use Transaction ID <span className="font-mono font-bold">{transactionId}</span> as reference when transferring
                </p>
              </div>
            </div>

            {/* Upload Section */}
            <div className="bg-gray-50 rounded-lg p-5 border-2 border-gray-300">
              <h3 className="font-bold text-charcoal mb-4 text-lg flex items-center gap-2">
                <Upload size={20} className="text-gold" />
                Upload Payment Proof
              </h3>

              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Receipt Screenshot <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold file:text-white file:cursor-pointer file:font-semibold hover:file:bg-gold/90 transition-colors"
                  />
                </div>
                {paymentFile && (
                  <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    Selected: {paymentFile.name} ({(paymentFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-charcoal mb-2">Preview:</p>
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-300">
                    <img
                      src={imagePreview}
                      alt="Payment proof preview"
                      className="w-full h-auto max-h-64 object-contain bg-gray-100"
                    />
                  </div>
                </div>
              )}

              {/* Reference Note */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Reference Number / Notes <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={referenceNote}
                  onChange={(e) => setReferenceNote(e.target.value)}
                  placeholder="Enter transaction reference number or any additional notes..."
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold resize-none text-sm"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!paymentFile}
                className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                  paymentFile
                    ? 'bg-gold text-white hover:bg-gold/90 hover:scale-[1.02] active:scale-95 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Upload size={22} />
                Submit Payment for Verification
              </button>

              {!paymentFile && (
                <p className="text-xs text-red-600 text-center mt-2">
                  Please upload a payment screenshot to continue
                </p>
              )}
            </div>
          </div>
        ) : (
          // Cash Payment
          <div className="px-6 pb-6">
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-5">
              <h3 className="font-bold text-green-900 mb-3 text-lg flex items-center gap-2">
                <CreditCard size={20} />
                Cash Payment
              </h3>
              <p className="text-sm text-green-700 mb-4">
                Please proceed to the counter and pay <span className="font-bold text-lg">{order.total} ብר</span> in cash.
              </p>
              <p className="text-xs text-green-600 mb-4">
                Show this Transaction ID to the cashier: <span className="font-mono font-bold">{transactionId}</span>
              </p>
              <button
                onClick={() => onPaymentSubmit(null)}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-lg"
              >
                <CheckCircle2 size={22} />
                Confirm Cash Payment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="mt-4 text-center">
        <p className="text-xs text-charcoal/50">
          Thank you for dining at ከነአን Café
        </p>
      </div>
    </div>
  );
}
