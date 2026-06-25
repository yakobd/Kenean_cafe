'use client';

import NotificationBell from './NotificationBell';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-charcoal/10">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-serif text-charcoal tracking-wide">
              ከነአን
            </h1>
            <p className="text-sm text-charcoal/60 mt-1 tracking-widest uppercase">
              Café
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            <NotificationBell theme="light" />
          </div>
        </div>
      </div>
    </header>
  );
}
