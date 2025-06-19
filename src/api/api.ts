import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.uniscout.dev.stunited.vn', // Replace with your API base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
