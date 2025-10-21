import { type ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = '/' }: AuthGuardProps) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    return null;
  }

  return <>{children}</>;
}
