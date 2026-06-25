'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  X,
} from 'lucide-react';
import { MasterInventoryItem, getStockStatus } from '@/types/inventory';
import { useRole } from '@/context/RoleContext';
import Toast from '@/components/Toast';

export default function MasterInventoryPage() {
  const router = useRouter();
  const { role } = useRole();
  const [inventory, setInventory] = useState<MasterInventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<MasterInventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MasterInventoryItem | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    nameAmharic: '',
    category: '',
    quantity: 0,
    unit: '',
    unitPrice: 0,
    lowStockThreshold: 5,
  });

  // Check permissions
  const canEdit = role === 'admin' || role === 'super-admin';
  const canView = role === 'waiter' || role === 'cashier' || canEdit;

  useEffect(() => {
    // Redirect if no access
    if (!canView) {
      router.push('/');
      return;
    }

    loadInventory();
    loadCategories();
  }, [role, router, canView]);

  useEffect(() => {
    filterInventory();
  }, [searchQuery, categoryFilter, inventory]);

  const loadInventory = () => {
    const stored = localStorage.getItem('cafe-master-inventory');
    if (stored) {
      setInventory(JSON.parse(stored));
    } else {
      // Initialize with default inventory
      const defaultInventory: MasterInventoryItem[] = [
        { id: '1', name: 'Coffee Beans', nameAmharic: 'ቡና', category: 'Raw Materials', quantity: 50, unit: 'kg', unitPrice: 450, lowStockThreshold: 10, lastUpdated: new Date() },
        { id: '2', name: 'Milk', nameAmharic: 'ወተት', category: 'Dairy', quantity: 30, unit: 'liters', unitPrice: 25, lowStockThreshold: 5, lastUpdated: new Date() },
        { id: '3', name: 'Sugar', nameAmharic: 'ስኳር', category: 'Raw Materials', quantity: 25, unit: 'kg', unitPrice: 35, lowStockThreshold: 5, lastUpdated: new Date() },
        { id: '4', name: 'Flour', nameAmharic: 'ዱቄት', category: 'Raw Materials', quantity: 40, unit: 'kg', unitPrice: 28, lowStockThreshold: 10, lastUpdated: new Date() },
        { id: '5', name: 'Eggs', nameAmharic: 'እንቁላል', category: 'Dairy', quantity: 120, unit: 'pieces', unitPrice: 3, lowStockThreshold: 24, lastUpdated: new Date() },
        { id: '6', name: 'Butter', nameAmharic: 'ቅቤ', category: 'Dairy', quantity: 15, unit: 'kg', unitPrice: 180, lowStockThreshold: 3, lastUpdated: new Date() },
        { id: '7', name: 'Chocolate', nameAmharic: 'ቸኮሌት', category: 'Raw Materials', quantity: 8, unit: 'kg', unitPrice: 320, lowStockThreshold: 5, lastUpdated: new Date() },
        { id: '8', name: 'Cinnamon', nameAmharic: 'ቀረፋ', category: 'Spices', quantity: 2, unit: 'kg', unitPrice: 850, lowStockThreshold: 1, lastUpdated: new Date() },
      ];
      setInventory(defaultInventory);
      localStorage.setItem('cafe-master-inventory', JSON.stringify(defaultInventory));
    }
  };

  const loadCategories = () => {
    const stored = localStorage.getItem('cafe-categories');
    if (stored) {
      const cats = JSON.parse(stored);
      setCategories(cats.map((c: any) => c.name));
    } else {
      setCategories(['Raw Materials', 'Dairy', 'Spices', 'Packaging', 'Cleaning Supplies']);
    }
  };

  const filterInventory = () => {
    let filtered = inventory;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameAmharic.includes(searchQuery) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredInventory(filtered);
  };

  // Group inventory by category
  const groupedInventory = filteredInventory.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, MasterInventoryItem[]>);

  // Calculate category summaries
  const categorySummaries = Object.keys(groupedInventory).map(category => {
    const items = groupedInventory[category];
    const totalItems = items.length;
    const inStock = items.filter(item => getStockStatus(item.quantity) === 'in-stock').length;
    const lowStock = items.filter(item => getStockStatus(item.quantity) === 'low-stock').length;
    const outOfStock = items.filter(item => getStockStatus(item.quantity) === 'out-of-stock').length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    return {
      category,
      totalItems,
      inStock,
      lowStock,
      outOfStock,
      totalQuantity,
      totalValue,
    };
  });

  const saveInventory = (items: MasterInventoryItem[]) => {
    setInventory(items);
    localStorage.setItem('cafe-master-inventory', JSON.stringify(items));
  };

  const handleAdd = () => {
    if (!formData.name || !formData.category || !formData.unit) {
      setToastMessage('Please fill in all required fields');
      setShowToast(true);
      return;
    }

    const newItem: MasterInventoryItem = {
      id: `inv-${Date.now()}`,
      name: formData.name,
      nameAmharic: formData.nameAmharic,
      category: formData.category,
      quantity: formData.quantity,
      unit: formData.unit,
      unitPrice: formData.unitPrice,
      lowStockThreshold: formData.lowStockThreshold,
      lastUpdated: new Date(),
      updatedBy: role === 'admin' ? 'Admin User' : 'Super Admin',
    };

    saveInventory([...inventory, newItem]);
    setToastMessage('Item added successfully');
    setShowToast(true);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedItem || !formData.name || !formData.category || !formData.unit) {
      setToastMessage('Please fill in all required fields');
      setShowToast(true);
      return;
    }

    const updated = inventory.map(item =>
      item.id === selectedItem.id
        ? {
            ...item,
            name: formData.name,
            nameAmharic: formData.nameAmharic,
            category: formData.category,
            quantity: formData.quantity,
            unit: formData.unit,
            unitPrice: formData.unitPrice,
            lowStockThreshold: formData.lowStockThreshold,
            lastUpdated: new Date(),
            updatedBy: role === 'admin' ? 'Admin User' : 'Super Admin',
          }
        : item
    );

    saveInventory(updated);
    setToastMessage('Item updated successfully');
    setShowToast(true);
    setShowEditModal(false);
    setSelectedItem(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedItem) return;

    const updated = inventory.filter(item => item.id !== selectedItem.id);
    saveInventory(updated);
    setToastMessage('Item deleted successfully');
    setShowToast(true);
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (item: MasterInventoryItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      nameAmharic: item.nameAmharic,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      lowStockThreshold: item.lowStockThreshold,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (item: MasterInventoryItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameAmharic: '',
      category: '',
      quantity: 0,
      unit: '',
      unitPrice: 0,
      lowStockThreshold: 5,
    });
  };

  const getStatusBadge = (quantity: number) => {
    const status = getStockStatus(quantity);
    
    switch (status) {
      case 'in-stock':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
            <CheckCircle size={14} />
            In Stock
          </span>
        );
      case 'low-stock':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
            <AlertTriangle size={14} />
            Low Stock
          </span>
        );
      case 'out-of-stock':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
            <XCircle size={14} />
            Out of Stock
          </span>
        );
    }
  };

  const lowStockCount = inventory.filter(item => getStockStatus(item.quantity) === 'low-stock').length;
  const outOfStockCount = inventory.filter(item => getStockStatus(item.quantity) === 'out-of-stock').length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="text-blue-600" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Master Inventory</h1>
                <p className="text-gray-600">Centralized stock management system</p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-gray-600 text-sm mb-1">Total Items</p>
            <p className="text-3xl font-bold text-gray-900">{inventory.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-gray-600 text-sm mb-1">Low Stock</p>
            <p className="text-3xl font-bold text-yellow-600">{lowStockCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-gray-600 text-sm mb-1">Out of Stock</p>
            <p className="text-3xl font-bold text-red-600">{outOfStockCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-gray-600 text-sm mb-1">Total Value</p>
            <p className="text-3xl font-bold text-blue-600">{totalValue.toFixed(0)} ብር</p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Add Button (Admin Only) */}
            {canEdit && (
              <button
                onClick={openAddModal}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Add Item
              </button>
            )}
          </div>
        </div>

        {/* Access Info for View-Only Users */}
        {!canEdit && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-700">
              <strong>View-Only Access:</strong> You can view stock levels but cannot modify inventory. Contact an administrator to make changes.
            </p>
          </div>
        )}

        {/* Category Summary Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Category Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categorySummaries.map(summary => (
              <div key={summary.category} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{summary.category}</h4>
                  <Package className="text-blue-600" size={20} />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-semibold text-gray-900">{summary.totalItems}</span>
                  </div>
                  {summary.inStock > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-600">In Stock:</span>
                      <span className="font-semibold text-green-600">{summary.inStock}</span>
                    </div>
                  )}
                  {summary.lowStock > 0 && (
                    <div className="flex justify-between">
                      <span className="text-yellow-600">Low Stock:</span>
                      <span className="font-semibold text-yellow-600">{summary.lowStock}</span>
                    </div>
                  )}
                  {summary.outOfStock > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-600">Out of Stock:</span>
                      <span className="font-semibold text-red-600">{summary.outOfStock}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-bold text-blue-600">{summary.totalValue.toFixed(0)} ብር</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grouped Inventory Tables */}
        {Object.keys(groupedInventory).length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600 text-lg font-semibold mb-2">No items found</p>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedInventory).sort().map(category => (
              <div key={category} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                      {category}
                    </h3>
                    <div className="flex items-center gap-4 text-white text-sm">
                      <span>{groupedInventory[category].length} items</span>
                      <span>•</span>
                      <span>
                        {groupedInventory[category].reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(0)} ብር
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Item Name</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Unit Price</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total Value</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                        {canEdit && (
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {groupedInventory[category].map((item, index) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-600">{item.nameAmharic}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-semibold text-gray-900">{item.quantity} {item.unit}</div>
                            <div className="text-xs text-gray-500">Min: {item.lowStockThreshold}</div>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">
                            {item.unitPrice} ብር
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-blue-600">
                            {(item.quantity * item.unitPrice).toFixed(0)} ብር
                          </td>
                          <td className="px-6 py-4 text-center">
                            {getStatusBadge(item.quantity)}
                          </td>
                          {canEdit && (
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(item)}
                                  className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Add New Item</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Coffee Beans"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amharic Name
                  </label>
                  <input
                    type="text"
                    value={formData.nameAmharic}
                    onChange={(e) => setFormData({ ...formData, nameAmharic: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ቡና"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., kg, liters, pieces"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price (ብር)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Add Item
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Edit Item</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amharic Name
                  </label>
                  <input
                    type="text"
                    value={formData.nameAmharic}
                    onChange={(e) => setFormData({ ...formData, nameAmharic: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price (ብር)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEdit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete Item?</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <strong>{selectedItem.name}</strong>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </main>
  );
}
