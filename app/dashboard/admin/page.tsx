'use client';

import { useSearchParams } from 'next/navigation';
import MenuManager from '@/components/admin/MenuManager';
import CategoryManager from '@/components/admin/CategoryManager';
import InventoryManager from '@/components/admin/InventoryManager';
import ExpenseManager from '@/components/admin/ExpenseManager';
import FeedbackManager from '@/components/admin/FeedbackManager';
import StaffMonitoring from '@/components/admin/StaffMonitoring';

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const activeSection = searchParams.get('section') || 'menu';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeSection === 'menu' && <MenuManager />}
        {activeSection === 'categories' && <CategoryManager />}
        {activeSection === 'inventory' && <InventoryManager />}
        {activeSection === 'expenses' && <ExpenseManager />}
        {activeSection === 'feedback' && <FeedbackManager />}
        {activeSection === 'staff-monitoring' && <StaffMonitoring />}
      </div>
    </div>
  );
}
