interface AttemptCardProps {
  labName: string;
  labId: string;
  status: 'success' | 'failed' | 'in-progress';
  xpEarned: number;
  timeElapsed: string;
  attemptsUsed: number;
  maxAttempts: number;
  hintsUsed: number;
  timestamp: string;
  onResume?: () => void;
}

export default function AttemptCard({
  labName,
  labId,
  status,
  xpEarned,
  timeElapsed,
  attemptsUsed,
  maxAttempts,
  hintsUsed,
  timestamp,
  onResume,
}: AttemptCardProps) {
  const statusConfig = {
    success: {
      color: 'text-emerald-500',
      border: 'border-slate-700 hover:border-cyan-400',
      label: 'SUCCESS',
      xpColor: 'text-emerald-400',
    },
    failed: {
      color: 'text-red-500',
      border: 'border-slate-700 hover:border-red-400',
      label: 'FAILED',
      xpColor: 'text-red-400',
    },
    'in-progress': {
      color: 'text-amber-500',
      border: 'border-amber-700 hover:border-amber-400',
      label: 'IN PROGRESS',
      xpColor: 'text-amber-400',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`bg-slate-900 border ${config.border} rounded-lg p-6 transition`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`${config.color === 'text-amber-500' ? 'text-amber-400' : config.color === 'text-red-500' ? 'text-red-400' : 'text-cyan-400'} font-bold text-lg mb-2`}>
            {labName}
          </h3>
          <div className="flex gap-4 text-xs">
            <span className="text-slate-500">Lab ID: {labId}</span>
            <span className={`${config.color} flex items-center gap-1`}>
              {status === 'in-progress' && (
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              )}
              • {config.label}
            </span>
          </div>
        </div>
        <div className="text-right">
          {status === 'in-progress' ? (
            <button
              onClick={onResume}
              className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded text-xs uppercase transition"
            >
              Resume
            </button>
          ) : (
            <>
              <div className={`${config.xpColor} font-bold text-xl mb-1`}>
                {xpEarned > 0 ? '+' : ''}{xpEarned} XP
              </div>
              <div className="text-xs text-slate-500">{timestamp}</div>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
        <div>
          <div className="text-xs text-slate-500 uppercase mb-1">Time Elapsed</div>
          <div className="text-sm text-slate-300 font-bold">{timeElapsed}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase mb-1">Attempts Used</div>
          <div className="text-sm text-slate-300 font-bold">
            {attemptsUsed} / {maxAttempts}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase mb-1">Hints Used</div>
          <div className="text-sm text-slate-300 font-bold">{hintsUsed}</div>
        </div>
      </div>
    </div>
  );
}
