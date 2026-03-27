'use client';

import { useMemo, useEffect, useState } from 'react';
import UserSidebar from '@/components/UserSidebar';
import { getLeaderboard, getMyStats, type LeaderboardEntry, type UserStats } from '@/lib/api/users';

function rankLabel(rank: number) {
  if (rank === 1) return '1';
  if (rank === 2) return '2';
  if (rank === 3) return '3';
  return String(rank);
}

export default function LeaderboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myStats, setMyStats] = useState<UserStats | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLeaderboard() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [leaderboardResponse, myStatsResponse] = await Promise.all([
          getLeaderboard(10),
          getMyStats(),
        ]);

        if (!isMounted) return;
        setEntries(leaderboardResponse);
        setMyStats(myStatsResponse);
      } catch {
        if (!isMounted) return;
        setErrorMessage('Unable to load leaderboard right now.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedEntries = useMemo(() => {
    return [...entries]
      .filter((entry) => (entry.role ?? '').toUpperCase() === 'PARTICIPANT')
      .sort((a, b) => b.total_score - a.total_score);
  }, [entries]);

  const myRank = useMemo(() => {
    if (!myStats) return null;
    const index = sortedEntries.findIndex((entry) => entry.name === myStats.name);
    return index >= 0 ? index + 1 : null;
  }, [sortedEntries, myStats]);

  const averageScore = useMemo(() => {
    if (sortedEntries.length === 0) return 0;
    const total = sortedEntries.reduce((sum, entry) => sum + entry.total_score, 0);
    return Math.round(total / sortedEntries.length);
  }, [sortedEntries]);

  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen flex">
      <UserSidebar />

      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-0.5 bg-cyan-400/10"></div>

        <header className="p-8 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-white">Leaderboard.sys</h2>
          <p className="text-sm text-slate-500 italic">
            Top performers across simulation scoring...
          </p>
        </header>

        <div className="p-8">
          {errorMessage ? (
            <section className="mb-8 rounded border border-red-800 bg-red-950/20 p-4 text-sm text-red-300">
              {errorMessage}
            </section>
          ) : null}

          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-[11px] uppercase text-slate-500">Players Ranked</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {isLoading ? '...' : sortedEntries.length}
              </div>
            </div>
            <div className="rounded border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-[11px] uppercase text-slate-500">Average Score</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {isLoading ? '...' : `${averageScore} XP`}
              </div>
            </div>
            <div className="rounded border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-[11px] uppercase text-slate-500">Top Score</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {isLoading ? '...' : `${sortedEntries[0]?.total_score ?? 0} XP`}
              </div>
            </div>
            <div className="rounded border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-[11px] uppercase text-slate-500">Your Rank</div>
              <div className="text-2xl font-bold text-yellow-400 mt-1">
                {isLoading ? '...' : myRank ? `#${myRank}` : 'Unranked'}
              </div>
            </div>
          </section>

          <section className="rounded border border-slate-800 bg-slate-900/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    <th className="px-4 py-3 text-left text-[11px] uppercase text-slate-400">Rank</th>
                    <th className="px-4 py-3 text-left text-[11px] uppercase text-slate-400">Operator</th>
                    <th className="px-4 py-3 text-left text-[11px] uppercase text-slate-400">Score</th>
                    <th className="px-4 py-3 text-left text-[11px] uppercase text-slate-400">XP</th>
                    <th className="px-4 py-3 text-left text-[11px] uppercase text-slate-400">Labs</th>
                    <th className="px-4 py-3 text-left text-[11px] uppercase text-slate-400">Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sortedEntries.map((entry, index) => {
                    const rank = index + 1;
                    const isCurrentUser = Boolean(myStats && entry.name === myStats.name);
                    return (
                      <tr
                        key={entry._id}
                        className={isCurrentUser ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : 'hover:bg-slate-800/20'}
                      >
                        <td className="px-4 py-3 font-bold text-cyan-300">{rankLabel(rank)}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-200">
                            {entry.name}
                            {isCurrentUser ? (
                              <span className="text-[11px] text-cyan-400 ml-2">(YOU)</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-cyan-300 font-semibold">{entry.total_score}</td>
                        <td className="px-4 py-3 text-slate-300">{entry.exp}</td>
                        <td className="px-4 py-3 text-emerald-300">{entry.completed_labs}</td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] px-2 py-1 border border-slate-700 rounded text-slate-300">
                            {entry.badge}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {!isLoading && sortedEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-5 text-sm text-slate-500">
                        No leaderboard entries available.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
