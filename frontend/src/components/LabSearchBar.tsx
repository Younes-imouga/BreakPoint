'use client';
import { useState } from 'react';

interface LabSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export default function LabSearchBar({ 
  placeholder = 'Search labs...', 
  onSearch 
}: LabSearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={query}
      onChange={handleChange}
      className="bg-slate-950 border border-slate-700 p-2 rounded text-xs focus:outline-none focus:border-cyan-400 w-48"
    />
  );
}
