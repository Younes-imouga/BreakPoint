// TypeScript types for the application

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
}

export interface Simulation {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Instane';
  token_count: number;
  minimum_exp: number;
  status: 'Active' | 'Locked';
  hint?: string[];
  score: number;
  createdBy: string;
}

export interface Attempt {
  id: string;
  user_id: string;
  simulation_id: string;
  token: string;
  attempts: string[];
  hints_used: number;
  success: boolean | null;
  final_score: number | null;
  createdAt: string;
  updatedAt: string;
}
