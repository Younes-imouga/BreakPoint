'use client';

import { useState } from 'react';

interface RegisterFormProps {
  onSubmit?: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
}

export default function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ name, email, password, confirmPassword });
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Name */}
      <div>
        <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block">
          <span className="text-cyan-400">[OPERATOR NAME]</span>
        </label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 p-3 rounded text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition"
        />
      </div>

      {/* Email */}
      <div>
        <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block">
          <span className="text-cyan-400">[EMAIL]</span>
        </label>
        <input
          type="email"
          placeholder="operator@domain.com"
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
          placeholder="Create security passphrase"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 p-3 rounded text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition"
        />
      </div>

      {/* Confirm Password */}
      <div>
        <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block">
          <span className="text-cyan-400">[CONFIRM PASSWORD]</span>
        </label>
        <input
          type="password"
          placeholder="Re-enter security passphrase"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 p-3 rounded text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition"
        />
      </div>

      {/* Register Button */}
      <button
        type="submit"
        className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-3 rounded uppercase tracking-widest text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50"
      >
        &gt; Initialize_Account
      </button>
    </form>
  );
}
