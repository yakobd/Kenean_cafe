'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import MenuGrid from '@/components/MenuGrid';
import ViewCartButton from '@/components/ViewCartButton';
import Toast from '@/components/Toast';
import { MenuItem } from '@/types/menu';
import { useApp } from '@/context/AppContext';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [showToast, setShowToast] = useState(false);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { cartItems, addToCart } = useApp();

  useEffect(() => {
    // Load categories from localStorage
    const storedCategories = localStorage.getItem('cafe-categories');
    if (storedCategories) {
      const cats = JSON.parse(storedCategories);
      const categoryNames = cats
        .filter((c: any) => c.name !== 'Uncategorized')
        .sort((a: any, b: any) => a.order - b.order)
        .map((c: any) => c.name);
      setCategories(['All', ...categoryNames]);
    } else {
      setCategories(['All', 'Coffee', 'Breakfast', 'Pastry']);
    }

    // Load menu items from localStorage
    const storedItems = localStorage.getItem('cafe-menu-items');
    if (storedItems) {
      const items = JSON.parse(storedItems);
      // Filter out items that are out of stock
      setMenuItems(items.filter((item: any) => item.inStock));
    } else {
      // Fallback to initial menu items
      const { menuItems: initialItems } = require('@/data/menu');
      setMenuItems(initialItems);
    }
  }, []);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return menuItems;
    return menuItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, menuItems]);

  // Group items by category for "All" view
  const itemsByCategory = useMemo(() => {
    if (activeCategory !== 'All') return null;
    
    const grouped: { [key: string]: MenuItem[] } = {};
    categories.slice(1).forEach(cat => {
      const items = menuItems.filter(item => item.category === cat);
      if (items.length > 0) {
        grouped[cat] = items;
      }
    });
    return grouped;
  }, [menuItems, categories, activeCategory]);

  const handleAddToCart = (item: MenuItem) => {
    addToCart({ ...item, quantity: 1 });
    setShowToast(true);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    
    // Scroll to category section if in "All" view
    if (category !== 'All' && categoryRefs.current[category]) {
      const element = categoryRefs.current[category];
      if (element) {
        const offset = 180; // Account for header and category filter
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen pb-24">
      <Header />
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      {activeCategory === 'All' && itemsByCategory ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {Object.entries(itemsByCategory).map(([category, items]) => (
            <div
              key={category}
              ref={(el) => { categoryRefs.current[category] = el; }}
              className="mb-12"
            >
              <div className="mb-6">
                <h2 className="text-3xl font-serif text-charcoal mb-2">{category}</h2>
                <div className="w-16 h-1 bg-gold" />
              </div>
              <MenuGrid items={items} onAddToCart={handleAddToCart} />
            </div>
          ))}
        </div>
      ) : (
        <MenuGrid items={filteredItems} onAddToCart={handleAddToCart} />
      )}

      <ViewCartButton itemCount={totalItems} />

      <Toast
        message="Item added to cart! 🛒"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </main>
  );
}
