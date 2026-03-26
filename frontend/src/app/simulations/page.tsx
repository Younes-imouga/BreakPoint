'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserSidebar from '@/components/UserSidebar';
import SimulationCard from '@/components/SimulationCard';
import LabFilters from '@/components/LabFilters';
import LabSearchBar from '@/components/LabSearchBar';
import { attemptsApi, type AttemptDto } from '@/lib/api/attempts';
import { simulationsApi, type SimulationDto } from '@/lib/api/simulations';
import { getMyStats, type UserStats } from '@/lib/api/users';

function toCardDifficulty(difficulty: SimulationDto['difficulty']): 'Easy' | 'Medium' | 'Hard' | 'Insane' {
  if (difficulty === 'Normal') {
    return 'Medium';
  }
  return difficulty;
}

function shortId(value: string) {
  if (!value) return 'N/A';
  if (value.length <= 10) return value;
  return `${value.slice(0, 6)}...`;
}

function extractErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response =
      (error as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) {
      return message[0] ?? fallback;
    }
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export default function SimulationsPage() {
  const router = useRouter();
  const [simulations, setSimulations] = useState<SimulationDto[]>([]);
  const [attempts, setAttempts] = useState<AttemptDto[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All Labs');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [simulationsResponse, attemptsResponse, statsResponse] = await Promise.all([
          simulationsApi.getAll(1, 100, { status: 'Active' }),
          attemptsApi.getMyAttempts(),
          getMyStats(),
        ]);

        if (!isMounted) {
          return;
        }

        setSimulations(simulationsResponse.data);
        setAttempts(attemptsResponse);
  setUserStats(statsResponse);
      } catch {
        if (!isMounted) {
          return;
        }
        setErrorMessage('Unable to load active simulations right now.');
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

  const activeAttemptBySimulationId = useMemo(() => {
    const map = new Map<string, AttemptDto>();

    for (const attempt of attempts) {
      if (attempt.success === null) {
        map.set(attempt.simulation_id, attempt);
      }
    }

    return map;
  }, [attempts]);

  const completedSimulationIds = useMemo(() => {
    return new Set(
      attempts
        .filter((attempt) => attempt.success === true)
        .map((attempt) => attempt.simulation_id),
    );
  }, [attempts]);

  const filteredSimulations = useMemo(() => {
    return simulations.filter((simulation) => {
      const matchesSearch = simulation.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());

      const isCompleted = completedSimulationIds.has(simulation._id);

      const matchesFilter =
        filter === 'All Labs' ||
        (filter === 'Completed' && isCompleted) ||
        (filter === 'Incomplete' && !isCompleted);

      return matchesSearch && matchesFilter;
    });
  }, [simulations, searchQuery, filter, completedSimulationIds]);

  async function handleLabAction(simulationId: string) {
    setErrorMessage('');

    const simulation = simulations.find((item) => item._id === simulationId);
    const userExp = userStats?.exp ?? 0;

    const isCompleted = completedSimulationIds.has(simulationId);
    const isLockedForExp = !isCompleted && simulation && simulation.minimum_exp > userExp;

    if (isLockedForExp && simulation) {
      setErrorMessage(`[ Access_Denied: Requires ${simulation.minimum_exp} XP ]`);
      return;
    }

    const hasActiveAttempt = activeAttemptBySimulationId.has(simulationId);
    if (hasActiveAttempt) {
      router.push(`/simulations/${simulationId}`);
      return;
    }

    try {
      const createdAttempt = await attemptsApi.create(simulationId);
      setAttempts((prev) => [createdAttempt, ...prev]);
      router.push(`/simulations/${simulationId}`);
    } catch (error) {
      setErrorMessage(
        extractErrorMessage(
          error,
          'You already have an active attempt. Complete it before starting a new one.',
        ),
      );
    }
  }

  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen flex">
      <UserSidebar />

      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="scanline"></div>

        <header className="p-8 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Lab_Catalogue.exe</h2>
            <p className="text-sm text-slate-500 italic">
              All available security labs and vulnerabilities...
            </p>
          </div>
        </header>

        <div className="p-8">
          {/* Filters */}
          <section className="mb-12 flex gap-4 flex-wrap">
            <LabFilters
              filters={['All Labs', 'Incomplete', 'Completed']}
              onFilterChange={setFilter}
            />
            <div className="ml-auto flex gap-2">
              <LabSearchBar onSearch={setSearchQuery} />
            </div>
          </section>

          {errorMessage ? (
            <section className="mb-8 rounded border border-red-800 bg-red-950/20 p-4 text-sm text-red-300">
              {errorMessage}
            </section>
          ) : null}

          {/* Labs Grid */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSimulations.map((lab) => {
                const hasActiveAttempt = activeAttemptBySimulationId.has(lab._id);
                const isCompleted = completedSimulationIds.has(lab._id);
                const userExp = userStats?.exp ?? 0;
                const isLockedForExp = !isCompleted && lab.minimum_exp > userExp;

                return (
                  <SimulationCard
                    key={lab._id}
                    id={shortId(lab._id)}
                    name={lab.name}
                    description={lab.description}
                    difficulty={toCardDifficulty(lab.difficulty)}
                    xp={lab.score}
                    progress={isCompleted ? 100 : hasActiveAttempt ? 50 : 0}
                    isLocked={isLockedForExp}
                    requiredXP={lab.minimum_exp}
                    actionLabel={
                      isCompleted
                        ? 'Completed'
                        : isLockedForExp
                          ? 'Locked'
                          : hasActiveAttempt
                            ? 'Resume_Lab'
                            : 'Start_Attempt'
                    }
                    actionDisabled={isCompleted || isLockedForExp}
                    onAction={() => {
                      void handleLabAction(lab._id);
                    }}
                  />
                );
              })}

              {!isLoading && filteredSimulations.length === 0 ? (
                <div className="md:col-span-2 xl:col-span-3 rounded border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-500">
                  No active simulations match the current filter.
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
