import { User } from '@/types/user';

// Demo accounts for testing
export const DEMO_ACCOUNTS = [
  {
    email: 'demo@animesommelier.com',
    password: 'demo1234',
    user: {
      id: 'user-demo-1',
      email: 'demo@animesommelier.com',
      displayName: 'Demo User',
      createdAt: new Date('2024-01-01'),
    } as User,
  },
  {
    email: 'test@test.com',
    password: 'test1234',
    user: {
      id: 'user-test-1',
      email: 'test@test.com',
      displayName: 'Test User',
      createdAt: new Date('2024-01-01'),
    } as User,
  },
];

// Initialize demo accounts in localStorage
export function initializeDemoAccounts() {
  if (typeof window === 'undefined') return;

  DEMO_ACCOUNTS.forEach(({ email, password, user }) => {
    // Only initialize if not already exists
    if (!localStorage.getItem(`user-${email}`)) {
      localStorage.setItem(`user-${email}`, JSON.stringify(user));
      localStorage.setItem(`password-${email}`, password);
    }
  });
}
