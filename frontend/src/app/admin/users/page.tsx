'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AdminControlButtons from '@/components/AdminControlButtons';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, updateUser, deleteUser, type User } from '@/lib/api/users';

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    let isMounted = true;

    async function loadUsers() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await getUsers(page, PAGE_SIZE);
        if (!isMounted) return;

        setUsers(response.data);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      } catch {
        if (!isMounted) return;
        setErrorMessage('Unable to load users.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, [page, isAdmin]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  async function handleResetScores(userId: string) {
    const confirmed = window.confirm(
      'Reset all scores for this user? They will keep their completed labs history but lose all XP and total score.'
    );
    if (!confirmed) return;

    try {
      setSuspendingId(userId);
      await updateUser(userId, { exp: 0, total_score: 0 });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, exp: 0, total_score: 0 } : u))
      );
      setSuccessMessage('User scores reset successfully.');
    } catch {
      setErrorMessage('Failed to reset user scores.');
    } finally {
      setSuspendingId(null);
    }
  }

  async function handleDeleteUser(userId: string) {
    const confirmed = window.confirm(
      'Permanently delete this user? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      setDeletingId(userId);
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setSuccessMessage('User deleted successfully.');
    } catch {
      setErrorMessage('Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  }

  if (!isAdmin) return null;

  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen flex">
      <AdminSidebar />

      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="scanline"></div>

        <header className="p-8 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-red-400">User_Management.exe</h2>
              <p className="text-sm text-slate-500 italic">View, monitor, and manage platform users...</p>
            </div>
            <AdminControlButtons
              onSystemStatus={() => console.log('System status check')}
              onLogout={() => {
                logout();
                router.push('/login');
              }}
            />
          </div>
        </header>

        <div className="p-8">
          {errorMessage ? (
            <section className="mb-8 rounded border border-red-800 bg-red-950/20 p-4 text-sm text-red-300">
              {errorMessage}
            </section>
          ) : null}

          {successMessage ? (
            <section className="mb-8 rounded border border-emerald-800 bg-emerald-950/20 p-4 text-sm text-emerald-300">
              {successMessage}
            </section>
          ) : null}

          <section className="mb-8">
            <div className="flex gap-4 items-center mb-6">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-4 py-2 text-sm"
              />
              <div className="text-xs text-slate-500">
                Showing {filteredUsers.length} of {total} users
              </div>
            </div>

            <div className="overflow-x-auto bg-slate-900 border border-slate-700 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-700">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">
                      XP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">
                      Total Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">
                      Badge
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-3 text-center text-slate-500">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-3 text-center text-slate-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((platformUser) => (
                      <tr key={platformUser._id} className="hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3 text-slate-300">{platformUser.name}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{platformUser.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${
                              platformUser.role === 'ADMIN'
                                ? 'bg-red-900/30 text-red-400'
                                : 'bg-cyan-900/30 text-cyan-400'
                            }`}
                          >
                            {platformUser.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-400">{platformUser.exp}</td>
                        <td className="px-4 py-3 font-bold text-cyan-400">{platformUser.total_score}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500">{platformUser.badge ?? '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleResetScores(platformUser._id)}
                              disabled={suspendingId === platformUser._id}
                              className="bg-amber-900/50 hover:bg-amber-800 border border-amber-700 px-2 py-1 rounded text-xs font-bold text-amber-300 disabled:opacity-50"
                            >
                              {suspendingId === platformUser._id ? 'Resetting...' : 'Reset'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(platformUser._id)}
                              disabled={deletingId === platformUser._id}
                              className="bg-red-900/50 hover:bg-red-800 border border-red-700 px-2 py-1 rounded text-xs font-bold text-red-300 disabled:opacity-50"
                            >
                              {deletingId === platformUser._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 ? (
              <div className="flex gap-2 justify-center mt-6">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="bg-slate-900 border border-slate-700 px-4 py-2 rounded text-xs disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="flex items-center text-xs text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="bg-slate-900 border border-slate-700 px-4 py-2 rounded text-xs disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : null}
          </section>
        </div>

        <style jsx>{`
          .scanline {
            width: 100%;
            height: 2px;
            background: rgba(239, 68, 68, 0.1);
            position: absolute;
            animation: scan 4s linear infinite;
          }
          @keyframes scan {
            from {
              top: 0;
            }
            to {
              top: 100%;
            }
          }
        `}</style>
      </main>
    </div>
  );
}
