import AdminSidebar from '@/components/AdminSidebar';
import CreateSimulationForm from '@/components/CreateSimulationForm';
import AdminSimulationsPanel from '@/components/AdminSimulationsPanel';
import type { PaginatedSimulationsResponse } from '@/lib/api/simulations';

const API_BASE_URL = process.env.NEXT_API_URL || 'http://localhost:3000';
const DIFFICULTY_FILTERS = ['Easy', 'Normal', 'Hard', 'Insane'] as const;
const STATUS_FILTERS = ['Active', 'Locked'] as const;

function parseDifficultyFilter(value?: string) {
  if (!value) return undefined;
  return DIFFICULTY_FILTERS.includes(value as (typeof DIFFICULTY_FILTERS)[number])
    ? value
    : undefined;
}

function parseStatusFilter(value?: string) {
  if (!value) return undefined;
  return STATUS_FILTERS.includes(value as (typeof STATUS_FILTERS)[number])
    ? value
    : undefined;
}

function getSearchParamValue(
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parsePositiveInt(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

async function getSimulations(
  page: number,
  limit: number,
  difficulty?: string,
  status?: string,
): Promise<PaginatedSimulationsResponse> {
  const fallback: PaginatedSimulationsResponse = {
    data: [],
    page,
    limit,
    total: 0,
    totalPages: 0,
  };

  try {
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (difficulty) {
      queryParams.set('difficulty', difficulty);
    }

    if (status) {
      queryParams.set('status', status);
    }

    const response = await fetch(`${API_BASE_URL}/simulations?${queryParams.toString()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return fallback;
    }

    const result = (await response.json()) as PaginatedSimulationsResponse;
    return result;
  } catch {
    return fallback;
  }
}

type SearchParams = {
  page?: string | string[];
  limit?: string | string[];
  difficulty?: string | string[];
  status?: string | string[];
};

export default async function AdminLabsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const page = parsePositiveInt(
    getSearchParamValue(resolvedSearchParams?.page),
    1,
    1,
    1000,
  );

  const limit = parsePositiveInt(
    getSearchParamValue(resolvedSearchParams?.limit),
    4,
    1,
    50,
  );

  const difficulty = parseDifficultyFilter(getSearchParamValue(resolvedSearchParams?.difficulty));
  const status = parseStatusFilter(getSearchParamValue(resolvedSearchParams?.status));

  const simulations = await getSimulations(page, limit, difficulty, status);

  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen flex">
      <AdminSidebar />

      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="p-8 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-red-400">ADMIN_LABS_PANEL.exe</h2>
          <p className="text-sm text-slate-500 italic">
            Manage simulations and create new lab entries...
          </p>
        </div>

        <div className="p-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
          <AdminSimulationsPanel
            simulations={simulations.data}
            total={simulations.total}
            page={simulations.page}
            limit={simulations.limit}
            totalPages={simulations.totalPages}
            initialDifficulty={difficulty}
            initialStatus={status}
          />

          <div className="xl:sticky xl:top-24 self-start">
            <CreateSimulationForm />
          </div>
        </div>
      </main>
    </div>
  );
}
