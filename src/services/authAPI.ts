import axios from 'axios';

import { API_URL } from '@app/constants';
import { Credentials } from '@app/interface/user.interface';

export const loginApi = (credentials: Credentials) => axios.post(API_URL.LOGIN, credentials);

export const refreshTokenApi = () => axios.get(API_URL.REFRESH_TOKEN);

export const getLogout = () => axios.get(API_URL.LOGOUT);
