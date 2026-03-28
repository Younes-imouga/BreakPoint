'use client';

interface HintDisplayProps {
  hintsRemaining?: number;
  currentHint?: string | null;
  onRequestHint?: () => void;
  disabled?: boolean;
}

export default function HintDisplay({
  hintsRemaining = 2,
  currentHint = null,
  onRequestHint,
  disabled = false,
}: HintDisplayProps) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-5">
      <h3 className="text-cyan-400 font-bold uppercase text-xs mb-3">
        Available Hints
      </h3>
      
      {currentHint ? (
        <div className="bg-amber-900/20 border border-amber-900 p-3 rounded mb-3">
          <div className="text-xs text-amber-400 font-bold uppercase mb-2">
            💡 Hint:
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{currentHint}</p>
        </div>
      ) : null}

      <button
        onClick={onRequestHint}
        disabled={disabled || hintsRemaining === 0}
        className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-500 text-slate-300 font-bold py-2 rounded uppercase text-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Request_Hint ({hintsRemaining} left)
      </button>
      <div className="mt-3 text-xs text-slate-500 italic">
        Using hints will reduce your final score.
      </div>
    </div>
  );
}
  