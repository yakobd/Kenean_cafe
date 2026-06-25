'use client';

import { User, Heart, Settings, LogOut, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const menuItems = [
    { icon: User, label: 'Account Details', href: '#' },
    { icon: Heart, label: 'Favorites', href: '#' },
    { icon: Settings, label: 'Settings', href: '#' },
  ];

  return (
    <main className="min-h-screen pb-24 bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-charcoal/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center mb-4">
              <User className="text-gold" size={48} />
            </div>
            <h1 className="text-2xl font-semibold text-charcoal mb-1">
              Guest User
            </h1>
            <p className="text-sm text-charcoal/60">guest@kenaan.cafe</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className="w-full flex items-center justify-between p-5 hover:bg-cream/50 transition-colors border-b border-charcoal/5 last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <Icon className="text-gold" size={24} />
                  <span className="font-medium text-charcoal">{item.label}</span>
                </div>
                <ChevronRight className="text-charcoal/30" size={20} />
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <button className="w-full mt-6 bg-white border-2 border-red-500 text-red-500 py-4 rounded-full font-semibold text-lg hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-3">
          <LogOut size={20} />
          Logout
        </button>

        {/* App Info */}
        <div className="text-center mt-8 text-sm text-charcoal/40">
          <p>ከነአን Café v1.0</p>
          <p className="mt-1">Made with ❤️ in Ethiopia</p>
        </div>
      </div>
    </main>
  );
}
