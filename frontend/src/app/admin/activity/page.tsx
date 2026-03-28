'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AdminControlButtons from '@/components/AdminControlButtons';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, type User } from '@/lib/api/users';
import { simulationsApi, type SimulationDto } from '@/lib/api/simulations';
import { type AttemptDto } from '@/lib/api/attempts';
import { formatAttemptUser, type AttemptUserRef } from '@/lib/attempt-user';

type ActivityAttempt = Omit<AttemptDto, 'user_id'> & {
  user_id: AttemptUserRef;
};

const PAGE_SIZE = 100;

async function getAllUsers(): Promise<User[]> {
  let page = 1;
  let totalPages = 1;
  const users: User[] = [];

  while (page <= totalPages) {
    const response = await getUsers(page, PAGE_SIZE);
    users.push(...response.data);
    totalPages = response.totalPages;
    page += 1;
  }

  return users;
}

async function getAllSimulations(): Promise<SimulationDto[]> {
  let page = 1;
  let totalPages = 1;
  const simulations: SimulationDto[] = [];

  while (page <= totalPages) {
    const response = await simulationsApi.getAll(page, PAGE_SIZE);
    simulations.push(...response.data);
    totalPages = response.totalPages;
    page += 1;
  }

  return simulations;
}

async function getAllAttempts(simulationId: string): Promise<ActivityAttempt[]> {
  return simulationsApi.getAttempts(simulationId) as Promise<ActivityAttempt[]>;
}

export default function AdminActivityPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [simulations, setSimulations] = useState<SimulationDto[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<ActivityAttempt[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    let isMounted = true;

    async function loadActivityData() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [usersData, simulationsData] = await Promise.all([
          getAllUsers(),
          getAllSimulations(),
        ]);

        if (!isMounted) return;

        setUsers(usersData);
        setSimulations(simulationsData);

        // Gather all attempts from all simulations
        const allAttempts: ActivityAttempt[] = [];
        for (const sim of simulationsData) {
          const attempts = await getAllAttempts(sim._id);
          allAttempts.push(...attempts);
        }

        // Sort by most recent and keep top 20
        allAttempts.sort((a, b) => {
          const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return timeB - timeA;
        });

        if (!isMounted) return;
        setRecentAttempts(allAttempts.slice(0, 20));
      } catch {
        if (!isMounted) return;
        setErrorMessage('Unable to load activity data.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadActivityData();

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const stats = useMemo(() => {
    const participants = users.filter((u) => u.role === 'PARTICIPANT');
    const admins = users.filter((u) => u.role === 'ADMIN');
    const activeLabs = simulations.filter((s) => s.status === 'Active').length;
    const lockedLabs = simulations.filter((s) => s.status === 'Locked').length;

    const totalAttempts = recentAttempts.length;
    const successAttempts = recentAttempts.filter((a) => a.success === true).length;
    const failedAttempts = recentAttempts.filter((a) => a.success === false).length;
    const inProgressAttempts = recentAttempts.filter((a) => a.success === null).length;

    const avgAttemptsPerUser =
      participants.length === 0
        ? 0
        : Math.round(totalAttempts / participants.length);

    const totalScore = participants.reduce((sum, p) => sum + p.total_score, 0);

    return {
      totalUsers: users.length,
      participants: participants.length,
      admins: admins.length,
      totalLabs: simulations.length,
      activeLabs,
      lockedLabs,
      totalAttempts,
      successAttempts,
      failedAttempts,
      inProgressAttempts,
      avgAttemptsPerUser,
      totalScore,
      successRate:
        totalAttempts === 0
          ? '0%'
          : `${Math.round((successAttempts / totalAttempts) * 100)}%`,
    };
  }, [users, simulations, recentAttempts]);

  const difficultyDistribution = useMemo(() => {
    return {
      Easy: simulations.filter((s) => s.difficulty === 'Easy').length,
      Normal: simulations.filter((s) => s.difficulty === 'Normal').length,
      Hard: simulations.filter((s) => s.difficulty === 'Hard').length,
      Insane: simulations.filter((s) => s.difficulty === 'Insane').length,
    };
  }, [simulations]);

  if (!isAdmin) return null;

  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen flex">
      <AdminSidebar />

      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="scanline"></div>

        <header className="p-8 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-red-400">Platform_Activity.exe</h2>
              <p className="text-sm text-slate-500 italic">Real-time platform metrics and activity feed...</p>
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

          {/* Primary metrics */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-red-900/20 border border-red-900 p-6 rounded-lg">
              <div className="text-xs text-red-400 uppercase mb-2 font-bold">Total Users</div>
              <div className="text-3xl font-bold text-red-400">{isLoading ? '...' : stats.totalUsers}</div>
              <div className="text-xs text-slate-500 mt-2">
                Admins: {stats.admins} | Participants: {stats.participants}
              </div>
            </div>
            <div className="bg-cyan-900/20 border border-cyan-900 p-6 rounded-lg">
              <div className="text-xs text-cyan-400 uppercase mb-2 font-bold">Total Labs</div>
              <div className="text-3xl font-bold text-cyan-400">{isLoading ? '...' : stats.totalLabs}</div>
              <div className="text-xs text-slate-500 mt-2">
                Active: {stats.activeLabs} | Locked: {stats.lockedLabs}
              </div>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-900 p-6 rounded-lg">
              <div className="text-xs text-emerald-400 uppercase mb-2 font-bold">Total Attempts</div>
              <div className="text-3xl font-bold text-emerald-400">
                {isLoading ? '...' : stats.totalAttempts}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Success: {stats.successAttempts} | Failed: {stats.failedAttempts}
              </div>
            </div>
            <div className="bg-amber-900/20 border border-amber-900 p-6 rounded-lg">
              <div className="text-xs text-amber-400 uppercase mb-2 font-bold">Success Rate</div>
              <div className="text-3xl font-bold text-amber-400">
                {isLoading ? '...' : stats.successRate}
              </div>
              <div className="text-xs text-slate-500 mt-2">Avg Attempts/User: {stats.avgAttemptsPerUser}</div>
            </div>
          </section>

          {/* Secondary metrics */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <h3 className="text-red-400 font-bold uppercase text-sm mb-4">Lab Difficulty</h3>
              <div className="space-y-3">
                {(['Easy', 'Normal', 'Hard', 'Insane'] as const).map((difficulty) => {
                  const count = difficultyDistribution[difficulty];
                  const width =
                    stats.totalLabs === 0 ? 0 : (count / stats.totalLabs) * 100;
                  return (
                    <div key={difficulty}>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{difficulty}</span>
                        <span>{count}</span>
                      </div>
                      <div className="h-2 rounded bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-red-500/70"
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <h3 className="text-red-400 font-bold uppercase text-sm mb-4">Attempt Status</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Successful</span>
                    <span>{stats.successAttempts}</span>
                  </div>
                  <div className="h-2 rounded bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500/70"
                      style={{
                        width:
                          stats.totalAttempts === 0
                            ? 0
                            : `${(stats.successAttempts / stats.totalAttempts) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Failed</span>
                    <span>{stats.failedAttempts}</span>
                  </div>
                  <div className="h-2 rounded bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-red-500/70"
                      style={{
                        width:
                          stats.totalAttempts === 0
                            ? 0
                            : `${(stats.failedAttempts / stats.totalAttempts) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>In Progress</span>
                    <span>{stats.inProgressAttempts}</span>
                  </div>
                  <div className="h-2 rounded bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500/70"
                      style={{
                        width:
                          stats.totalAttempts === 0
                            ? 0
                            : `${(stats.inProgressAttempts / stats.totalAttempts) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <h3 className="text-red-400 font-bold uppercase text-sm mb-4">Total Score</h3>
              <div className="text-4xl font-bold text-cyan-400 mb-4">
                {isLoading ? '...' : stats.totalScore.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500">
                All points earned by all participants across the platform.
              </p>
            </div>
          </section>

          {/* Recent activity */}
          <section>
            <h3 className="text-red-400 font-bold uppercase text-sm mb-6">Recent Submissions</h3>
            <div className="overflow-x-auto bg-slate-900 border border-slate-700 rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-700">
                    <th className="px-4 py-2 text-left text-slate-400">User</th>
                    <th className="px-4 py-2 text-left text-slate-400">Status</th>
                    <th className="px-4 py-2 text-left text-slate-400">Attempts</th>
                    <th className="px-4 py-2 text-left text-slate-400">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-center text-slate-500">
                        Loading activity...
                      </td>
                    </tr>
                  ) : recentAttempts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-center text-slate-500">
                        No recent activity.
                      </td>
                    </tr>
                  ) : (
                    recentAttempts.map((attempt) => (
                      <tr key={attempt._id} className="hover:bg-slate-800/30">
                        <td className="px-4 py-2 text-slate-400">
                          {formatAttemptUser(attempt.user_id)}
                        </td>
                        <td className="px-4 py-2">
                          {attempt.success === true ? (
                            <span className="text-emerald-400 font-bold">✓ SUCCESS</span>
                          ) : attempt.success === false ? (
                            <span className="text-red-400 font-bold">✗ FAILED</span>
                          ) : (
                            <span className="text-amber-400 font-bold">⦿ PROGRESS</span>
                          )}
                        </td>
                        <td className="px-4 py-2">{attempt.attempts.length} / 3</td>
                        <td className="px-4 py-2 text-slate-500">
                          {attempt.updatedAt
                            ? new Date(attempt.updatedAt).toLocaleString()
                            : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
