'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserSidebar from '@/components/UserSidebar';
import TokenSubmitForm from '@/components/TokenSubmitForm';
import HintDisplay from '@/components/HintDisplay';
import CommentForm from '@/components/CommentForm';
import LabControlButtons from '@/components/LabControlButtons';
import { attemptsApi, type AttemptDto } from '@/lib/api/attempts';
import { simulationsApi, type SimulationDto } from '@/lib/api/simulations';

function toTextDifficulty(difficulty: SimulationDto['difficulty']) {
  return difficulty === 'Normal' ? 'Medium' : difficulty;
}

export default function SimulationDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const simulationId = String(params?.id ?? '');

  const [simulation, setSimulation] = useState<SimulationDto | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<AttemptDto | null>(null);
    const [isCompletedSimulation, setIsCompletedSimulation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingAttempt, setIsStartingAttempt] = useState(false);
  const [isGivingUp, setIsGivingUp] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!simulationId) {
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const [simulationResponse, attemptsResponse] = await Promise.all([
          simulationsApi.getById(simulationId),
          attemptsApi.getMyAttempts(),
        ]);

        if (!isMounted) {
          return;
        }

        const attemptsForSimulation = attemptsResponse.filter(
          (attempt) => attempt.simulation_id === simulationId,
        );

        const existingAttempt =
          attemptsForSimulation.find((attempt) => attempt.success === null) ?? null;

        const completedAttempt =
          attemptsForSimulation.find((attempt) => attempt.success === true) ?? null;

        const selectedAttempt = existingAttempt ?? completedAttempt ?? null;

        setSimulation(simulationResponse);
        setActiveAttempt(selectedAttempt);
        setIsCompletedSimulation(Boolean(completedAttempt));
        setHintsRemaining(Math.max(0, 3 - (selectedAttempt?.hints_used ?? 0)));
      } catch {
        if (!isMounted) {
          return;
        }
        setErrorMessage('Unable to load this simulation right now.');
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
  }, [simulationId]);

  const attemptsUsed = useMemo(() => {
    return activeAttempt?.attempts?.length ?? 0;
  }, [activeAttempt]);

  const isSubmissionLocked = useMemo(() => {
    if (!activeAttempt) return true;
    if (activeAttempt.success !== null) return true;
    return attemptsUsed >= 3;
  }, [activeAttempt, attemptsUsed]);

  const runtimeComponentContent = useMemo(() => {
    return activeAttempt?.component?.content ?? "null";
  }, [activeAttempt]);

  async function handleStartAttempt() {
    if (!simulationId) {
      return;
    }

    if (isCompletedSimulation) {
      setErrorMessage('You have already completed this lab. Labs can only be completed once.');
      return;
    }

    setStatusMessage('');
    setErrorMessage('');
    setIsStartingAttempt(true);

    try {
      const createdAttempt = await simulationsApi.start(simulationId);
      setActiveAttempt(createdAttempt);
      setHintsRemaining(Math.max(0, 3 - (createdAttempt.hints_used ?? 0)));
      setCurrentHint(null);
      setStatusMessage('Attempt started. Submit your token when ready.');
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : 'Unable to start attempt.';
      setErrorMessage(nextMessage);
    } finally {
      setIsStartingAttempt(false);
    }
  }

  async function handleSubmitToken(token: string) {
    if (!activeAttempt) {
      throw new Error('Start an attempt first.');
    }

    if (activeAttempt.success !== null || (activeAttempt.attempts?.length ?? 0) >= 3) {
      throw new Error('Attempt already failed. Start a new attempt.');
    }

    setStatusMessage('');
    setErrorMessage('');

    const result = await attemptsApi.submitToken(activeAttempt._id, token);
    setActiveAttempt(result.attempt);

    if (result.success) {
      setStatusMessage('Correct token. Simulation completed successfully.');
      return;
    }

    if (result.attempt.success === false) {
      setStatusMessage('Incorrect token. Attempt failed after 3 submissions.');
      throw new Error('Attempt failed after 3 submissions.');
    }

    const remaining = Math.max(0, 3 - result.attempts);
    setStatusMessage(`Incorrect token. ${remaining} attempt(s) remaining.`);
    throw new Error(`Incorrect token. ${remaining} attempt(s) remaining.`);
  }

  async function handleRequestHint() {
    if (!activeAttempt) {
      setErrorMessage('Start an attempt before requesting hints.');
      return;
    }

    setStatusMessage('');
    setErrorMessage('');

    try {
      const result = await attemptsApi.getHintForAttempt(activeAttempt._id);
      setCurrentHint(result.hint);
      setHintsRemaining(result.remaining);
      setStatusMessage(result.hint ? 'Hint received.' : 'No hints remaining.');
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : 'Unable to fetch hint.';
      setErrorMessage(nextMessage);
    }
  }

  async function handleGiveUp() {
    if (!activeAttempt) {
      setErrorMessage('No active attempt to give up.');
      return;
    }

    setIsGivingUp(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      await attemptsApi.giveUp(activeAttempt._id);
      setActiveAttempt(null);
      setCurrentHint(null);
      setHintsRemaining(0);
      setStatusMessage('Attempt marked as failed. You can start again.');
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : 'Unable to give up.';
      setErrorMessage(nextMessage);
    } finally {
      setIsGivingUp(false);
    }
  }

  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen flex overflow-hidden">
      <UserSidebar />

      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="scanline"></div>

        <header className="p-6 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-cyan-400">
                {isLoading ? 'Loading...' : simulation?.name ?? 'Simulation'}
              </h2>
              <p className="text-sm text-slate-500 italic">
                {simulation
                  ? `${toTextDifficulty(simulation.difficulty)} difficulty | ${simulation.score} XP`
                  : 'Vulnerable Target Application'}
              </p>
            </div>
            <LabControlButtons
              onReset={() => {
                setCurrentHint(null);
                setStatusMessage('Local view reset.');
              }}
              onBack={() => router.push('/simulations')}
            />
          </div>
        </header>

        <div className="p-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-h-[600px] flex flex-col">
            <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden flex flex-col h-full shadow-2xl">
              <div className="website-frame p-3 border-b border-slate-600 space-y-2">
                <div className="flex items-center gap-2 bg-white/10 rounded px-3 py-2">
                  <span className="text-slate-600 text-xs">◄ ► ⟲</span>
                  <div className="flex-1 bg-white/5 rounded px-2 py-1">
                    <span className="text-xs text-slate-600">
                      https://vulnerable-lab.local/{simulationId || 'simulation'}
                    </span>
                  </div>
                  <span className="text-slate-600 text-xs">⭐ ☰</span>
                </div>
              </div>

              {runtimeComponentContent ? (
                <iframe
                  title="Simulation Runtime"
                  className="website-content flex-1 w-full"
                  sandbox="allow-modals allow-scripts allow-forms allow-same-origin"
                  srcDoc={runtimeComponentContent}
                />
              ) : (
                <div className="website-content flex-1 overflow-y-auto p-8">
                  <div className="mb-8 pb-6 border-b-2 border-gray-300">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      BreakPoint Lab Runtime
                    </h1>
                    <p className="text-gray-600 italic">
                      Explore inputs, inspect responses, and find the token.
                    </p>
                  </div>

                  <article className="mb-8 p-6 bg-white rounded-lg shadow border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {simulation?.name ?? 'Simulation Objective'}
                    </h2>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {simulation?.description ??
                        'Start an attempt to activate this simulation and begin testing.'}
                    </p>
                  </article>

                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Lab Notes</h3>
                    <CommentForm
                      onSubmit={(data) => {
                        console.log('Comment submitted:', data);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="w-80 space-y-6">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-5">
              <h3 className="text-cyan-400 font-bold uppercase text-xs mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                Mission Objective
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Find and submit the correct token to complete this simulation.
                You have up to 3 token submissions per attempt.
              </p>
            </div>

            {!activeAttempt ? (
              <div className="bg-slate-900 border border-cyan-900 rounded-lg p-5 space-y-3">
                <h3 className="text-cyan-400 font-bold uppercase text-xs">Start Attempt</h3>
                <p className="text-xs text-slate-400">
                  Launch this simulation to receive an active attempt session.
                </p>
                <button
                  onClick={handleStartAttempt}
                  disabled={
                    isStartingAttempt ||
                    isLoading ||
                    !simulation ||
                    simulation.status !== 'Active' ||
                    isCompletedSimulation
                  }
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2 rounded uppercase text-xs transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isStartingAttempt ? 'Starting...' : 'Start_Attempt'}
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-5">
                <h3 className="text-cyan-400 font-bold uppercase text-xs mb-2">Active Attempt</h3>
                <p className="text-xs text-slate-500 break-all">ID: {activeAttempt._id}</p>
              </div>
            )}

            {statusMessage ? (
              <div className="rounded border border-emerald-900 bg-emerald-950/20 p-3 text-xs text-emerald-300">
                {statusMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded border border-red-900 bg-red-950/20 p-3 text-xs text-red-300">
                {errorMessage}
              </div>
            ) : null}

            <TokenSubmitForm
              attemptId={activeAttempt?._id}
              attemptsUsed={attemptsUsed}
              maxAttempts={3}
              isLocked={isSubmissionLocked}
              lockMessage={
                activeAttempt?.success === false
                  ? 'Attempt failed after 3 submissions. Start a new attempt.'
                  : undefined
              }
              onSubmit={handleSubmitToken}
            />

            <HintDisplay
              hintsRemaining={hintsRemaining}
              currentHint={currentHint}
              onRequestHint={handleRequestHint}
            />

            <div className="bg-red-900/20 border border-red-900 rounded-lg p-5">
              <button
                onClick={handleGiveUp}
                disabled={!activeAttempt || isGivingUp}
                className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-900 text-red-400 font-bold py-2 rounded uppercase text-xs transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGivingUp ? 'Processing...' : 'Give_Up'}
              </button>
            </div>

          </aside>
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
        .website-frame {
          background: linear-gradient(135deg, #f5f1e8 0%, #e8dcc8 100%);
        }
        .website-content {
          background: #fafaf5;
          color: #333;
        }
      `}</style>
    </div>
  );
}
