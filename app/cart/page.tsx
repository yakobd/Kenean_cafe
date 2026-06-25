'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, Minus, Plus, Trash2, User, Hash, Banknote, Smartphone, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Toast from '@/components/Toast';

export default function CartPage() {
  const { cartItems, updateQuantity, placeOrder } = useApp();
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank-transfer'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const router = useRouter();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const isFormValid = customerName.trim() !== '' && tableNumber !== '' && parseInt(tableNumber) > 0;

  const handlePlaceOrder = async () => {
    if (!isFormValid || cartItems.length === 0) return;
    
    setIsSubmitting(true);

    // Simulate sending to kitchen
    await new Promise(resolve => setTimeout(resolve, 1500));

    placeOrder({
      customerName: customerName.trim(),
      tableNumber: parseInt(tableNumber),
      paymentMethod,
      specialInstructions: specialInstructions.trim() || undefined,
    });

    setIsSubmitting(false);
    
    // Show success toast before redirecting
    setToastMessage('Order placed! Waiting for waiter confirmation... ⏳');
    setShowToast(true);
    
    // Redirect after a short delay to show the toast
    setTimeout(() => {
      router.push('/orders');
    }, 1000);
  };

  return (
    <main className="min-h-screen pb-24 bg-cream">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-charcoal/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-serif text-charcoal">Your Cart</h1>
          <p className="text-sm text-charcoal/60 mt-1">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto text-charcoal/20 mb-4" size={64} />
            <h2 className="text-2xl font-semibold text-charcoal mb-2">
              Your cart is empty
            </h2>
            <p className="text-charcoal/60 mb-8">
              Add some delicious items from our menu
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-gold text-white px-8 py-3 rounded-full font-semibold hover:bg-gold/90 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Item Image */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-charcoal text-lg mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-charcoal/60 mb-3">
                        {item.description}
                      </p>
                      <p className="text-gold font-bold text-lg">
                        {item.price} ብር
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => updateQuantity(item.id, 0)}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="flex items-center gap-3 bg-cream rounded-full px-3 py-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          className="p-1 hover:bg-white rounded-full transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 hover:bg-white rounded-full transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Details Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
              <h2 className="text-xl font-semibold text-charcoal mb-6">
                Order Details
              </h2>

              {/* Name Input */}
              <div className="mb-5">
                <label className="flex items-center gap-2 text-charcoal/70 font-medium mb-2">
                  <User size={18} className="text-gold" />
                  Your Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-[#F3F4F6] rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                />
              </div>

              {/* Table Number Input */}
              <div className="mb-5">
                <label className="flex items-center gap-2 text-charcoal/70 font-medium mb-2">
                  <Hash size={18} className="text-gold" />
                  Table Number
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Enter table number (1-50)"
                  className="w-full px-4 py-3 bg-[#F3F4F6] rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                />
              </div>

              {/* Payment Method Selection */}
              <div className="mb-5">
                <label className="flex items-center gap-2 text-charcoal/70 font-medium mb-3">
                  <Banknote size={18} className="text-gold" />
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-gold bg-gold/5'
                        : 'border-charcoal/10 bg-[#F3F4F6] hover:border-gold/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">💵</div>
                    <div className="font-semibold text-charcoal">Cash</div>
                    <div className="text-xs text-charcoal/60 mt-1">Pay at counter</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank-transfer')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'bank-transfer'
                        ? 'border-gold bg-gold/5'
                        : 'border-charcoal/10 bg-[#F3F4F6] hover:border-gold/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">📱</div>
                    <div className="font-semibold text-charcoal">Bank Transfer</div>
                    <div className="text-xs text-charcoal/60 mt-1">Mobile banking</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
              <label className="block text-charcoal font-semibold mb-3">
                Special Instructions (Optional)
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any dietary restrictions or special requests?"
                className="w-full px-4 py-3 bg-[#F3F4F6] rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none transition-all"
                rows={4}
              />
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
              <h2 className="text-xl font-semibold text-charcoal mb-4">
                Order Summary
              </h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-charcoal/70">
                  <span>Subtotal</span>
                  <span>{total} ብር</span>
                </div>
                <div className="flex justify-between text-charcoal/70">
                  <span>Service Charge</span>
                  <span>0 ብር</span>
                </div>
                <div className="h-px bg-charcoal/10 my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-charcoal">
                    Total
                  </span>
                  <span className="text-3xl font-bold text-gold">
                    {total} ብር
                  </span>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-5 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3 ${
                !isFormValid || isSubmitting
                  ? 'bg-charcoal/30 text-charcoal/50 cursor-not-allowed'
                  : 'bg-gold text-white hover:bg-gold/90 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Sending to Kitchen...
                </>
              ) : (
                'Place Order'
              )}
            </button>

            {!isFormValid && (
              <p className="text-center text-sm text-charcoal/50 mt-3">
                Please fill in your name and table number to continue
              </p>
            )}
          </>
        )}
      </div>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type="info"
      />
    </main>
  );
}
