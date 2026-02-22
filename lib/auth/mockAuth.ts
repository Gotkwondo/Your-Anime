import { User } from '@/types/user';

const AUTH_STORAGE_KEY = 'anime-sommelier-auth';

export const mockAuth = {
  // Sign up
  signUp: async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user already exists
    const existingUser = localStorage.getItem(`user-${email}`);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create new user
    const user: User = {
      id: `user-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      createdAt: new Date(),
    };

    // Store user data
    localStorage.setItem(`user-${email}`, JSON.stringify(user));
    localStorage.setItem(`password-${email}`, password);

    // Set current session
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    return user;
  },

  // Sign in
  signIn: async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user exists
    const userStr = localStorage.getItem(`user-${email}`);
    if (!userStr) {
      throw new Error('User not found');
    }

    // Check password
    const storedPassword = localStorage.getItem(`password-${email}`);
    if (storedPassword !== password) {
      throw new Error('Invalid password');
    }

    const user: User = JSON.parse(userStr);

    // Set current session
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    return user;
  },

  // Sign out
  signOut: async (): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);
      return {
        ...user,
        createdAt: new Date(user.createdAt),
      };
    } catch {
      return null;
    }
  },

  // Check if authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_STORAGE_KEY);
  },
};
