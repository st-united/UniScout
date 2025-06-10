// src/lib/api.ts -------------------------------------------------
import axios from 'axios';

const API_BASE_URL =
  // Vite first …
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  // … hard-coded fallback (dev only)
  'http://localhost:6002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'multipart/form-data' },
});

export default api;
