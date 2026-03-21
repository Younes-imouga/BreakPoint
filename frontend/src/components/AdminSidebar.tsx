'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import AdminControlButtons from './AdminControlButtons';

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 p-3 rounded transition ${active
      ? 'bg-slate-800 text-red-400 border-l-2 border-red-400'
      : 'hover:bg-slate-800 text-slate-300'
    }`;

  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6 z-20 shrink-0">
      <div className="mb-10">
        <h1 className="text-red-500 text-xl font-bold tracking-tighter uppercase italic">
          Break_Point<span className="animate-pulse text-red-500">_ADMIN</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        <a
          href="/admin"
          className={navItemClass(pathname === '/admin')}
        >
          <span>[■]</span> Dashboard
        </a>
        <a
          href="/admin/labs"
          className={navItemClass(pathname.startsWith('/admin/labs'))}
        >
          <span>[+]</span> Labs
        </a>
        <a
          href="/profile"
          className={navItemClass(pathname === '/profile')}
        >
          <span>[👤]</span> Profile
        </a>
        <a
          href="#"
          className={navItemClass(false)}
        >
          <span>[👥]</span> Manage Users
        </a>
        <a
          href="#"
          className={navItemClass(false)}
        >
          <span>[⚙]</span> System Settings
        </a>
        <a
          href="#"
          className={navItemClass(false)}
        >
          <span>[📊]</span> Analytics
        </a>
        <a
          href="#"
          className={navItemClass(false)}
        >
          <span>[⚠]</span> Security Log
        </a>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800 my-4">
        <div className="text-xs text-slate-500 mb-2 uppercase">Admin User</div>
        <div className="font-bold text-red-400">ADMIN_ROOT</div>
        <div className="text-xs text-slate-500 mt-2">Permission: FULL_ACCESS</div>
      </div>
      <AdminControlButtons
        onSystemStatus={() => console.log('System status check')}
        onLogout={() => {
          logout();
          router.push('/login');
        }}
      />
    </aside>
  );
}
