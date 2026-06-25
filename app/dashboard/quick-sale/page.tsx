'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  CreditCard,
  Banknote,
  CheckCircle,
  X,
} from 'lucide-react';
import { MenuItem, CartItem } from '@/types/menu';
import { QuickSale } from '@/types/quick-sale';
import { useRole } from '@/context/RoleContext';
import Toast from '@/components/Toast';
import SuccessModal from '@/components/SuccessModal';

export default function QuickSalePage() {
  const router = useRouter();
  const { role } = useRole();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank-transfer'>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSaleId, setLastSaleId] = useState('');

  // Get staff name based on role
  const getStaffName = () => {
    switch (role) {
      case 'waiter':
        return 'Waiter-1';
      case 'cashier':
        return 'Cashier-1';
      case 'admin':
        return 'Admin User';
      case 'super-admin':
        return 'Super Admin';
      default:
        return 'Staff';
    }
  };

  useEffect(() => {
    // Redirect if not staff
    if (role === 'customer') {
      router.push('/');
      return;
    }

    loadMenuItems();
  }, [role, router]);

  const loadMenuItems = () => {
    // Try to load from cafe-menu first (if exists)
    let stored = localStorage.getItem('cafe-menu');
    
    if (stored) {
      setMenuItems(JSON.parse(stored));
    } else {
      // Fall back to default menu items from data/menu.ts
      import('@/data/menu').then((module) => {
        setMenuItems(module.menuItems);
        // Save to localStorage for future use
        localStorage.setItem('cafe-menu', JSON.stringify(module.menuItems));
      });
    }
  };

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    
    if (confirm('Clear all items from cart?')) {
      setCart([]);
      setReferenceNumber('');
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const completeSale = () => {
    if (cart.length === 0) {
      setToastMessage('Cart is empty');
      setShowToast(true);
      return;
    }

    if (paymentMethod === 'bank-transfer' && !referenceNumber.trim()) {
      setToastMessage('Please enter a reference number for bank transfer');
      setShowToast(true);
      return;
    }

    const saleId = `qs-${Date.now()}`;
    const sale: QuickSale = {
      id: saleId,
      items: cart,
      total: calculateTotal(),
      paymentMethod,
      referenceNumber: paymentMethod === 'bank-transfer' ? referenceNumber : undefined,
      timestamp: new Date(),
      staffName: getStaffName(),
      staffRole: role as 'waiter' | 'cashier' | 'admin' | 'super-admin',
      type: 'quick-sale',
    };

    // Save to localStorage
    const existingSales = JSON.parse(localStorage.getItem('cafe-quick-sales') || '[]');
    existingSales.push(sale);
    localStorage.setItem('cafe-quick-sales', JSON.stringify(existingSales));

    // Add to order history for reporting
    const orderHistory = JSON.parse(localStorage.getItem('cafe-orders-history') || '[]');
    const quickSaleOrder = {
      id: saleId,
      items: cart,
      status: 'completed',
      timestamp: new Date(),
      total: calculateTotal(),
      customerName: 'Quick Sale',
      tableNumber: 0,
      paymentMethod,
      paymentReferenceNote: referenceNumber || undefined,
      billApprovedByCashier: {
        timestamp: new Date(),
        cashierName: getStaffName(),
      },
      paymentConfirmedByCashier: {
        timestamp: new Date(),
        cashierName: getStaffName(),
      },
      quickSale: true, // Flag for reporting
    };
    orderHistory.push(quickSaleOrder);
    localStorage.setItem('cafe-orders-history', JSON.stringify(orderHistory));

    setLastSaleId(saleId);
    setShowSuccess(true);
    setCart([]);
    setReferenceNumber('');
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
  };

  const total = calculateTotal();

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="text-blue-400" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-white">Quick Sale</h1>
                <p className="text-gray-400">Direct entry for instant transactions</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard/quick-sale/history"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                View History
              </Link>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Picker */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search Bar */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700 hover:border-blue-500 transition-all text-left group"
                >
                  <div className="aspect-square bg-gray-700 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{item.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-400">{item.price} ብር</span>
                    <Plus className="text-blue-400 group-hover:scale-125 transition-transform" size={20} />
                  </div>
                </button>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
                <Search className="mx-auto text-gray-600 mb-4" size={64} />
                <p className="text-gray-400">No items found</p>
              </div>
            )}
          </div>

          {/* Cart & Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl border border-gray-700 sticky top-24">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Cart</h2>
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Cart Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-900 rounded-lg p-3 border border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-400">{item.price} ብር each</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded flex items-center justify-center"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded flex items-center justify-center"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <span className="font-bold text-blue-400">
                          {(item.price * item.quantity).toFixed(0)} ብር
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {cart.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="mx-auto mb-2" size={48} />
                    <p>Cart is empty</p>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="p-6 border-b border-gray-700">
                <h3 className="font-semibold text-white mb-3">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    <Banknote className={`mx-auto mb-2 ${paymentMethod === 'cash' ? 'text-green-400' : 'text-gray-400'}`} size={32} />
                    <p className={`text-sm font-semibold ${paymentMethod === 'cash' ? 'text-green-400' : 'text-gray-400'}`}>
                      CASH
                    </p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank-transfer')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'bank-transfer'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    <CreditCard className={`mx-auto mb-2 ${paymentMethod === 'bank-transfer' ? 'text-blue-400' : 'text-gray-400'}`} size={32} />
                    <p className={`text-sm font-semibold ${paymentMethod === 'bank-transfer' ? 'text-blue-400' : 'text-gray-400'}`}>
                      TRANSFER
                    </p>
                  </button>
                </div>

                {paymentMethod === 'bank-transfer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="Enter reference number"
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Total & Complete */}
              <div className="p-6">
                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="text-white font-semibold">{total.toFixed(0)} ብር</span>
                  </div>
                  <div className="flex items-center justify-between text-xl font-bold border-t border-gray-700 pt-2">
                    <span className="text-white">TOTAL:</span>
                    <span className="text-blue-400">{total.toFixed(0)} ብር</span>
                  </div>
                </div>

                <button
                  onClick={completeSale}
                  disabled={cart.length === 0}
                  className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    cart.length === 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <CheckCircle size={24} />
                  Complete Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        title="Sale Completed! 🎉"
        message={`Transaction #${lastSaleId.slice(0, 8)} recorded successfully`}
      />
    </main>
  );
}
