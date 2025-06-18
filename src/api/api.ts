import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:6002', // Replace with your API base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
