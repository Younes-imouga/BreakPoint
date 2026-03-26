'use client';
import { useState } from 'react';

interface LabFiltersProps {
  filters: string[];
  onFilterChange?: (filter: string) => void;
}

export default function LabFilters({ filters, onFilterChange }: LabFiltersProps) {
  const [activeFilter, setActiveFilter] = useState(filters[0]);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <div className="flex gap-2">
      <span className="text-slate-500 text-xs uppercase">Filter:</span>
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => handleFilterClick(filter)}
          className={`text-xs uppercase transition ${
            activeFilter === filter
              ? 'text-cyan-400 hover:text-cyan-300 border-b border-cyan-400'
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
