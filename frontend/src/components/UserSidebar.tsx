'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';

export default function UserSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 p-3 rounded transition ${active
      ? 'bg-slate-800 text-cyan-400 border-l-2 border-cyan-400'
      : 'hover:bg-slate-800'
    }`;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-slate-900 border-r border-slate-800 flex flex-col p-6 z-20 shrink-0 overflow-y-auto">
      <div className="mb-10">
        <h1 className="text-cyan-400 text-xl font-bold tracking-tighter uppercase italic">
          Break_Point<span className="animate-pulse">_</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        <Link
          href="/dashboard"
          className={navItemClass(pathname === '/dashboard')}
        >
          <span>[■]</span> Dashboard
        </Link>
        <Link
          href="/simulations"
          className={navItemClass(pathname.startsWith('/simulations'))}
        >
          <span>[::]</span> All Labs
        </Link>
        <Link
          href="/attempts"
          className={navItemClass(pathname.startsWith('/attempts'))}
        >
          <span>[📋]</span> Attempts
        </Link>
        <Link
          href="/profile"
          className={navItemClass(pathname.startsWith('/profile'))}
        >
          <span>[👤]</span> Profile
        </Link>
        <Link
          href="/leaderboard"
          className={navItemClass(pathname.startsWith('/leaderboard'))}
        >
          <span>[▲]</span> Leaderboard
        </Link>
        <Link
          href="/documentation"
          className={navItemClass(pathname.startsWith('/documentation'))}
        >
          <span>[?]</span> Documentation
        </Link>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="text-xs text-slate-500 mb-2 uppercase">Current User</div>
        <div className="font-bold text-slate-200">{user?.name ?? 'Guest'}</div>
        <div className="text-xs text-slate-500 mt-2">Role: {user?.role ?? 'N/A'}</div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 w-full bg-slate-950 border border-slate-700 hover:border-cyan-400 text-slate-300 text-xs py-2 rounded uppercase transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
