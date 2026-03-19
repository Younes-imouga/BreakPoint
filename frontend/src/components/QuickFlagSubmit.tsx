'use client';
import { useState } from 'react';

interface QuickFlagSubmitProps {
  onSubmit?: (flag: string) => void;
}

export default function QuickFlagSubmit({ onSubmit }: QuickFlagSubmitProps) {
  const [flag, setFlag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && flag.trim()) {
      onSubmit(flag);
      setFlag('');
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
        className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-8 rounded transition uppercase text-sm"
      >
        Submit_Flag
      </button>
    </form>
  );
}
