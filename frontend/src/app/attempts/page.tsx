'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserSidebar from '@/components/UserSidebar';
import AttemptCard from '@/components/AttemptCard';
import LabFilters from '@/components/LabFilters';
import { attemptsApi, type AttemptDto } from '@/lib/api/attempts';
import { simulationsApi } from '@/lib/api/simulations';

type AttemptFilter = 'All Attempts' | 'Successful' | 'Failed' | 'In Progress';

type LabAttemptSummary = {
  simulationId: string;
  simulationName: string;
  total: number;
  successful: number;
  failed: number;
  inProgress: number;
  bestScore: number;
};

function toStatus(success: boolean | null): 'success' | 'failed' | 'in-progress' {
  if (success === true) return 'success';
  if (success === false) return 'failed';
  return 'in-progress';
}

function shortId(value: string) {
  if (!value) return 'N/A';
  if (value.length <= 10) return value;
  return `${value.slice(0, 6)}...`;
}

function timeAgo(isoDate?: string) {
  if (!isoDate) return 'Unknown';

  const now = Date.now();
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return 'Unknown';

  const deltaMs = Math.max(0, now - then);
  const deltaMinutes = Math.floor(deltaMs / 60000);
  const deltaHours = Math.floor(deltaMinutes / 60);
  const deltaDays = Math.floor(deltaHours / 24);

  if (deltaMinutes < 1) return 'Just now';
  if (deltaMinutes < 60) return `${deltaMinutes} minute(s) ago`;
  if (deltaHours < 24) return `${deltaHours} hour(s) ago`;
  return `${deltaDays} day(s) ago`;
}

function elapsedTime(createdAt?: string, updatedAt?: string, isActive?: boolean) {
  const start = createdAt ? new Date(createdAt).getTime() : NaN;
  const end = isActive
    ? Date.now()
    : updatedAt
      ? new Date(updatedAt).getTime()
      : Date.now();

  if (Number.isNaN(start) || Number.isNaN(end)) return 'Unknown';

  const diffMs = Math.max(0, end - start);
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

export default function AttemptsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState<AttemptFilter>('All Attempts');
  const [attempts, setAttempts] = useState<AttemptDto[]>([]);
  const [simulationNames, setSimulationNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadAttemptsPage() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const attemptsResponse = await attemptsApi.getMyAttempts();
        if (!isMounted) return;

        setAttempts(attemptsResponse);

        const uniqueSimulationIds = Array.from(
          new Set(attemptsResponse.map((attempt) => attempt.simulation_id)),
        );

        const simulationEntries = await Promise.all(
          uniqueSimulationIds.map(async (simulationId) => {
            try {
              const simulation = await simulationsApi.getById(simulationId);
              return [simulationId, simulation.name] as const;
            } catch {
              return [simulationId, `Simulation ${shortId(simulationId)}`] as const;
            }
          }),
        );

        if (!isMounted) return;
        setSimulationNames(Object.fromEntries(simulationEntries));
      } catch {
        if (!isMounted) return;
        setErrorMessage('Unable to load attempt history right now.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAttemptsPage();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAttempts = useMemo(() => {
    return attempts.filter((attempt) => {
      if (activeFilter === 'All Attempts') return true;
      if (activeFilter === 'Successful') return attempt.success === true;
      if (activeFilter === 'Failed') return attempt.success === false;
      return attempt.success === null;
    });
  }, [attempts, activeFilter]);

  const attemptsByLab = useMemo<LabAttemptSummary[]>(() => {
    const summaryMap = new Map<string, LabAttemptSummary>();

    for (const attempt of attempts) {
      const simulationId = attempt.simulation_id;
      const simulationName =
        simulationNames[simulationId] ?? `Simulation ${shortId(simulationId)}`;

      const current = summaryMap.get(simulationId) ?? {
        simulationId,
        simulationName,
        total: 0,
        successful: 0,
        failed: 0,
        inProgress: 0,
        bestScore: 0,
      };

      current.total += 1;
      if (attempt.success === true) current.successful += 1;
      if (attempt.success === false) current.failed += 1;
      if (attempt.success === null) current.inProgress += 1;

      const candidateScore = attempt.final_score ?? 0;
      if (candidateScore > current.bestScore) {
        current.bestScore = candidateScore;
      }

      summaryMap.set(simulationId, current);
    }

    return Array.from(summaryMap.values()).sort((a, b) => b.total - a.total);
  }, [attempts, simulationNames]);

  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen flex">
      <UserSidebar />

      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="scanline"></div>

        <header className="p-8 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Attempt History</h2>
            <p className="text-sm text-slate-500 italic">
              Track your lab attempts and progress...
            </p>
          </div>
        </header>

        <div className="p-8">
          {/* Filters */}
          <section className="mb-8 flex gap-4">
            <LabFilters
              filters={['All Attempts', 'Successful', 'Failed', 'In Progress']}
              onFilterChange={(filter) => setActiveFilter(filter as AttemptFilter)}
            />
          </section>

          {errorMessage ? (
            <section className="mb-6 rounded border border-red-800 bg-red-950/20 p-4 text-sm text-red-300">
              {errorMessage}
            </section>
          ) : null}

          <section className="mb-8 rounded border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase text-cyan-300 tracking-wide">
                Attempts Per Lab
              </h3>
              <span className="text-[11px] text-slate-500">BP-40 Tracking</span>
            </div>

            {isLoading ? (
              <div className="p-4 text-sm text-slate-500">Loading lab attempt summaries...</div>
            ) : attemptsByLab.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">No attempts available yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-900/70 text-slate-400 text-[11px] uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Lab</th>
                      <th className="text-left px-4 py-3">Total</th>
                      <th className="text-left px-4 py-3">Success</th>
                      <th className="text-left px-4 py-3">Failed</th>
                      <th className="text-left px-4 py-3">In Progress</th>
                      <th className="text-left px-4 py-3">Best Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {attemptsByLab.map((lab) => (
                      <tr key={lab.simulationId} className="hover:bg-slate-800/20">
                        <td className="px-4 py-3 text-cyan-300 font-semibold">{lab.simulationName}</td>
                        <td className="px-4 py-3">{lab.total}</td>
                        <td className="px-4 py-3 text-emerald-400">{lab.successful}</td>
                        <td className="px-4 py-3 text-red-400">{lab.failed}</td>
                        <td className="px-4 py-3 text-amber-300">{lab.inProgress}</td>
                        <td className="px-4 py-3 text-cyan-400 font-semibold">{lab.bestScore} XP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Attempts List */}
          <section className="space-y-4">
            {!isLoading && filteredAttempts.length === 0 ? (
              <div className="rounded border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-500">
                No attempts found for this filter.
              </div>
            ) : null}

            {filteredAttempts.map((attempt) => {
              const status = toStatus(attempt.success);
              const isActive = status === 'in-progress';

              return (
                <AttemptCard
                  key={attempt._id}
                  labName={simulationNames[attempt.simulation_id] ?? `Simulation ${shortId(attempt.simulation_id)}`}
                  labId={shortId(attempt.simulation_id)}
                  status={status}
                  xpEarned={attempt.success === true ? attempt.final_score ?? 0 : 0}
                  timeElapsed={elapsedTime(attempt.createdAt, attempt.updatedAt, isActive)}
                  attemptsUsed={attempt.attempts.length}
                  maxAttempts={3}
                  hintsUsed={attempt.hints_used}
                  timestamp={isActive ? 'Active' : timeAgo(attempt.updatedAt ?? attempt.createdAt)}
                  onResume={
                    isActive ? () => router.push(`/simulations/${attempt.simulation_id}`) : undefined
                  }
                />
              );
            })}
          </section>
        </div>
      </main>

      <style jsx>{`
        .scanline {
          width: 100%;
          height: 2px;
          background: rgba(34, 211, 238, 0.1);
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
    </div>
  );
}
