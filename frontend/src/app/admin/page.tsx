'use client';
import AdminSidebar from '@/components/AdminSidebar';
import AdminControlButtons from '@/components/AdminControlButtons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import { getUsers, type User as PlatformUser } from '@/lib/api/users';
import { simulationsApi, type SimulationDto } from '@/lib/api/simulations';

const PAGE_SIZE = 100;

async function getAllUsers(): Promise<PlatformUser[]> {
  let page = 1;
  let totalPages = 1;
  const users: PlatformUser[] = [];

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

function toPercent(count: number, total: number) {
  if (total === 0) return '0%';
  return `${Math.round((count / total) * 100)}%`;
}

export default function AdminPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [simulations, setSimulations] = useState<SimulationDto[]>([]);

  if (user?.role !== 'ADMIN') return null;

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardStats() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [usersResponse, simulationsResponse] = await Promise.all([
          getAllUsers(),
          getAllSimulations(),
        ]);

        if (!isMounted) return;
        setUsers(usersResponse);
        setSimulations(simulationsResponse);
      } catch {
        if (!isMounted) return;
        setErrorMessage('Unable to load admin statistics right now.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const adminUsers = users.filter((item) => item.role === 'ADMIN').length;
    const participantUsers = users.filter((item) => item.role === 'PARTICIPANT').length;

    const totalLabs = simulations.length;
    const activeLabs = simulations.filter((item) => item.status === 'Active').length;
    const lockedLabs = simulations.filter((item) => item.status === 'Locked').length;

    const averageLabScore =
      totalLabs === 0
        ? 0
        : Math.round(
            simulations.reduce((sum, simulation) => sum + (simulation.score ?? 0), 0) / totalLabs,
          );

    const totalHints = simulations.reduce(
      (sum, simulation) => sum + (simulation.hint?.length ?? 0),
      0,
    );

    const difficultyCounts = {
      Easy: simulations.filter((item) => item.difficulty === 'Easy').length,
      Normal: simulations.filter((item) => item.difficulty === 'Normal').length,
      Hard: simulations.filter((item) => item.difficulty === 'Hard').length,
      Insane: simulations.filter((item) => item.difficulty === 'Insane').length,
    };

    return {
      totalUsers,
      adminUsers,
      participantUsers,
      totalLabs,
      activeLabs,
      lockedLabs,
      averageLabScore,
      totalHints,
      difficultyCounts,
    };
  }, [users, simulations]);

  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen flex">
      <AdminSidebar />

      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="scanline"></div>

        <header className="p-8 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-red-400">
                ADMIN_COMMAND_CENTER.exe
              </h2>
              <p className="text-sm text-slate-500 italic">
                Platform management and system administration...
              </p>
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

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-red-900/20 border border-red-900 p-6 rounded-lg">
              <div className="text-xs text-red-400 uppercase mb-2 font-bold">
                Total Users
              </div>
              <div className="text-3xl font-bold text-red-400">{isLoading ? '...' : metrics.totalUsers}</div>
              <div className="text-xs text-slate-500 mt-2">
                Admins: {metrics.adminUsers} | Participants: {metrics.participantUsers}
              </div>
            </div>
            <div className="bg-red-900/20 border border-red-900 p-6 rounded-lg">
              <div className="text-xs text-red-400 uppercase mb-2 font-bold">
                Total Labs
              </div>
              <div className="text-3xl font-bold text-red-400">{isLoading ? '...' : metrics.totalLabs}</div>
              <div className="text-xs text-slate-500 mt-2">
                Active: {metrics.activeLabs} | Locked: {metrics.lockedLabs}
              </div>
            </div>
            <div className="bg-red-900/20 border border-red-900 p-6 rounded-lg">
              <div className="text-xs text-red-400 uppercase mb-2 font-bold">
                Average Lab Score
              </div>
              <div className="text-3xl font-bold text-red-400">
                {isLoading ? '...' : metrics.averageLabScore}
              </div>
              <div className="text-xs text-slate-500 mt-2">Hints Configured: {metrics.totalHints}</div>
            </div>
            <div className="bg-red-900/20 border border-red-900 p-6 rounded-lg">
              <div className="text-xs text-red-400 uppercase mb-2 font-bold">
                Active Labs Ratio
              </div>
              <div className="text-3xl font-bold text-emerald-400">
                {isLoading ? '...' : toPercent(metrics.activeLabs, metrics.totalLabs)}
              </div>
              <div className="text-xs text-slate-500 mt-2">● Platform statistics synchronized</div>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <h3 className="text-red-400 font-bold uppercase text-sm mb-4">Difficulty Distribution</h3>
              <div className="space-y-3">
                {(['Easy', 'Normal', 'Hard', 'Insane'] as const).map((difficulty) => {
                  const count = metrics.difficultyCounts[difficulty];
                  const width = metrics.totalLabs === 0 ? 0 : (count / metrics.totalLabs) * 100;
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
              <h3 className="text-red-400 font-bold uppercase text-sm mb-4">User & Lab Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded border border-slate-800 bg-slate-950/70 p-4">
                  <div className="text-[11px] uppercase text-slate-500">Admin Users</div>
                  <div className="text-2xl font-bold text-red-300 mt-1">{metrics.adminUsers}</div>
                </div>
                <div className="rounded border border-slate-800 bg-slate-950/70 p-4">
                  <div className="text-[11px] uppercase text-slate-500">Participants</div>
                  <div className="text-2xl font-bold text-cyan-300 mt-1">{metrics.participantUsers}</div>
                </div>
                <div className="rounded border border-slate-800 bg-slate-950/70 p-4">
                  <div className="text-[11px] uppercase text-slate-500">Active Labs</div>
                  <div className="text-2xl font-bold text-emerald-300 mt-1">{metrics.activeLabs}</div>
                </div>
                <div className="rounded border border-slate-800 bg-slate-950/70 p-4">
                  <div className="text-[11px] uppercase text-slate-500">Locked Labs</div>
                  <div className="text-2xl font-bold text-amber-300 mt-1">{metrics.lockedLabs}</div>
                </div>
              </div>
            </div>
          </section>
        </div>

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
      </main>
    </div>
  );
}
