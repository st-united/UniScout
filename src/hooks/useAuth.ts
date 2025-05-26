import { useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { removeStorageData, setStorageData } from '@app/config';
import { ACCESS_TOKEN, NAVIGATE_URL, REFRESH_TOKEN, USER_PROFILE } from '@app/constants';
import { Credentials } from '@app/interface/user.interface';
import { logout, login } from '@app/redux/features/auth/authSlice';
import { RootState } from '@app/redux/store';
import { loginApi, getLogout } from '@app/services';

export const useLogin = () => {
  const navigate = useNavigate();
  const dispatchAuth = useDispatch();

  return useMutation(
    async (credentials: Credentials) => {
      const { data } = await loginApi(credentials);
      return data;
    },
    {
      onSuccess: ({ data, message }) => {
        dispatchAuth(login());

        setStorageData(ACCESS_TOKEN, data.accessToken);
        setStorageData(REFRESH_TOKEN, data.refreshToken);

        navigate('/');
      },
      onError({ response }) {
        //
      },
    },
  );
};

export const useLogout = () => {
  const navigate = useNavigate();
  const dispatchAuth = useDispatch();

  return useMutation(
    async () => {
      const { data } = await getLogout();
      return data;
    },
    {
      onSuccess: ({ message }) => {
        removeStorageData(ACCESS_TOKEN);
        removeStorageData(REFRESH_TOKEN);
        removeStorageData(USER_PROFILE);

        dispatchAuth(logout());

        navigate(NAVIGATE_URL.SIGN_IN);
      },
    },
  );
};
