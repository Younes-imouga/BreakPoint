interface SimulationCardProps {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Insane';
  xp: number;
  progress?: number;
  isLocked?: boolean;
  requiredXP?: number;
}

export default function SimulationCard({
  id,
  name,
  description,
  difficulty,
  xp,
  progress = 0,
  isLocked = false,
  requiredXP,
}: SimulationCardProps) {
  const difficultyColors = {
    Easy: 'text-emerald-500',
    Medium: 'text-amber-500',
    Hard: 'text-red-500',
    Insane: 'text-red-900',
  };

  const difficultyBars = {
    Easy: 1,
    Medium: 2,
    Hard: 3,
    Insane: 3,
  };

  if (isLocked) {
    return (
      <div className="relative bg-slate-950 border border-slate-800 p-5 rounded-lg flex flex-col opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-slate-900 border border-red-900 text-red-500 px-3 py-1 text-[10px] font-bold uppercase rotate-[-5deg] shadow-lg">
            [ Access_Denied: Requires {requiredXP} XP ]
          </div>
        </div>

        <div className="flex justify-between mb-4">
          <span className="text-[10px] text-slate-700 font-bold">ID: {id}</span>
          <span className={`${difficultyColors[difficulty]} text-[10px] font-black uppercase opacity-30`}>
            Level: {difficulty}
          </span>
        </div>
        <h4 className="text-slate-700 font-bold text-lg mb-2 italic">{name}</h4>
        <p className="text-slate-800 text-xs leading-relaxed mb-6">{description}</p>
        <div className="mt-auto pt-4 border-t border-slate-900 flex justify-between items-center text-slate-800">
          <span className="text-sm">??? XP</span>
          <span className="text-[10px] font-bold">[ LOCKED ]</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition duration-300 rounded-lg"></div>

      <div className="relative bg-slate-900 border border-slate-700 p-5 rounded-lg flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] text-slate-500 font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">
            ID: {id}
          </span>
          <div className="flex flex-col items-end">
            <span className={`${difficultyColors[difficulty]} text-[10px] font-black uppercase tracking-widest`}>
              Level: {difficulty}
            </span>
            <div className="flex gap-1 mt-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-1 ${
                    i < difficultyBars[difficulty]
                      ? difficultyColors[difficulty].replace('text-', 'bg-')
                      : 'bg-slate-700'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <h4 className="text-cyan-400 font-bold text-lg mb-2 group-hover:translate-x-1 transition-transform tracking-tight">
          &gt; {name}
        </h4>
        <p className="text-slate-400 text-xs leading-relaxed mb-6 flex-grow italic border-l border-slate-700 pl-3">
          {description}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-[9px] uppercase mb-1">
            <span className="text-slate-500">{progress > 0 ? 'Progress' : 'Integrity Check'}</span>
            <span className="text-cyan-400">{progress}% {progress === 0 ? 'Patched' : ''}</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${progress || 5}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
          <span className="text-white font-bold text-sm">
            {xp} <span className="text-slate-500 text-[10px]">XP</span>
          </span>
          <button className="bg-slate-950 hover:bg-cyan-600 hover:text-slate-950 border border-cyan-900 px-4 py-2 text-[10px] font-bold uppercase tracking-tighter transition-colors">
            {progress > 0 ? 'Resume_Lab' : 'Execute_Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
}
