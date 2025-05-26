import axios, { InternalAxiosRequestConfig } from 'axios';

import { getStorageData, removeStorageData, setStorageData } from '../storage';
import { ACCESS_TOKEN, API_URL, REFRESH_TOKEN, USER_PROFILE } from '@app/constants';
import { refreshTokenApi } from '@app/services';

const BASE_URL = import.meta.env.VITE_BASE_URL_API;
axios.defaults.baseURL = BASE_URL;

axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.url === API_URL.LOGIN) {
      return config;
    }

    if (config.url === API_URL.REFRESH_TOKEN) {
      const refreshToken = getStorageData(REFRESH_TOKEN);
      if (refreshToken) {
        config.headers['Authorization'] = `Bearer ${refreshToken}`;
      }

      return config;
    }

    const accessToken = getStorageData(ACCESS_TOKEN);
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (config.url === API_URL.REFRESH_TOKEN && response.data?.error === 'Unauthorized') {
      removeToken();
    }

    if (response.data?.message === 'Unauthorized') {
      await handleUnauthorized();
    }

    if (response.data?.message === 'TOKEN_EXPIRED') {
      removeToken();
    }

    return Promise.reject(error);
  },
);

async function removeToken() {
  removeStorageData(USER_PROFILE);
  removeStorageData(ACCESS_TOKEN);
  removeStorageData(REFRESH_TOKEN);
}

async function handleUnauthorized() {
  const { data } = await refreshTokenApi();
  setStorageData(ACCESS_TOKEN, data.data.accessToken);
}
