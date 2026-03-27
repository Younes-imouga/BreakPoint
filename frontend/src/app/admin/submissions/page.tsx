'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AdminControlButtons from '@/components/AdminControlButtons';
import { useAuth } from '@/contexts/AuthContext';
import { simulationsApi, type SimulationDto } from '@/lib/api/simulations';
import { type AttemptDto } from '@/lib/api/attempts';
import { formatAttemptUser, type AttemptUserRef } from '@/lib/attempt-user';

const PAGE_SIZE = 100;

type SubmissionAttempt = Omit<AttemptDto, 'user_id'> & {
  user_id: AttemptUserRef;
};

interface SimulationWithAttempts {
  simulation: SimulationDto;
  attempts: SubmissionAttempt[];
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

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [simulations, setSimulations] = useState<SimulationWithAttempts[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterByStatus, setFilterByStatus] = useState<'all' | 'successful' | 'failed'>('all');

  if (user?.role !== 'ADMIN') return null;

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const allSimulations = await getAllSimulations();

        // For each simulation, fetch attempts
        const simulationsByAttempts: SimulationWithAttempts[] = [];
        for (const sim of allSimulations) {
          const attempts = await simulationsApi.getAttempts(sim._id);
          simulationsByAttempts.push({
            simulation: sim,
            attempts: (attempts as SubmissionAttempt[]) || [],
          });
        }

        if (!isMounted) return;
        setSimulations(simulationsByAttempts);
      } catch {
        if (!isMounted) return;
        setErrorMessage('Unable to load submissions data.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSimulations = useMemo(() => {
    return simulations
      .filter((item) =>
        item.simulation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.simulation.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((item) => ({
        ...item,
        attempts: item.attempts.filter((attempt) => {
          if (filterByStatus === 'successful') return attempt.success === true;
          if (filterByStatus === 'failed') return attempt.success === false;
          return true;
        }),
      }));
  }, [simulations, searchQuery, filterByStatus]);

  const totalSubmissions = useMemo(() => {
    return filteredSimulations.reduce((sum, item) => sum + item.attempts.length, 0);
  }, [filteredSimulations]);

  const successfulSubmissions = useMemo(() => {
    return filteredSimulations.reduce(
      (sum, item) => sum + item.attempts.filter((a) => a.success === true).length,
      0
    );
  }, [filteredSimulations]);

  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen flex">
      <AdminSidebar />

      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="scanline"></div>

        <header className="p-8 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-red-400">Token_Submissions.exe</h2>
              <p className="text-sm text-slate-500 italic">View all token submissions and attempts per lab...</p>
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
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-red-900/20 border border-red-900 p-6 rounded-lg">
              <div className="text-xs text-red-400 uppercase mb-2 font-bold">Total Submissions</div>
              <div className="text-3xl font-bold text-red-400">{isLoading ? '...' : totalSubmissions}</div>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-900 p-6 rounded-lg">
              <div className="text-xs text-emerald-400 uppercase mb-2 font-bold">
                Successful Submissions
              </div>
              <div className="text-3xl font-bold text-emerald-400">
                {isLoading ? '...' : successfulSubmissions}
              </div>
            </div>
            <div className="bg-cyan-900/20 border border-cyan-900 p-6 rounded-lg">
              <div className="text-xs text-cyan-400 uppercase mb-2 font-bold">Success Rate</div>
              <div className="text-3xl font-bold text-cyan-400">
                {isLoading ? '...' : totalSubmissions === 0 ? '0%' : `${Math.round((successfulSubmissions / totalSubmissions) * 100)}%`}
              </div>
            </div>
          </section>

          {/* Filters */}
          <section className="mb-6 flex gap-4 items-center flex-wrap">
            <input
              type="text"
              placeholder="Search by lab name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-64 bg-slate-950 border border-slate-700 rounded px-4 py-2 text-sm"
            />
            <select
              value={filterByStatus}
              onChange={(e) => setFilterByStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded px-4 py-2 text-sm"
            >
              <option value="all">All Submissions</option>
              <option value="successful">Successful Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </section>

          {/* Labs with submissions */}
          <section className="space-y-6">
            {isLoading ? (
              <div className="text-center text-slate-500">Loading submissions...</div>
            ) : filteredSimulations.length === 0 ? (
              <div className="text-center text-slate-500">No labs match your search.</div>
            ) : (
              filteredSimulations.map((item) => (
                <div key={item.simulation._id} className="bg-slate-900 border border-slate-700 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-cyan-400 font-bold text-lg">{item.simulation.name}</h3>
                      <p className="text-xs text-slate-500">{item.simulation.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-400">{item.attempts.length}</div>
                      <div className="text-xs text-slate-500">Total Attempts</div>
                    </div>
                  </div>

                  {item.attempts.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-4">No submissions yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left px-2 py-2 text-slate-400">User</th>
                            <th className="text-left px-2 py-2 text-slate-400">Attempts</th>
                            <th className="text-left px-2 py-2 text-slate-400">Status</th>
                            <th className="text-left px-2 py-2 text-slate-400">Submitted At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.attempts.slice(0, 5).map((attempt, idx) => (
                            <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30">
                              <td className="px-2 py-2 text-slate-400">
                                {formatAttemptUser(attempt.user_id)}
                              </td>
                              <td className="px-2 py-2">
                                <span className="font-bold">{attempt.attempts.length} / 3</span>
                              </td>
                              <td className="px-2 py-2">
                                {attempt.success === true ? (
                                  <span className="text-emerald-400 font-bold">✓ SUCCESS</span>
                                ) : attempt.success === false ? (
                                  <span className="text-red-400 font-bold">✗ FAILED</span>
                                ) : (
                                  <span className="text-amber-400 font-bold">⦿ IN_PROGRESS</span>
                                )}
                              </td>
                              <td className="px-2 py-2 text-slate-500">
                                {attempt.updatedAt
                                  ? new Date(attempt.updatedAt).toLocaleDateString()
                                  : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {item.attempts.length > 5 ? (
                        <div className="text-xs text-slate-500 mt-2 p-2">
                          +{item.attempts.length - 5} more submissions...
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))
            )}
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
