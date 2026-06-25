'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { MenuItemAdmin } from '@/types/admin';
import { menuItems as initialMenuItems } from '@/data/menu';
import Toast from '@/components/Toast';

export default function MenuManager() {
  const [menuItems, setMenuItems] = useState<MenuItemAdmin[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemAdmin | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    nameAmharic: '',
    description: '',
    price: '',
    category: '',
    image: '',
    inStock: true,
  });

  useEffect(() => {
    // Load menu items from localStorage or use initial data
    const stored = localStorage.getItem('cafe-menu-items');
    if (stored) {
      setMenuItems(JSON.parse(stored));
    } else {
      const adminItems: MenuItemAdmin[] = initialMenuItems.map(item => ({
        ...item,
        nameAmharic: item.name,
        inStock: true,
      }));
      setMenuItems(adminItems);
      localStorage.setItem('cafe-menu-items', JSON.stringify(adminItems));
    }

    // Load categories
    const storedCategories = localStorage.getItem('cafe-categories');
    if (storedCategories) {
      const cats = JSON.parse(storedCategories);
      setCategories(cats.map((c: any) => c.name));
    } else {
      setCategories(['Coffee', 'Breakfast', 'Pastry', 'Uncategorized']);
    }
  }, []);

  const saveMenuItems = (items: MenuItemAdmin[]) => {
    setMenuItems(items);
    localStorage.setItem('cafe-menu-items', JSON.stringify(items));
  };

  const handleAdd = () => {
    setIsEditing(true);
    setEditingItem(null);
    setFormData({
      name: '',
      nameAmharic: '',
      description: '',
      price: '',
      category: categories[0] || 'Uncategorized',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
      inStock: true,
    });
  };

  const handleEdit = (item: MenuItemAdmin) => {
    setIsEditing(true);
    setEditingItem(item);
    setFormData({
      name: item.name,
      nameAmharic: item.nameAmharic,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      inStock: item.inStock,
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      setToastMessage('Please fill in required fields');
      setShowToast(true);
      return;
    }

    const newItem: MenuItemAdmin = {
      id: editingItem?.id || `item-${Date.now()}`,
      name: formData.name,
      nameAmharic: formData.nameAmharic || formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image,
      inStock: formData.inStock,
    };

    let updatedItems;
    if (editingItem) {
      updatedItems = menuItems.map(item => item.id === editingItem.id ? newItem : item);
      setToastMessage('Menu item updated successfully');
    } else {
      updatedItems = [...menuItems, newItem];
      setToastMessage('Menu item added successfully');
    }

    saveMenuItems(updatedItems);
    setIsEditing(false);
    setEditingItem(null);
    setShowToast(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const updatedItems = menuItems.filter(item => item.id !== id);
      saveMenuItems(updatedItems);
      setToastMessage('Menu item deleted');
      setShowToast(true);
    }
  };

  const toggleStock = (id: string) => {
    const updatedItems = menuItems.map(item =>
      item.id === id ? { ...item, inStock: !item.inStock } : item
    );
    saveMenuItems(updatedItems);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu Manager</h1>
            <p className="text-gray-600 mt-1">Manage your café menu items</p>
          </div>
          {!isEditing && (
            <button
              onClick={handleAdd}
              className="bg-gold hover:bg-gold/90 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add Item
            </button>
          )}
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="bg-white rounded-xl border-2 border-gold p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Amharic)
                </label>
                <input
                  type="text"
                  value={formData.nameAmharic}
                  onChange={(e) => setFormData({ ...formData, nameAmharic: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (ብር) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  {categories.length === 0 ? (
                    <option value="Uncategorized">Uncategorized</option>
                  ) : (
                    categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  )}
                </select>
                {categories.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    No categories available. Create categories in Category Manager.
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-5 h-5 text-gold focus:ring-gold border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">In Stock</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-gold hover:bg-gold/90 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={20} />
                Save Item
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border-2 overflow-hidden shadow-sm transition-all ${
                item.inStock ? 'border-gray-200' : 'border-red-300 opacity-75'
              }`}
            >
              <div className="relative h-48">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                      OUT OF STOCK
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {item.name}
                </h3>
                {item.nameAmharic !== item.name && (
                  <p className="text-sm text-gray-600 mb-2">{item.nameAmharic}</p>
                )}
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-gold">{item.price} ብር</span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {item.category}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStock(item.id)}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                      item.inStock
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
