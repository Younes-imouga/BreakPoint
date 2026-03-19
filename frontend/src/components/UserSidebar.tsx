'use client';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';

export default function UserSidebar() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6 z-20 shrink-0">
      <div className="mb-10">
        <h1 className="text-cyan-400 text-xl font-bold tracking-tighter uppercase italic">
          Break_Point<span className="animate-pulse">_</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        <a
          href="/dashboard"
          className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded transition"
        >
          <span>[■]</span> Dashboard
        </a>
        <a
          href="/simulations"
          className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded transition"
        >
          <span>[::]</span> All Labs
        </a>
        <a
          href="/attempts"
          className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded transition"
        >
          <span>[📋]</span> Attempts
        </a>
        <a
          href="/profile"
          className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded transition"
        >
          <span>[👤]</span> Profile
        </a>
        <a
          href="#"
          className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded transition"
        >
          <span>[▲]</span> Leaderboard
        </a>
        <a
          href="#"
          className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded transition"
        >
          <span>[?]</span> Documentation
        </a>
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
