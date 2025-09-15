import axios from 'axios';

function resolveBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL as string;
  const { protocol, hostname } = window.location;
  // Assume backend exposed on port 3000 of the same host
  return `${protocol}//${hostname}:3000`;
}

export const api = axios.create({
  baseURL: resolveBaseUrl(),
  withCredentials: false,
});

export default api;
