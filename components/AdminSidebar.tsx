'use client';

import { Coffee, Package, TrendingUp, Menu, X, Users } from 'lucide-react';
import { useState } from 'react';

interface AdminSidebarProps {
  activeSection: 'menu' | 'inventory' | 'reports' | 'employees';
  onSectionChange: (section: 'menu' | 'inventory' | 'reports' | 'employees') => void;
  userRole: 'admin' | 'super-admin' | 'cashier' | 'waiter';
}

export default function AdminSidebar({ activeSection, onSectionChange, userRole }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { id: 'menu' as const, label: 'Menu Manager', icon: Coffee, roles: ['admin', 'super-admin'] },
    { id: 'inventory' as const, label: 'Inventory', icon: Package, roles: ['admin', 'super-admin'] },
    { id: 'employees' as const, label: 'Staff Management', icon: Users, roles: ['super-admin'] },
    { id: 'reports' as const, label: 'Financial Reports', icon: TrendingUp, roles: ['super-admin'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-gray-900 text-white w-64 transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-serif mb-1">ከነአን</h1>
          <p className="text-sm text-gray-400">Admin Dashboard</p>
          <div className="mt-3 inline-block bg-gold/20 text-gold px-3 py-1 rounded-full text-xs font-semibold">
            {userRole === 'super-admin' ? 'Super Admin' : 'Admin'}
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onSectionChange(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gold text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 text-center">
            © 2024 ከነአን Café
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  );
}
