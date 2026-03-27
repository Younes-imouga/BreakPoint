import { get, patch, remove } from "./api";

/* ================= TYPES ================= */

export type Role = "ADMIN" | "PARTICIPANT";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  exp: number;
  total_score: number;
  badge: string;
  completed_simulations: string[];
}

export interface PaginatedUsers {
  data: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UpdateProfile {
  name?: string;
  email?: string;
  password?: string;
}

export interface UserStats {
  name: string;
  email: string;
  exp: number;
  total_score: number;
  badge: string;
  completed_labs: number;
  completed_simulations?: Array<{
    _id: string;
    name: string;
    difficulty: 'Easy' | 'Normal' | 'Hard' | 'Insane';
    score: number;
  }>;
}

export interface LeaderboardEntry {
  _id: string;
  name: string;
  role?: Role;
  total_score: number;
  exp: number;
  badge: string;
  completed_labs: number;
}

/* ================= API ================= */

export function getUsers(page = 1, limit = 20) {
  return get<PaginatedUsers>(`/users?page=${page}&limit=${limit}`);
}

export function getUser(id: string) {
  return get<User>(`/users/${id}`);
}

export function updateUser(id: string, data: Partial<User>) {
  return patch<User>(`/users/${id}`, data);
}

export function deleteUser(id: string) {
  return remove<{ message: string }>(`/users/${id}`);
}

export function changeUserRole(id: string, role: Role) {
  return patch<User>(`/users/${id}/role`, { role });
}

export function getMe() {
  return get<User>("/users/me");
}

export function updateMe(data: UpdateProfile) {
  return patch<User>("/users/me", data);
}

export function deleteMe() {
  return remove<{ message: string }>("/users/me");
}

export function getMyStats() {
  return get<UserStats>("/users/me/stats");
}

export function getMyAttempts() {
  return get<unknown[]>("/users/me/attempts");
}

export function getLeaderboard(limit = 50) {
  return get<LeaderboardEntry[]>(`/users/leaderboard/top?limit=${limit}`);
}