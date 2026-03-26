'use client';
import { useState } from 'react';

interface QuickFlagSubmitProps {
  onSubmit?: (flag: string) => void | Promise<void>;
}

export default function QuickFlagSubmit({ onSubmit }: QuickFlagSubmitProps) {
  const [flag, setFlag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit || !flag.trim()) {
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      await onSubmit(flag.trim());
      setFlag('');
      setMessage('Token submitted.');
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : 'Token submission failed.';
      setMessage(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex gap-4" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter Token (e.g. BP{3v3ryth1ng_is_vunl})"
        value={flag}
        onChange={(e) => setFlag(e.target.value)}
        className="flex-1 bg-slate-950 border border-slate-700 p-3 rounded text-sm focus:outline-none focus:border-cyan-400 transition"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-8 rounded transition uppercase text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit_Flag'}
      </button>

      {message ? <p className="text-xs text-slate-400 self-center">{message}</p> : null}
    </form>
  );
}
