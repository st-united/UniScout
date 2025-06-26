import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_API, // Use environment variable for API base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
