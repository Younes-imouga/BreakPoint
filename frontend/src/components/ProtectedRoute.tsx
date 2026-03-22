'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import type { Role } from '@/lib/api/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: Role;
}

export default function ProtectedRoute({
  children,
  requireRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (requireRole && user?.role !== requireRole) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, requireRole, router, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 grid place-items-center">
        <p className="text-sm text-cyan-400">Checking authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireRole && user?.role !== requireRole) {
    return null;
  }

  return <>{children}</>;
}
