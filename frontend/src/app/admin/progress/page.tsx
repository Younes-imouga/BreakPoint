'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AdminControlButtons from '@/components/AdminControlButtons';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, type User } from '@/lib/api/users';

const PAGE_SIZE = 20;

export default function AdminProgressPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'exp' | 'score' | 'labs'>('exp');

  if (user?.role !== 'ADMIN') return null;

  useEffect(() => {
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
        setErrorMessage('Unable to load user progress data.');
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
  }, [page]);

  const filteredAndSorted = useMemo(() => {
    let filtered = users.filter((u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Only include participants, not admins
    filtered = filtered.filter((u) => u.role === 'PARTICIPANT');

    // Sort
    if (sortBy === 'exp') {
      filtered.sort((a, b) => b.exp - a.exp);
    } else if (sortBy === 'score') {
      filtered.sort((a, b) => b.total_score - a.total_score);
    } else if (sortBy === 'labs') {
      filtered.sort((a, b) => b.completed_simulations.length - a.completed_simulations.length);
    }

    return filtered;
  }, [users, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const participants = users.filter((u) => u.role === 'PARTICIPANT');
    const avgExp = participants.length === 0 ? 0 : Math.round(
      participants.reduce((sum, u) => sum + u.exp, 0) / participants.length
    );
    const avgScore = participants.length === 0 ? 0 : Math.round(
      participants.reduce((sum, u) => sum + u.total_score, 0) / participants.length
    );
    const avgLabs = participants.length === 0 ? 0 : Math.round(
      participants.reduce((sum, u) => sum + u.completed_simulations.length, 0) / participants.length
    );
    const topPlayer = participants.length === 0 ? null : participants.reduce((top, u) => 
      u.total_score > top.total_score ? u : top
    );

    return {
      totalParticipants: participants.length,
      avgExp,
      avgScore,
      avgLabs,
      topPlayer,
    };
  }, [users]);

  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen flex">
      <AdminSidebar />

      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="scanline"></div>

        <header className="p-8 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-red-400">Participant_Progress.exe</h2>
              <p className="text-sm text-slate-500 italic">Track user performance and achievement metrics...</p>
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

          {/* Stats */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-red-900/20 border border-red-900 p-6 rounded-lg">
              <div className="text-xs text-red-400 uppercase mb-2 font-bold">Total Participants</div>
              <div className="text-3xl font-bold text-red-400">{isLoading ? '...' : stats.totalParticipants}</div>
            </div>
            <div className="bg-cyan-900/20 border border-cyan-900 p-6 rounded-lg">
              <div className="text-xs text-cyan-400 uppercase mb-2 font-bold">Average XP</div>
              <div className="text-3xl font-bold text-cyan-400">{isLoading ? '...' : stats.avgExp}</div>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-900 p-6 rounded-lg">
              <div className="text-xs text-emerald-400 uppercase mb-2 font-bold">Average Score</div>
              <div className="text-3xl font-bold text-emerald-400">{isLoading ? '...' : stats.avgScore}</div>
            </div>
            <div className="bg-amber-900/20 border border-amber-900 p-6 rounded-lg">
              <div className="text-xs text-amber-400 uppercase mb-2 font-bold">Average Labs</div>
              <div className="text-3xl font-bold text-amber-400">{isLoading ? '...' : stats.avgLabs}</div>
            </div>
          </section>

          {/* Top player */}
          {stats.topPlayer && (
            <section className="mb-8 bg-linear-to-r from-red-900/30 to-cyan-900/30 border border-red-800 rounded-lg p-6">
              <h3 className="text-red-400 font-bold uppercase text-sm mb-3">Top Player</h3>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-cyan-400 font-bold text-lg">{stats.topPlayer.name}</h4>
                  <p className="text-xs text-slate-500">{stats.topPlayer.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">{stats.topPlayer.total_score}</div>
                  <div className="text-xs text-slate-500">Total Score</div>
                </div>
              </div>
            </section>
          )}

          {/* Filters */}
          <section className="mb-6 flex gap-4 items-center flex-wrap">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-64 bg-slate-950 border border-slate-700 rounded px-4 py-2 text-sm"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded px-4 py-2 text-sm"
            >
              <option value="exp">Sort by XP</option>
              <option value="score">Sort by Score</option>
              <option value="labs">Sort by Labs</option>
            </select>
          </section>

          {/* Leaderboard table */}
          <section className="overflow-x-auto bg-slate-900 border border-slate-700 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">
                    Email
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-400">
                    XP
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-400">
                    Total Score
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-400">
                    Labs Completed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-400">
                    Badge
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-center text-slate-500">
                      Loading participants...
                    </td>
                  </tr>
                ) : filteredAndSorted.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-center text-slate-500">
                      No participants found.
                    </td>
                  </tr>
                ) : (
                  filteredAndSorted.map((participant, idx) => (
                    <tr key={participant._id} className="hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3 font-bold text-red-400">#{idx + 1}</td>
                      <td className="px-4 py-3 text-slate-300">{participant.name}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{participant.email}</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-400">{participant.exp}</td>
                      <td className="px-4 py-3 text-center font-bold text-cyan-400">{participant.total_score}</td>
                      <td className="px-4 py-3 text-center font-bold text-amber-400">
                        {participant.completed_simulations.length}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500">{participant.badge ?? '—'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

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
