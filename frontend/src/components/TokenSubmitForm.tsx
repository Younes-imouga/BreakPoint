'use client';
import { useState } from 'react';

interface TokenSubmitFormProps {
  attemptId?: string;
  attemptsUsed?: number;
  maxAttempts?: number;
  isLocked?: boolean;
  lockMessage?: string;
  onSubmit?: (token: string) => void | Promise<void>;
}

export default function TokenSubmitForm({
  attemptId,
  attemptsUsed = 0,
  maxAttempts = 3,
  isLocked = false,
  lockMessage,
  onSubmit,
}: TokenSubmitFormProps) {
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const outOfAttempts = attemptsUsed >= maxAttempts;
  const submissionLocked = isLocked || outOfAttempts;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attemptId) {
      setMessage('Start an attempt first.');
      return;
    }

    if (submissionLocked) {
      setMessage(lockMessage ?? 'Attempt is locked. Start a new attempt.');
      return;
    }

    if (onSubmit && token.trim()) {
      setIsSubmitting(true);
      setMessage('');
      try {
        await onSubmit(token.trim());
        setToken('');
      } catch (error) {
        const nextMessage =
          error instanceof Error ? error.message : 'Token verification failed.';
        setMessage(nextMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-5">
      <h3 className="text-cyan-400 font-bold uppercase text-xs mb-3">
        Submit Token
      </h3>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={!attemptId || submissionLocked || isSubmitting}
          className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs focus:outline-none focus:border-cyan-400 transition"
        />
        <button
          type="submit"
          disabled={!attemptId || submissionLocked || isSubmitting}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2 rounded uppercase text-xs transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Verifying...' : submissionLocked ? 'Attempt_Locked' : 'Verify_Token'}
        </button>
      </form>
      {message ? <p className="mt-3 text-xs text-amber-300">{message}</p> : null}
      {!message && submissionLocked ? (
        <p className="mt-3 text-xs text-amber-300">
          {lockMessage ?? 'No submissions left for this attempt.'}
        </p>
      ) : null}
      <div className="mt-3 pt-3 border-t border-slate-800 text-xs">
        <div className="flex justify-between mb-1">
          <span className="text-slate-500">Attempts:</span>
          <span className="text-cyan-400">
            {attemptsUsed} / {maxAttempts}
          </span>
        </div>
      </div>
    </div>
  );
}
