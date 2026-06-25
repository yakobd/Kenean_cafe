'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'customer' | 'waiter' | 'cashier' | 'admin' | 'super-admin';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isStaff: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('customer');

  useEffect(() => {
    // Load role from localStorage (in production, from auth)
    const savedRole = localStorage.getItem('user-role') as UserRole;
    if (savedRole) {
      setRoleState(savedRole);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('user-role', newRole);
  };

  const isStaff = role !== 'customer';

  return (
    <RoleContext.Provider value={{ role, setRole, isStaff }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
