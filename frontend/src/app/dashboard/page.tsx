'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserSidebar from '@/components/UserSidebar';
import QuickFlagSubmit from '@/components/QuickFlagSubmit';
import { attemptsApi, type AttemptDto } from '@/lib/api/attempts';
import { simulationsApi, type SimulationDto } from '@/lib/api/simulations';
import { getMyStats, type UserStats } from '@/lib/api/users';

function shortId(value: string) {
  if (!value) return 'N/A';
  if (value.length <= 10) return value;
  return `${value.slice(0, 6)}...`;
}

function safePercent(value: number) {
  return Number.isFinite(value) ? `${value.toFixed(0)}%` : '0%';
}

function getNextBadgeTarget(exp: number) {
  if (exp < 200) return { label: 'INTERMEDIATE', target: 200 };
  if (exp < 500) return { label: 'ADVANCED', target: 500 };
  if (exp < 1000) return { label: 'EXPERT', target: 1000 };
  return { label: 'MAX', target: exp };
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [attempts, setAttempts] = useState<AttemptDto[]>([]);
  const [simulations, setSimulations] = useState<SimulationDto[]>([]);
  const [totalLabs, setTotalLabs] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [statsResponse, attemptsResponse, simulationsResponse] = await Promise.all([
          getMyStats(),
          attemptsApi.getMyAttempts(),
          simulationsApi.getAll(1, 100, { status: 'Active' }),
        ]);

        if (!isMounted) return;

        setStats(statsResponse);
        setAttempts(attemptsResponse);
        setSimulations(simulationsResponse.data);
        setTotalLabs(simulationsResponse.total);
      } catch {
        if (!isMounted) return;
        setErrorMessage('Unable to load dashboard statistics right now.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const dashboardMetrics = useMemo(() => {
    const completedAttempts = attempts.filter((attempt) => attempt.success !== null);
    const successfulAttempts = attempts.filter((attempt) => attempt.success === true).length;
    const failedAttempts = attempts.filter((attempt) => attempt.success === false).length;
    const activeAttempts = attempts.filter((attempt) => attempt.success === null).length;
    const totalHintsUsed = attempts.reduce((sum, attempt) => sum + (attempt.hints_used ?? 0), 0);

    const successRate =
      completedAttempts.length === 0
        ? 0
        : (successfulAttempts / completedAttempts.length) * 100;

    return {
      successfulAttempts,
      failedAttempts,
      activeAttempts,
      totalHintsUsed,
      successRate,
    };
  }, [attempts]);

  const simulationsById = useMemo(() => {
    const map = new Map<string, SimulationDto>();
    for (const simulation of simulations) {
      map.set(simulation._id, simulation);
    }
    return map;
  }, [simulations]);

  const activeAttempts = useMemo(() => {
    return attempts.filter((attempt) => attempt.success === null);
  }, [attempts]);

  const primaryActiveAttempt = activeAttempts[0] ?? null;

  const completionPercent = useMemo(() => {
    if (totalLabs <= 0) return 0;
    return ((stats?.completed_labs ?? 0) / totalLabs) * 100;
  }, [stats?.completed_labs, totalLabs]);

  const badgeProgress = useMemo(() => {
    const currentExp = stats?.exp ?? 0;
    const next = getNextBadgeTarget(currentExp);
    if (next.label === 'MAX') {
      return {
        nextLabel: 'MAX',
        remaining: 0,
        progressPercent: 100,
      };
    }

    const previousTarget = next.target === 200 ? 0 : next.target === 500 ? 200 : 500;
    const range = Math.max(1, next.target - previousTarget);
    const progress = Math.min(100, Math.max(0, ((currentExp - previousTarget) / range) * 100));

    return {
      nextLabel: next.label,
      remaining: Math.max(0, next.target - currentExp),
      progressPercent: progress,
    };
  }, [stats?.exp]);

  async function handleQuickSubmit(token: string) {
    setSubmissionStatus('');
    const activeAttempts = attempts.filter((attempt) => attempt.success === null);

    if (activeAttempts.length === 0) {
      throw new Error('No active attempt found. Start a simulation first.');
    }

    if (activeAttempts.length > 1) {
      throw new Error('Multiple active attempts found. Submit from the simulation page.');
    }

    const activeAttempt = activeAttempts[0];
    const response = await attemptsApi.submitToken(activeAttempt._id, token);

    setAttempts((prev) =>
      prev.map((attempt) =>
        attempt._id === response.attempt._id ? response.attempt : attempt,
      ),
    );

    if (response.success) {
      setSubmissionStatus('Correct token. Attempt completed.');
      return;
    }

    const remaining = Math.max(0, 3 - response.attempts);
    setSubmissionStatus(`Incorrect token. ${remaining} attempt(s) remaining.`);
    throw new Error(`Incorrect token. ${remaining} attempt(s) remaining.`);
  }

  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen flex">
      <UserSidebar />

      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="scanline"></div>

        <header className="p-8 border-b border-slate-800 flex justify-between items-center backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">System Overview</h2>
            <p className="text-sm text-slate-500 italic">
              Tracking vulnerabilities and flag acquisitions...
            </p>
          </div>

          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase">Labs Completed</p>
              <p className="text-xl font-bold text-emerald-400">
                {isLoading ? '...' : `${stats?.completed_labs ?? 0} / ${totalLabs}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase">Current Score</p>
              <p className="text-xl font-bold text-cyan-400">
                {isLoading ? '...' : `${stats?.total_score ?? 0} XP`}
              </p>
            </div>
          </div>
        </header>

        <div className="p-8">
          {errorMessage ? (
            <section className="mb-8 rounded border border-red-800 bg-red-950/20 p-4 text-sm text-red-300">
              {errorMessage}
            </section>
          ) : null}

          {/* Flag Submission Section */}
          <section className="mb-12">
            <div className="bg-slate-900/50 p-6 border border-cyan-900/30 rounded-lg">
              <h3 className="text-cyan-400 text-xs font-bold uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
                Direct Flag Submission
              </h3>
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (primaryActiveAttempt) {
                      router.push(`/simulations/${primaryActiveAttempt.simulation_id}`);
                    }
                  }}
                  disabled={!primaryActiveAttempt}
                  className="bg-slate-950 border border-cyan-900 px-4 py-2 text-[11px] uppercase font-bold tracking-wide text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {primaryActiveAttempt ? 'Open Active Attempt' : 'No Active Attempt'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/attempts')}
                  className="bg-slate-950 border border-slate-700 px-4 py-2 text-[11px] uppercase font-bold tracking-wide text-slate-300"
                >
                  View All Attempts
                </button>
              </div>
              <QuickFlagSubmit onSubmit={handleQuickSubmit} />
              {submissionStatus ? (
                <p className="mt-3 text-xs text-slate-400">{submissionStatus}</p>
              ) : null}
            </div>
          </section>

          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <div className="rounded border border-slate-800 bg-slate-900/60 p-4">
                <div className="text-[11px] uppercase text-slate-500">Success Rate</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  {isLoading ? '...' : safePercent(dashboardMetrics.successRate)}
                </div>
              </div>
              <div className="rounded border border-slate-800 bg-slate-900/60 p-4">
                <div className="text-[11px] uppercase text-slate-500">Successful Attempts</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">
                  {isLoading ? '...' : dashboardMetrics.successfulAttempts}
                </div>
              </div>
              <div className="rounded border border-slate-800 bg-slate-900/60 p-4">
                <div className="text-[11px] uppercase text-slate-500">Failed Attempts</div>
                <div className="text-2xl font-bold text-red-400 mt-1">
                  {isLoading ? '...' : dashboardMetrics.failedAttempts}
                </div>
              </div>
              <div className="rounded border border-slate-800 bg-slate-900/60 p-4">
                <div className="text-[11px] uppercase text-slate-500">Active Attempts</div>
                <div className="text-2xl font-bold text-amber-300 mt-1">
                  {isLoading ? '...' : dashboardMetrics.activeAttempts}
                </div>
              </div>
              <div className="rounded border border-slate-800 bg-slate-900/60 p-4">
                <div className="text-[11px] uppercase text-slate-500">Hints Used</div>
                <div className="text-2xl font-bold text-slate-200 mt-1">
                  {isLoading ? '...' : dashboardMetrics.totalHintsUsed}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12 grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 rounded border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-cyan-300">
                  Progress Overview
                </h3>
                <span className="text-[11px] text-slate-500">BP-43 Dashboard</span>
              </div>

              <div className="mb-5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 uppercase">Lab Completion</span>
                  <span className="text-cyan-300 font-semibold">
                    {stats?.completed_labs ?? 0} / {totalLabs || 0}
                  </span>
                </div>
                <div className="h-2 rounded bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, completionPercent))}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 uppercase">Badge Progress</span>
                  <span className="text-emerald-300 font-semibold">
                    {badgeProgress.nextLabel === 'MAX'
                      ? 'Maximum badge reached'
                      : `${badgeProgress.remaining} XP to ${badgeProgress.nextLabel}`}
                  </span>
                </div>
                <div className="h-2 rounded bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${badgeProgress.progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="rounded border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wide text-cyan-300 mb-3">
                Completed Labs
              </h3>
              <div className="space-y-2 max-h-56 overflow-auto pr-1">
                {(stats?.completed_simulations ?? []).slice(0, 8).map((lab) => (
                  <div key={lab._id} className="rounded border border-slate-800 bg-slate-950/70 px-3 py-2">
                    <div className="text-xs text-cyan-300 font-semibold uppercase tracking-wide">
                      {lab.name}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500 flex justify-between">
                      <span>{lab.difficulty}</span>
                      <span className="text-emerald-400">+{lab.score} XP</span>
                    </div>
                  </div>
                ))}

                {!isLoading && (stats?.completed_simulations?.length ?? 0) === 0 ? (
                  <div className="text-xs text-slate-500">No completed labs yet.</div>
                ) : null}
              </div>
            </div>
          </section>

          {/* Active Attempts */}
          <section>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-white text-lg font-bold tracking-[0.2em] uppercase">
                  Active_Attempts.exe
                </h3>
                <div className="h-1 w-20 bg-cyan-500 mt-1"></div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Filter: [IN_PROGRESS]
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeAttempts.map((attempt) => {
                const simulation = simulationsById.get(attempt.simulation_id);
                return (
                  <div
                    key={attempt._id}
                    className="rounded border border-slate-800 bg-slate-900/60 p-5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-[10px] uppercase text-slate-500">Attempt ID</p>
                        <p className="text-xs text-slate-400 font-mono">{shortId(attempt._id)}</p>
                      </div>
                      <span className="text-[10px] uppercase text-amber-300 border border-amber-700 px-2 py-1">
                        Active
                      </span>
                    </div>

                    <h4 className="text-cyan-300 text-sm font-bold uppercase tracking-wide mb-2">
                      {simulation?.name ?? 'Simulation'}
                    </h4>

                    <p className="text-xs text-slate-500 mb-4">
                      Attempts used: {attempt.attempts.length} / 3 | Hints used: {attempt.hints_used}
                    </p>

                    <button
                      type="button"
                      onClick={() => router.push(`/simulations/${attempt.simulation_id}`)}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2 rounded text-xs uppercase"
                    >
                      Resume Attempt
                    </button>
                  </div>
                );
              })}

              {!isLoading && activeAttempts.length === 0 ? (
                <div className="md:col-span-2 xl:col-span-3 rounded border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-500">
                  No active attempts. Start one from the labs page.
                </div>
              ) : null}
            </div>
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
