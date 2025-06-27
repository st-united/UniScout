import { createSlice } from '@reduxjs/toolkit';

import { getStorageStringData } from '@app/config';
import { ACCESS_TOKEN } from '@app/constants';
import { UserProfile } from '@app/interface/user.interface';

interface AuthState {
  isAuth: boolean;
  user: UserProfile | null;
  permissions: string[];
}

const checkAuth = (): boolean => {
  const token = getStorageStringData(ACCESS_TOKEN);
  console.log('checkAuth called. Token found:', Boolean(token));
  return Boolean(token);
};

const initialState: AuthState = {
  isAuth: checkAuth(),
  user: null,
  permissions: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state) {
      state.isAuth = true;
    },
    setAuth(state, action) {
      const { permissions } = action.payload;

      state.user = action.payload;
      state.permissions = permissions;
    },
    logout(state) {
      state.isAuth = false;
      state.user = null;
    },
  },
});

const { reducer, actions } = authSlice;

export const { setAuth, logout, login } = actions;

export default reducer;
