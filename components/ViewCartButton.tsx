'use client';

import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ViewCartButtonProps {
  itemCount: number;
}

export default function ViewCartButton({ itemCount }: ViewCartButtonProps) {
  const pathname = usePathname();
  
  // Hide on cart page and dashboard pages
  if (pathname === '/cart' || pathname.startsWith('/dashboard')) {
    return null;
  }

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <Link
        href="/cart"
        className="bg-charcoal text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-charcoal/90 transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <ShoppingBag size={20} />
        <span className="font-semibold">View Cart</span>
        <span className="bg-gold text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
          {itemCount}
        </span>
      </Link>
    </div>
  );
}
