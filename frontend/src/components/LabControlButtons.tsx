'use client';

interface LabControlButtonsProps {
  onReset?: () => void;
  onBack?: () => void;
}

export default function LabControlButtons({ 
  onReset, 
  onBack 
}: LabControlButtonsProps) {
  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/simulations';
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleReset}
        className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-cyan-400 rounded text-sm uppercase transition text-slate-300"
      >
        Reset Lab
      </button>
      <button
        onClick={handleBack}
        className="text-slate-500 hover:text-cyan-400 text-sm uppercase"
      >
        [ Back ]
      </button>
    </div>
  );
}