'use client';

interface AdminControlButtonsProps {
  onSystemStatus?: () => void;
  onLogout?: () => void;
}

export default function AdminControlButtons({ 
  onSystemStatus, 
  onLogout 
}: AdminControlButtonsProps) {
  const handleSystemStatus = () => {
    if (onSystemStatus) {
      onSystemStatus();
    } else {
      console.log('System status check requested');
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleSystemStatus}
        className="px-4 py-2 bg-red-900/30 border border-red-900 hover:border-red-500 rounded text-sm uppercase text-red-400 transition"
      >
        System Status
      </button>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-red-400 rounded text-sm uppercase text-slate-300 transition"
      >
        Logout
      </button>
    </div>
  );
}
