'use client';
import { useEffect, useMemo, useState } from 'react';
import UserSidebar from '@/components/UserSidebar';
import SimulationCard from '@/components/SimulationCard';
import QuickFlagSubmit from '@/components/QuickFlagSubmit';
import { attemptsApi, type AttemptDto } from '@/lib/api/attempts';
import { simulationsApi, type SimulationDto } from '@/lib/api/simulations';
import { getMyStats, type UserStats } from '@/lib/api/users';

function toCardDifficulty(difficulty: SimulationDto['difficulty']): 'Easy' | 'Medium' | 'Hard' | 'Insane' {
  if (difficulty === 'Normal') return 'Medium';
  return difficulty;
}

function shortId(value: string) {
  if (!value) return 'N/A';
  if (value.length <= 10) return value;
  return `${value.slice(0, 6)}...`;
}

function safePercent(value: number) {
  return Number.isFinite(value) ? `${value.toFixed(0)}%` : '0%';
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [attempts, setAttempts] = useState<AttemptDto[]>([]);
  const [featuredLabs, setFeaturedLabs] = useState<SimulationDto[]>([]);
  const [totalLabs, setTotalLabs] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [statsResponse, attemptsResponse, simulationsResponse] = await Promise.all([
          getMyStats(),
          attemptsApi.getMyAttempts(),
          simulationsApi.getAll(1, 3),
        ]);

        if (!isMounted) return;

        setStats(statsResponse);
        setAttempts(attemptsResponse);
        setFeaturedLabs(simulationsResponse.data);
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

  const completedSimulationIds = useMemo(() => {
    const items = stats?.completed_simulations ?? [];
    return new Set(items.map((simulation) => simulation._id));
  }, [stats]);

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
              <QuickFlagSubmit onSubmit={(flag) => console.log('Flag submitted:', flag)} />
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

          {/* Active Processes */}
          <section>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-white text-lg font-bold tracking-[0.2em] uppercase">
                  Active_Processes.exe
                </h3>
                <div className="h-1 w-20 bg-cyan-500 mt-1"></div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Filter: [ALL_SYSTEMS_GO]
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {featuredLabs.map((lab) => (
                <SimulationCard
                  key={lab._id}
                  id={shortId(lab._id)}
                  name={lab.name}
                  description={lab.description}
                  difficulty={toCardDifficulty(lab.difficulty)}
                  xp={lab.score}
                  progress={completedSimulationIds.has(lab._id) ? 100 : 0}
                  isLocked={lab.status === 'Locked'}
                  requiredXP={lab.minimum_exp}
                />
              ))}

              {!isLoading && featuredLabs.length === 0 ? (
                <div className="md:col-span-2 xl:col-span-3 rounded border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-500">
                  No simulations available right now.
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
