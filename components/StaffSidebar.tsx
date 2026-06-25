'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import {
  LayoutDashboard,
  History,
  UtensilsCrossed,
  Package,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Menu as MenuIcon,
  X,
  MessageCircle,
  Zap,
  Warehouse,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import NotificationBell from './NotificationBell';

type LinkNavItem = {
  type: 'link';
  href: string;
  icon: LucideIcon;
  label: string;
};

type SectionNavItem = {
  type: 'section';
  section: string;
  icon: LucideIcon;
  label: string;
};

type NavItem = LinkNavItem | SectionNavItem;

export default function StaffSidebar() {
  const { role, setRole } = useRole();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get current section from URL params
  const currentSection = searchParams.get('section') || 'menu';

  // Role-specific navigation items
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'waiter':
        return [
          { href: '/dashboard/waiter', icon: LayoutDashboard, label: 'Dashboard', type: 'link' },
          { href: '/dashboard/quick-sale', icon: Zap, label: 'Quick Sale', type: 'link' },
          { href: '/dashboard/inventory', icon: Warehouse, label: 'Inventory', type: 'link' },
          { href: '/dashboard/waiter/logs', icon: History, label: 'Order Logs', type: 'link' },
          { href: '/dashboard/waiter/feedback', icon: MessageCircle, label: 'Feedback', type: 'link' },
        ];
      case 'cashier':
        return [
          { href: '/dashboard/cashier', icon: LayoutDashboard, label: 'Dashboard', type: 'link' },
          { href: '/dashboard/quick-sale', icon: Zap, label: 'Quick Sale', type: 'link' },
          { href: '/dashboard/inventory', icon: Warehouse, label: 'Inventory', type: 'link' },
          { href: '/dashboard/cashier/reports', icon: TrendingUp, label: 'Financial Reports', type: 'link' },
          { href: '/dashboard/cashier/logs', icon: History, label: 'Order Logs', type: 'link' },
          { href: '/dashboard/cashier/feedback', icon: MessageCircle, label: 'Feedback', type: 'link' },
        ];
      case 'admin':
        return [
          { section: 'menu', icon: UtensilsCrossed, label: 'Menu Manager', type: 'section' },
          { section: 'categories', icon: Package, label: 'Categories', type: 'section' },
          { section: 'inventory', icon: Package, label: 'Inventory', type: 'section' },
          { section: 'expenses', icon: TrendingUp, label: 'Expenses', type: 'section' },
          { section: 'feedback', icon: MessageCircle, label: 'Feedback', type: 'section' },
          { section: 'staff-monitoring', icon: Users, label: 'Staff Monitoring', type: 'section' },
          { href: '/dashboard/quick-sale', icon: Zap, label: 'Quick Sale', type: 'link' },
          { href: '/dashboard/inventory', icon: Warehouse, label: 'Master Inventory', type: 'link' },
        ];
      case 'super-admin':
        return [
          { section: 'menu', icon: UtensilsCrossed, label: 'Menu Manager', type: 'section' },
          { section: 'categories', icon: Package, label: 'Categories', type: 'section' },
          { section: 'inventory', icon: Package, label: 'Inventory', type: 'section' },
          { section: 'expenses', icon: TrendingUp, label: 'Expenses', type: 'section' },
          { section: 'employees', icon: Users, label: 'Staff Management', type: 'section' },
          { section: 'reports', icon: TrendingUp, label: 'Financial Reports', type: 'section' },
          { section: 'feedback', icon: MessageCircle, label: 'Feedback', type: 'section' },
          { section: 'staff-monitoring', icon: Users, label: 'Staff Monitoring', type: 'section' },
          { href: '/dashboard/quick-sale', icon: Zap, label: 'Quick Sale', type: 'link' },
          { href: '/dashboard/inventory', icon: Warehouse, label: 'Master Inventory', type: 'link' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    // Clear role and redirect to customer home
    setRole('customer');
    window.location.href = '/';
  };

  const handleSectionClick = (section: string) => {
    const basePath = role === 'admin' ? '/dashboard/admin' : '/dashboard/super-admin';
    router.push(`${basePath}?section=${section}`);
    setIsMobileOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className={`p-6 border-b border-gray-700 ${isCollapsed ? 'px-4' : ''}`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-serif text-white mb-1">ከነአን</h1>
              <p className="text-xs text-gray-400">Staff Portal</p>
            </div>
          )}
          {isCollapsed && (
            <div className="text-xl font-serif text-white mx-auto">ከ</div>
          )}
        </div>
        {/* Notification Bell */}
        {!isCollapsed && (
          <div className="mt-4 flex justify-center">
            <NotificationBell theme="dark" />
          </div>
        )}
      </div>

      {/* Role Badge */}
      <div className={`px-6 py-4 ${isCollapsed ? 'px-4' : ''}`}>
        <div className={`bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 ${isCollapsed ? 'p-2' : ''}`}>
          {!isCollapsed ? (
            <>
              <p className="text-xs text-blue-400 mb-1">Current Role</p>
              <p className="text-sm font-semibold text-white capitalize">{role.replace('-', ' ')}</p>
            </>
          ) : (
            <User className="text-blue-400 mx-auto" size={20} />
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            
            // For link-based navigation (waiter, cashier)
            if (item.type === 'link') {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={`${item.href}-${index}`}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            }
            
            // For section-based navigation (admin, super-admin)
            if (item.type === 'section') {
              const isActive = currentSection === item.section;
              
              return (
                <button
                  key={`${item.section}-${index}`}
                  onClick={() => handleSectionClick(item.section)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </button>
              );
            }
            
            return null;
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className={`border-t border-gray-700 p-4 ${isCollapsed ? 'px-2' : ''}`}>
        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden lg:flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors mb-2 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          {isCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <>
              <ChevronLeft size={20} />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-3 bg-gray-800 text-white rounded-lg shadow-lg"
      >
        <MenuIcon size={24} />
      </button>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-gray-800 z-50 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
