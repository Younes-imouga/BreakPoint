'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { SimulationDto } from '@/lib/api/simulations';

type DifficultyFilter = SimulationDto['difficulty'] | 'ALL';
type StatusFilter = SimulationDto['status'] | 'ALL';

type AdminSimulationsPanelProps = {
  simulations: SimulationDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  initialDifficulty?: string;
  initialStatus?: string;
  selectedSimulationId?: string | null;
  deletingId?: string | null;
  onEdit: (simulation: SimulationDto) => void;
  onDelete: (simulationId: string) => void;
};

const DIFFICULTY_OPTIONS: DifficultyFilter[] = ['ALL', 'Easy', 'Normal', 'Hard', 'Insane'];
const STATUS_OPTIONS: StatusFilter[] = ['ALL', 'Active', 'Locked'];
const PAGE_SIZE_OPTIONS = [2, 4, 8, 50];

function formatDate(date?: string) {
  if (!date) return 'N/A';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleString();
}

function shortValue(value?: string) {
  if (!value) return 'N/A';
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function difficultyClass(difficulty: string) {
  if (difficulty === 'Easy') return 'text-emerald-300 border-emerald-800 bg-emerald-950/40';
  if (difficulty === 'Normal') return 'text-cyan-300 border-cyan-800 bg-cyan-950/40';
  if (difficulty === 'Hard') return 'text-amber-300 border-amber-800 bg-amber-950/40';
  return 'text-red-300 border-red-800 bg-red-950/40';
}

function parseDifficulty(value?: string): DifficultyFilter {
  if (!value) return 'ALL';
  return DIFFICULTY_OPTIONS.includes(value as DifficultyFilter)
    ? (value as DifficultyFilter)
    : 'ALL';
}

function parseStatus(value?: string): StatusFilter {
  if (!value) return 'ALL';
  return STATUS_OPTIONS.includes(value as StatusFilter) ? (value as StatusFilter) : 'ALL';
}

export default function AdminSimulationsPanel({
  simulations,
  total,
  page,
  limit,
  totalPages,
  initialDifficulty,
  initialStatus,
  selectedSimulationId,
  deletingId,
  onEdit,
  onDelete,
}: AdminSimulationsPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedDifficulty = parseDifficulty(initialDifficulty);
  const selectedStatus = parseStatus(initialStatus);

  const updateQueryParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <section className="xl:col-span-2 bg-slate-900/50 border border-slate-800 rounded-lg p-6 ">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-red-400 font-bold uppercase text-sm">Simulation List</h3>
          <span className="text-xs text-slate-500">
            Showing {simulations.length} on page {page} of {totalPages || 1} (Total: {total})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="difficulty-filter" className="block text-[11px] uppercase text-slate-500 mb-2">
              Filter Difficulty
            </label>
            <select
              id="difficulty-filter"
              value={selectedDifficulty}
              onChange={(event) => {
                const value = event.target.value;
                updateQueryParams({
                  difficulty: value === 'ALL' ? undefined : value,
                  page: '1',
                });
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              {DIFFICULTY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status-filter" className="block text-[11px] uppercase text-slate-500 mb-2">
              Filter Status
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(event) => {
                const value = event.target.value;
                updateQueryParams({
                  status: value === 'ALL' ? undefined : value,
                  page: '1',
                });
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="page-size" className="block text-[11px] uppercase text-slate-500 mb-2">
              Per Page
            </label>
            <select
              id="page-size"
              value={String(limit)}
              onChange={(event) => {
                updateQueryParams({
                  limit: event.target.value,
                  page: '1',
                });
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {simulations.length === 0 ? (
        <div className="rounded border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-500">
          No simulations matched the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
          {simulations.map((simulation) => (
            <article
              key={simulation._id}
              className={`rounded-lg border bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-[0_0_0_1px_rgba(30,41,59,0.3)] ${
                selectedSimulationId === simulation._id
                  ? 'border-cyan-500/80'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-cyan-300 font-bold text-lg tracking-wide wrap-break-word">
                    {simulation.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 font-mono">ID: {simulation._id}</p>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded border ${difficultyClass(simulation.difficulty)}`}
                  >
                    {simulation.difficulty}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded border ${
                      simulation.status === 'Active'
                        ? 'text-emerald-300 border-emerald-800 bg-emerald-950/40'
                        : 'text-slate-300 border-slate-700 bg-slate-900/60'
                    }`}
                  >
                    {simulation.status}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-300 mt-4 leading-relaxed wrap-break-word">
                {simulation.description}
              </p>

              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="rounded border border-slate-800 bg-slate-950/70 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Score</div>
                  <div className="text-red-300 font-semibold mt-1">{simulation.score}</div>
                </div>
                <div className="rounded border border-slate-800 bg-slate-950/70 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Tokens</div>
                  <div className="text-cyan-300 font-semibold mt-1">{simulation.token_count}</div>
                </div>
                <div className="rounded border border-slate-800 bg-slate-950/70 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Min EXP</div>
                  <div className="text-amber-300 font-semibold mt-1">{simulation.minimum_exp}</div>
                </div>
              </div>

              <div className="mt-5 rounded border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">Hints</div>
                {simulation.hint && simulation.hint.length > 0 ? (
                  <ul className="space-y-1 text-sm text-slate-300 list-disc list-inside">
                    {simulation.hint.map((hint, index) => (
                      <li key={`${simulation._id}-hint-${index}`}>{hint}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No hints configured.</p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 space-y-1 text-xs text-slate-500 font-mono">
                <div>Created by: {shortValue(simulation.createdBy)}</div>
                <div>Created at: {formatDate(simulation.createdAt)}</div>
                <div>Updated at: {formatDate(simulation.updatedAt)}</div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(simulation)}
                  className="flex-1 px-3 py-2 text-xs uppercase tracking-wide rounded border border-cyan-700 text-cyan-300 hover:bg-cyan-900/30"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={deletingId === simulation._id}
                  onClick={() => onDelete(simulation._id)}
                  className="flex-1 px-3 py-2 text-xs uppercase tracking-wide rounded border border-red-700 text-red-300 hover:bg-red-900/30 disabled:opacity-60"
                >
                  {deletingId === simulation._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => updateQueryParams({ page: String(page - 1) })}
          className="px-4 py-2 text-sm rounded border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
        >
          Previous
        </button>

        <div className="text-xs text-slate-500">
          Page {page} of {totalPages || 1}
        </div>

        <button
          type="button"
          disabled={!hasNext}
          onClick={() => updateQueryParams({ page: String(page + 1) })}
          className="px-4 py-2 text-sm rounded border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
        >
          Next
        </button>
      </div>
    </section>
  );
}
