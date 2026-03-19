import axios from "axios";

const TOKEN_KEY = "breakpoint_access_token";

const api = axios.create({
  baseURL: process.env.NEXT_API_URL || "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
api.interceptors.request.use(function (config) {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Token helpers
export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// API methods
export async function get<T>(url: string) {
  return api.get<T>(url).then(function (res) {
    return res.data;
  });
}

export async function post<T>(url: string, data?: unknown) {
  return api.post<T>(url, data).then(function (res) {
    return res.data;
  });
}

export async function patch<T>(url: string, data?: unknown) {
  return api.patch<T>(url, data).then(function (res) {
    return res.data;
  });
}

export async function remove<T>(url: string) {
  return api.delete<T>(url).then(function (res) {
    return res.data;
  });
}