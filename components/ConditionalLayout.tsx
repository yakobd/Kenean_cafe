'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useRole } from '@/context/RoleContext';
import BottomNav from './BottomNav';
import StaffSidebar from './StaffSidebar';
import { ReactNode } from 'react';

interface ConditionalLayoutProps {
  children: ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { role, setRole } = useRole();
  const pathname = usePathname();

  // Auto-detect role from route
  useEffect(() => {
    if (pathname.startsWith('/dashboard/waiter')) {
      if (role !== 'waiter') setRole('waiter');
    } else if (pathname.startsWith('/dashboard/cashier')) {
      if (role !== 'cashier') setRole('cashier');
    } else if (pathname.startsWith('/dashboard/super-admin')) {
      if (role !== 'super-admin') setRole('super-admin');
    } else if (pathname.startsWith('/dashboard/admin')) {
      if (role !== 'admin') setRole('admin');
    } else if (!pathname.startsWith('/dashboard')) {
      if (role !== 'customer') setRole('customer');
    }
  }, [pathname, role, setRole]);

  // Check if current route is a staff dashboard
  const isStaffRoute = pathname.startsWith('/dashboard');

  return (
    <>
      {isStaffRoute ? (
        // Staff Layout with Sidebar
        <div className="flex h-screen overflow-hidden">
          <StaffSidebar />
          <main className="flex-1 overflow-y-auto bg-gray-900">
            {children}
          </main>
        </div>
      ) : (
        // Customer Layout with Bottom Nav
        <>
          {children}
          <BottomNav />
        </>
      )}
    </>
  );
}
