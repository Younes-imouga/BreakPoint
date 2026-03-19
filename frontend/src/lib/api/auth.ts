import { post, setToken, clearToken } from "./api";

/* ================= TYPES ================= */

export type Role = "ADMIN" | "PARTICIPANT";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  exp?: number;
  total_score?: number;
  badge?: string;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/* ================= API ================= */

export async function login(data: LoginPayload) {
  const res = await post<AuthResponse>("/auth/login", data);
  setToken(res.access_token);
  return res;
}

export async function register(data: RegisterPayload) {
  const res = await post<AuthResponse>("/auth/register", data);
  setToken(res.access_token);
  return res;
}

export function logout() {
  clearToken();
}