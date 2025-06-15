import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL_API;
axios.defaults.baseURL = BASE_URL;
