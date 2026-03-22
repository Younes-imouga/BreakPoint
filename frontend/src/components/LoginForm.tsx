'use client';
import { useState } from 'react';

interface LoginFormProps {
  onSubmit?: (email: string, password: string, remember: boolean) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(email, password, remember);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Username */}
      <div>
        <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block">
          <span className="text-cyan-400">[USERNAME]</span>
        </label>
        <input
          type="text"
          placeholder="Enter your operator ID"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 p-3 rounded text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition"
        />
      </div>

      {/* Password */}
      <div>
        <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block">
          <span className="text-cyan-400">[PASSWORD]</span>
        </label>
        <input
          type="password"
          placeholder="Enter your security passphrase"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 p-3 rounded text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition"
        />
      </div>

      {/* Remember Me */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="remember"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="w-4 h-4 bg-slate-950 border-slate-700 rounded cursor-pointer"
        />
        <label
          htmlFor="remember"
          className="ml-2 text-xs text-slate-500 cursor-pointer hover:text-slate-400"
        >
          Remember this terminal
        </label>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-3 rounded uppercase tracking-widest text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50"
      >
        &gt; Execute_Login
      </button>
    </form>
  );
}
