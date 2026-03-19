'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const PROTECTED_ROUTES = ['/dashboard', '/attempts', '/profile', '/simulations', '/admin'];
const AUTH_ROUTES = ['/login', '/register'];

function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if (!isAuthenticated && isProtected) {
      router.replace('/login');
    } else if (isAuthenticated && isAuthRoute) {
      router.replace(user?.role === 'ADMIN' ? '/admin' : '/dashboard');
    }
    
  }, [isAuthenticated, isLoading, pathname, router, user]);

  if (isLoading && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    return <div className="min-h-screen bg-slate-950 text-slate-300 grid place-items-center"><p className="text-sm text-cyan-400">Loading...</p></div>;
  }

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RouteGuard>{children}</RouteGuard>
    </AuthProvider>
  );
}
