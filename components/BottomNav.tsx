'use client';

import { Home, Menu, ClipboardList, User, History } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { hasNotification } = useApp();

  const navItems = [
    { href: '/home', icon: Home, label: 'Home' },
    { href: '/', icon: Menu, label: 'Menu' },
    { href: '/orders', icon: ClipboardList, label: 'Orders', hasNotification },
    { href: '/history', icon: History, label: 'History' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-charcoal/10 z-50 safe-area-bottom">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-1 min-w-[60px]"
              >
                <div className="relative">
                  <Icon
                    size={24}
                    className={`transition-colors ${
                      isActive ? 'text-gold' : 'text-charcoal/60'
                    }`}
                  />
                  {item.hasNotification && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span
                  className={`text-xs transition-colors ${
                    isActive ? 'text-gold font-semibold' : 'text-charcoal/60'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
