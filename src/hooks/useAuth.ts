import { useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { removeStorageData, setStorageData } from '@app/config';
import { ACCESS_TOKEN, NAVIGATE_URL, REFRESH_TOKEN, USER_PROFILE } from '@app/constants';
import { Credentials } from '@app/interface/user.interface';
import { login as loginAction, logout as logoutAction } from '@app/redux/features/auth/authSlice';
import { RootState } from '@app/redux/store';
import { loginApi, getLogout } from '@app/services';

export const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const login = useMutation({
    mutationFn: async (credentials: Credentials) => {
      const { data } = await loginApi(credentials);
      return data;
    },
    onSuccess: ({ data }) => {
      dispatch(loginAction(data.user));

      setStorageData(ACCESS_TOKEN, data.accessToken);
      setStorageData(REFRESH_TOKEN, data.refreshToken);

      navigate('/');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    }
  });

  const logout = useMutation({
    mutationFn: async () => {
      const { data } = await getLogout();
      return data;
    },
    onSuccess: () => {
      removeStorageData(ACCESS_TOKEN);
      removeStorageData(REFRESH_TOKEN);
      removeStorageData(USER_PROFILE);

      dispatch(logoutAction());

      navigate(NAVIGATE_URL.SIGN_IN);
    }
  });

  return {
    login: login.mutate,
    logout: logout.mutate,
    isLoading: login.isPending || logout.isPending
  };
};
