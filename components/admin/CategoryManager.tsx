'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, AlertTriangle, FolderOpen } from 'lucide-react';
import { Category, CategoryWithCount } from '@/types/category';
import { MenuItemAdmin } from '@/types/admin';
import Toast from '@/components/Toast';

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemAdmin[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteAction, setDeleteAction] = useState<'move' | 'delete'>('move');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    nameAmharic: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load categories
    const storedCategories = localStorage.getItem('cafe-categories');
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      // Initialize with default categories
      const defaultCategories: Category[] = [
        {
          id: 'cat-1',
          name: 'Coffee',
          nameAmharic: 'ቡና',
          description: 'Hot and cold coffee beverages',
          order: 1,
          createdAt: new Date(),
        },
        {
          id: 'cat-2',
          name: 'Breakfast',
          nameAmharic: 'ቁርስ',
          description: 'Morning meals and dishes',
          order: 2,
          createdAt: new Date(),
        },
        {
          id: 'cat-3',
          name: 'Pastry',
          nameAmharic: 'ኬክ',
          description: 'Baked goods and desserts',
          order: 3,
          createdAt: new Date(),
        },
        {
          id: 'cat-uncategorized',
          name: 'Uncategorized',
          nameAmharic: 'ያልተመደበ',
          description: 'Items without a category',
          order: 999,
          createdAt: new Date(),
        },
      ];
      setCategories(defaultCategories);
      localStorage.setItem('cafe-categories', JSON.stringify(defaultCategories));
    }

    // Load menu items
    const storedItems = localStorage.getItem('cafe-menu-items');
    if (storedItems) {
      setMenuItems(JSON.parse(storedItems));
    }
  };

  const saveCategories = (cats: Category[]) => {
    setCategories(cats);
    localStorage.setItem('cafe-categories', JSON.stringify(cats));
  };

  const getCategoriesWithCount = (): CategoryWithCount[] => {
    return categories.map(cat => ({
      ...cat,
      itemCount: menuItems.filter(item => item.category === cat.name).length,
    }));
  };

  const handleAdd = () => {
    setIsEditing(true);
    setEditingCategory(null);
    setFormData({
      name: '',
      nameAmharic: '',
      description: '',
    });
  };

  const handleEdit = (category: Category) => {
    // Prevent editing Uncategorized
    if (category.id === 'cat-uncategorized') {
      showToastMessage('Cannot edit the Uncategorized category', 'warning');
      return;
    }

    setIsEditing(true);
    setEditingCategory(category);
    setFormData({
      name: category.name,
      nameAmharic: category.nameAmharic,
      description: category.description || '',
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      showToastMessage('Category name is required', 'error');
      return;
    }

    // Check for duplicate names
    const isDuplicate = categories.some(
      cat => cat.name.toLowerCase() === formData.name.toLowerCase() && 
      cat.id !== editingCategory?.id
    );

    if (isDuplicate) {
      showToastMessage('A category with this name already exists', 'error');
      return;
    }

    const newCategory: Category = {
      id: editingCategory?.id || `cat-${Date.now()}`,
      name: formData.name.trim(),
      nameAmharic: formData.nameAmharic.trim() || formData.name.trim(),
      description: formData.description.trim(),
      order: editingCategory?.order || categories.length + 1,
      createdAt: editingCategory?.createdAt || new Date(),
    };

    let updatedCategories;
    if (editingCategory) {
      // Update existing category
      updatedCategories = categories.map(cat => 
        cat.id === editingCategory.id ? newCategory : cat
      );

      // Update menu items with new category name if it changed
      if (editingCategory.name !== newCategory.name) {
        const updatedItems = menuItems.map(item =>
          item.category === editingCategory.name
            ? { ...item, category: newCategory.name }
            : item
        );
        setMenuItems(updatedItems);
        localStorage.setItem('cafe-menu-items', JSON.stringify(updatedItems));
      }

      showToastMessage('Category updated successfully', 'success');
    } else {
      // Add new category
      updatedCategories = [...categories, newCategory];
      showToastMessage('Category added successfully', 'success');
    }

    saveCategories(updatedCategories);
    setIsEditing(false);
    setEditingCategory(null);
  };

  const handleDeleteClick = (category: Category) => {
    // Prevent deleting Uncategorized
    if (category.id === 'cat-uncategorized') {
      showToastMessage('Cannot delete the Uncategorized category', 'warning');
      return;
    }

    const itemCount = menuItems.filter(item => item.category === category.name).length;
    
    if (itemCount > 0) {
      // Show modal for categories with items
      setCategoryToDelete(category);
      setShowDeleteModal(true);
    } else {
      // Delete immediately if no items
      confirmDelete(category, 'move');
    }
  };

  const confirmDelete = (category: Category, action: 'move' | 'delete') => {
    const itemsInCategory = menuItems.filter(item => item.category === category.name);

    if (action === 'move') {
      // Move items to Uncategorized
      const updatedItems = menuItems.map(item =>
        item.category === category.name
          ? { ...item, category: 'Uncategorized' }
          : item
      );
      setMenuItems(updatedItems);
      localStorage.setItem('cafe-menu-items', JSON.stringify(updatedItems));
      showToastMessage(`${itemsInCategory.length} items moved to Uncategorized`, 'info');
    } else {
      // Delete items
      const updatedItems = menuItems.filter(item => item.category !== category.name);
      setMenuItems(updatedItems);
      localStorage.setItem('cafe-menu-items', JSON.stringify(updatedItems));
      showToastMessage(`${itemsInCategory.length} items deleted`, 'warning');
    }

    // Delete category
    const updatedCategories = categories.filter(cat => cat.id !== category.id);
    saveCategories(updatedCategories);
    showToastMessage('Category deleted successfully', 'success');
    
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const categoriesWithCount = getCategoriesWithCount().sort((a, b) => a.order - b.order);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Category Manager</h1>
            <p className="text-gray-600 mt-1">Organize your menu into categories</p>
          </div>
          {!isEditing && (
            <button
              onClick={handleAdd}
              className="bg-gold hover:bg-gold/90 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add Category
            </button>
          )}
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="bg-white rounded-xl border-2 border-gold p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Lunch, Drinks, Desserts"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name (Amharic)
                </label>
                <input
                  type="text"
                  value={formData.nameAmharic}
                  onChange={(e) => setFormData({ ...formData, nameAmharic: e.target.value })}
                  placeholder="e.g., ምሳ, መጠጥ, ጣፋጭ"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description of this category"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-gold hover:bg-gold/90 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={20} />
                Save Category
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

        {/* Categories Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Amharic Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Description
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Items
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categoriesWithCount.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="text-gold" size={20} />
                      <span className="font-semibold text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {category.nameAmharic}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      category.itemCount > 0
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        disabled={category.id === 'cat-uncategorized'}
                        className={`p-2 rounded-lg transition-colors ${
                          category.id === 'cat-uncategorized'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                        title={category.id === 'cat-uncategorized' ? 'Cannot edit Uncategorized' : 'Edit category'}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category)}
                        disabled={category.id === 'cat-uncategorized'}
                        className={`p-2 rounded-lg transition-colors ${
                          category.id === 'cat-uncategorized'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        title={category.id === 'cat-uncategorized' ? 'Cannot delete Uncategorized' : 'Delete category'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertTriangle className="text-blue-600 flex-shrink-0" size={20} />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Category Management Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Categories help organize your menu for customers</li>
                <li>The "Uncategorized" category cannot be edited or deleted</li>
                <li>When deleting a category with items, you can move them to Uncategorized or delete them</li>
                <li>Category names must be unique</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Category</h2>
            </div>

            <p className="text-gray-700 mb-4">
              The category <span className="font-bold">"{categoryToDelete.name}"</span> contains{' '}
              <span className="font-bold">
                {menuItems.filter(item => item.category === categoryToDelete.name).length} items
              </span>.
            </p>

            <p className="text-gray-700 mb-6">
              What would you like to do with these items?
            </p>

            <div className="space-y-3 mb-6">
              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                <input
                  type="radio"
                  name="deleteAction"
                  value="move"
                  checked={deleteAction === 'move'}
                  onChange={() => setDeleteAction('move')}
                  className="mt-1 w-5 h-5 text-gold focus:ring-gold"
                />
                <div>
                  <p className="font-semibold text-gray-900">Move to Uncategorized</p>
                  <p className="text-sm text-gray-600">Items will be preserved and moved to the Uncategorized category</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                <input
                  type="radio"
                  name="deleteAction"
                  value="delete"
                  checked={deleteAction === 'delete'}
                  onChange={() => setDeleteAction('delete')}
                  className="mt-1 w-5 h-5 text-red-600 focus:ring-red-600"
                />
                <div>
                  <p className="font-semibold text-gray-900">Delete All Items</p>
                  <p className="text-sm text-gray-600">All items in this category will be permanently deleted</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => confirmDelete(categoryToDelete, deleteAction)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCategoryToDelete(null);
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
