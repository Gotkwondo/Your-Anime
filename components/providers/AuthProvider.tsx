'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { initializeDemoAccounts } from '@/lib/mock/users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize demo accounts
    initializeDemoAccounts();
    // Initialize auth state
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
