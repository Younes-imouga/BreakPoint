'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  simulationsApi,
  type SimulationDto,
  type SimulationPayload,
} from '@/lib/api/simulations';

const INITIAL_FORM: SimulationPayload = {
  name: '',
  description: '',
  difficulty: 'Easy',
  token_count: 1,
  minimum_exp: 0,
  status: 'Locked',
  hint: [],
  score: 100,
};

type CreateSimulationFormProps = {
  selectedSimulation?: SimulationDto | null;
  onSaved?: () => void;
  onCancelEdit?: () => void;
};

export default function CreateSimulationForm({
  selectedSimulation,
  onSaved,
  onCancelEdit,
}: CreateSimulationFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<SimulationPayload>(INITIAL_FORM);
  const [hintsInput, setHintsInput] = useState('');
  const [componentFileName, setComponentFileName] = useState('simulation.html');
  const [componentLanguage, setComponentLanguage] = useState('html');
  const [componentContent, setComponentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isEditMode = useMemo(() => Boolean(selectedSimulation), [selectedSimulation]);

  useEffect(() => {
    if (!selectedSimulation) {
      setForm(INITIAL_FORM);
      setHintsInput('');
      setComponentFileName('simulation.html');
      setComponentLanguage('html');
      setComponentContent('');
      setErrorMessage('');
      setSuccessMessage('');
      return;
    }

    const firstComponent = selectedSimulation.components?.[0];

    setForm({
      name: selectedSimulation.name,
      description: selectedSimulation.description,
      difficulty: selectedSimulation.difficulty,
      token_count: selectedSimulation.token_count,
      minimum_exp: selectedSimulation.minimum_exp,
      status: selectedSimulation.status,
      hint: selectedSimulation.hint ?? [],
      score: selectedSimulation.score,
    });
    setHintsInput((selectedSimulation.hint ?? []).join('\n'));
    setComponentFileName(firstComponent?.fileName ?? 'simulation.html');
    setComponentLanguage(firstComponent?.language ?? 'html');
    setComponentContent(firstComponent?.content ?? '');
    setErrorMessage('');
    setSuccessMessage('');
  }, [selectedSimulation]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const payload: SimulationPayload = {
      ...form,
      hint: hintsInput
        .split('\n')
        .map((hint) => hint.trim())
        .filter(Boolean),
    };

    const trimmedContent = componentContent.trim();
    if (trimmedContent) {
      payload.components = [
        {
          fileName: componentFileName.trim() || 'simulation.html',
          language: componentLanguage.trim() || 'html',
          content: trimmedContent,
        },
      ];
    } else {
      payload.components = undefined;
    }

    try {
      setIsSubmitting(true);
      if (selectedSimulation?._id) {
        await simulationsApi.update(selectedSimulation._id, payload);
        setSuccessMessage('Simulation updated successfully.');
      } else {
        await simulationsApi.create(payload);
        setSuccessMessage('Simulation created successfully.');
      }

      setForm(INITIAL_FORM);
      setHintsInput('');
      setComponentFileName('simulation.html');
      setComponentLanguage('html');
      setComponentContent('');

      if (onSaved) {
        onSaved();
      }

      router.refresh();
    } catch (error: unknown) {
      let message = isEditMode
        ? 'Failed to edit simulation.'
        : 'Failed to create simulation.';

      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object' &&
        (error as { response?: unknown }).response !== null
      ) {
        const responseData = (error as { response: { data?: unknown } }).response.data;
        if (typeof responseData === 'string') {
          message = responseData;
        } else if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'message' in responseData
        ) {
          const maybeMessage = (responseData as { message?: unknown }).message;
          if (typeof maybeMessage === 'string') {
            message = maybeMessage;
          } else if (Array.isArray(maybeMessage)) {
            message = maybeMessage.join(', ');
          }
        }
      }

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
      <h3 className="text-red-400 font-bold uppercase text-sm mb-4">
        {isEditMode ? 'Edit Simulation' : 'Create Simulation'}
      </h3>
      <p className="text-xs text-slate-500 mb-6">
        {isEditMode
          ? 'Update fields and save your changes.'
          : 'Fill in all fields to create a new simulation.'}
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-xs text-slate-400 mb-2 uppercase">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="SQL_INJECTION_BASIC"
            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-xs text-slate-400 mb-2 uppercase">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="Describe what this simulation teaches..."
            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="difficulty" className="block text-xs text-slate-400 mb-2 uppercase">
              Difficulty
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={form.difficulty}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  difficulty: event.target.value as SimulationPayload['difficulty'],
                }))
              }
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              <option value="Easy">Easy</option>
              <option value="Normal">Normal</option>
              <option value="Hard">Hard</option>
              <option value="Insane">Insane</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-xs text-slate-400 mb-2 uppercase">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  status: event.target.value as SimulationPayload['status'],
                }))
              }
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              <option value="Active">Active</option>
              <option value="Locked">Locked</option>
            </select>
          </div>

          <div>
            <label htmlFor="token_count" className="block text-xs text-slate-400 mb-2 uppercase">
              Token Count
            </label>
            <input
              id="token_count"
              name="token_count"
              type="number"
              min={1}
              value={form.token_count ?? 1}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  token_count: Number(event.target.value || 0),
                }))
              }
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="minimum_exp" className="block text-xs text-slate-400 mb-2 uppercase">
              Minimum EXP
            </label>
            <input
              id="minimum_exp"
              name="minimum_exp"
              type="number"
              min={0}
              value={form.minimum_exp ?? 0}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  minimum_exp: Number(event.target.value || 0),
                }))
              }
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="score" className="block text-xs text-slate-400 mb-2 uppercase">
              Score
            </label>
            <input
              id="score"
              name="score"
              type="number"
              min={0}
              value={form.score ?? 100}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  score: Number(event.target.value || 0),
                }))
              }
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="hint" className="block text-xs text-slate-400 mb-2 uppercase">
            Hints (one per line)
          </label>
          <textarea
            id="hint"
            name="hint"
            rows={4}
            value={hintsInput}
            onChange={(event) => setHintsInput(event.target.value)}
            placeholder={"Hint 1\nHint 2\nHint 3"}
            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <h4 className="text-xs text-slate-400 mb-2 uppercase">Lab Component</h4>
          <p className="text-[10px] text-slate-500 mb-3">
            Define the vulnerable lab component that will be rendered for this simulation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label htmlFor="component_fileName" className="block text-[10px] text-slate-500 mb-1 uppercase">
                File Name
              </label>
              <input
                id="component_fileName"
                type="text"
                value={componentFileName}
                onChange={(event) => setComponentFileName(event.target.value)}
                placeholder="simulation.html"
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label htmlFor="component_language" className="block text-[10px] text-slate-500 mb-1 uppercase">
                Language
              </label>
              <input
                id="component_language"
                type="text"
                value={componentLanguage}
                onChange={(event) => setComponentLanguage(event.target.value)}
                placeholder="html"
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs"
              />
            </div>
          </div>

          <label htmlFor="component_content" className="block text-[10px] text-slate-500 mb-1 uppercase">
            Component Markup (HTML)
          </label>
          <textarea
            id="component_content"
            rows={10}
            value={componentContent}
            onChange={(event) => setComponentContent(event.target.value)}
            placeholder="Paste the lab HTML/markup here. Use ATTEMPT_TOKEN where the attempt token should appear."
            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-900/40 border border-red-700 text-red-300 font-bold py-2 rounded disabled:opacity-60"
        >
          {isSubmitting
            ? isEditMode
              ? 'EDITING_SIMULATION...'
              : 'CREATING_SIMULATION...'
            : isEditMode
              ? 'EDIT_SIMULATION'
              : 'CREATE_SIMULATION'}
        </button>

        {isEditMode ? (
          <button
            type="button"
            onClick={() => {
              setForm(INITIAL_FORM);
              setHintsInput('');
              setErrorMessage('');
              setSuccessMessage('');
              setComponentFileName('simulation.html');
              setComponentLanguage('html');
              setComponentContent('');
              onCancelEdit?.();
            }}
            className="w-full bg-slate-900 border border-slate-700 text-slate-300 font-bold py-2 rounded hover:bg-slate-800"
          >
            CANCEL_EDIT
          </button>
        ) : null}

        {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-400">{successMessage}</p> : null}
      </form>
    </section>
  );
}
