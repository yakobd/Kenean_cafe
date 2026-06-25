'use client';

import { MenuItem } from '@/types/menu';
import { Plus } from 'lucide-react';
import Image from 'next/image';

interface MenuGridProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}

export default function MenuGrid({ items, onAddToCart }: MenuGridProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
            style={{
              animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
            }}
          >
            <div className="relative h-48 overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold text-charcoal mb-1">
                {item.name}
              </h3>
              <p className="text-sm text-charcoal/60 mb-4">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gold">
                  {item.price} ብር
                </span>
                <button
                  onClick={() => onAddToCart(item)}
                  className="bg-gold text-white p-3 rounded-full hover:bg-gold/90 transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
