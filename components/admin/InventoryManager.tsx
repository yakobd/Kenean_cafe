'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import { MasterInventoryItem } from '@/types/inventory';
import Toast from '@/components/Toast';

export default function InventoryManager() {
  const [inventory, setInventory] = useState<MasterInventoryItem[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [restockingItem, setRestockingItem] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('cafe-master-inventory');
    if (stored) {
      setInventory(JSON.parse(stored));
    } else {
      // Initialize with default inventory matching MasterInventoryItem shape
      const defaultInventory: MasterInventoryItem[] = [
        { id: '1', name: 'Coffee Beans', nameAmharic: 'ቡና', category: 'Raw Materials', quantity: 50, unit: 'kg', unitPrice: 450, lowStockThreshold: 10, lastUpdated: new Date() },
        { id: '2', name: 'Milk', nameAmharic: 'ወተት', category: 'Dairy', quantity: 30, unit: 'liters', unitPrice: 25, lowStockThreshold: 5, lastUpdated: new Date() },
        { id: '3', name: 'Sugar', nameAmharic: 'ስኳር', category: 'Raw Materials', quantity: 25, unit: 'kg', unitPrice: 35, lowStockThreshold: 5, lastUpdated: new Date() },
        { id: '4', name: 'Flour', nameAmharic: 'ዱቄት', category: 'Raw Materials', quantity: 40, unit: 'kg', unitPrice: 28, lowStockThreshold: 10, lastUpdated: new Date() },
        { id: '5', name: 'Eggs', nameAmharic: 'እንቁላል', category: 'Dairy', quantity: 120, unit: 'pieces', unitPrice: 3, lowStockThreshold: 24, lastUpdated: new Date() },
        { id: '6', name: 'Butter', nameAmharic: 'ቅቤ', category: 'Dairy', quantity: 15, unit: 'kg', unitPrice: 180, lowStockThreshold: 3, lastUpdated: new Date() },
      ];
      setInventory(defaultInventory);
      localStorage.setItem('cafe-master-inventory', JSON.stringify(defaultInventory));
    }
  }, []);

  const saveInventory = (items: MasterInventoryItem[]) => {
    setInventory(items);
    localStorage.setItem('cafe-master-inventory', JSON.stringify(items));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    const updated = inventory.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(0, newQuantity), lastUpdated: new Date() }
        : item
    );
    saveInventory(updated);
    setToastMessage('Inventory updated');
    setShowToast(true);
  };

  const handleRestock = (id: string) => {
    const amount = parseFloat(restockAmount);
    if (!amount || amount <= 0) {
      setToastMessage('Please enter a valid restock amount');
      setShowToast(true);
      return;
    }

    const item = inventory.find(i => i.id === id);
    if (item) {
      updateQuantity(id, item.quantity + amount);
      setToastMessage(`Restocked ${amount} ${item.unit} of ${item.name}`);
      setShowToast(true);
      setRestockingItem(null);
      setRestockAmount('');
    }
  };

  const lowStockItems = inventory.filter(item => item.quantity <= item.lowStockThreshold);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Manager</h1>
          <p className="text-gray-600 mt-1">Track and manage your supplies</p>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">Low Stock Alert!</h3>
                <p className="text-sm text-red-700 mb-2">
                  The following items are running low:
                </p>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.map(item => (
                    <span
                      key={item.id}
                      className="bg-red-200 text-red-900 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {item.name} ({item.quantity} {item.unit})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => {
            const isLowStock = item.quantity <= item.lowStockThreshold;
            const stockPercentage = (item.quantity / (item.lowStockThreshold * 3)) * 100;
            const isRestocking = restockingItem === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border-2 p-6 shadow-sm transition-all ${
                  isLowStock ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600">{item.nameAmharic}</p>
                  </div>
                  <Package
                    className={isLowStock ? 'text-red-500' : 'text-green-500'}
                    size={24}
                  />
                </div>

                {/* Stock Level Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Stock Level</span>
                    <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isLowStock ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Low stock threshold: {item.lowStockThreshold} {item.unit}
                  </div>
                </div>

                {/* Restock Section */}
                {isRestocking ? (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restock Amount ({item.unit})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={restockAmount}
                      onChange={(e) => setRestockAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestock(item.id)}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setRestockingItem(null);
                          setRestockAmount('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setRestockingItem(item.id)}
                    className="w-full mb-3 bg-blue-100 text-blue-700 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <TrendingUp size={18} />
                    Restock
                  </button>
                )}

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                  >
                    - 1
                  </button>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg font-semibold hover:bg-green-200 transition-colors"
                  >
                    + 1
                  </button>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 10)}
                    className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
                  >
                    + 10
                  </button>
                </div>

                <div className="mt-3 text-xs text-gray-500 text-center">
                  Last updated: {new Date(item.lastUpdated).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
