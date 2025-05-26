import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { NAVIGATE_URL, QUERY_KEY } from '@app/constants';
import { ChangePassword, UserProfile } from '@app/interface/user.interface';
import { setAuth } from '@app/redux/features/auth/authSlice';
import {
  changePassword,
  getProfileApi,
  removeAvatarApi,
  updateProfileApi,
  uploadAvatarApi,
} from '@app/services';

export const useGetProfile = () => {
  const dispatch = useDispatch();

  return useQuery(
    [QUERY_KEY.PROFILE],
    async () => {
      const { data } = await getProfileApi();
      return data.data;
    },
    {
      onSuccess(data) {
        dispatch(setAuth(data));
      },
    },
  );
};

export const useChangePassword = () => {
  const navigate = useNavigate();

  return useMutation(
    async (password: ChangePassword) => {
      const response = await changePassword(password);
      return response.data;
    },
    {
      onSuccess({ message }) {
        navigate(NAVIGATE_URL.PROFILE);
      },
      onError({ response }) {
        console.log(response);
      },
    },
  );
};

export const useUpdateProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation(
    async (user: UserProfile) => {
      const response = await updateProfileApi(user);
      return response.data;
    },
    {
      onSuccess({ message }) {
        queryClient.refetchQueries([QUERY_KEY.PROFILE]);
        navigate(NAVIGATE_URL.PROFILE);
      },
    },
  );
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: { identityId: string; formData: FormData }) => {
      const response = await uploadAvatarApi(data.identityId, data.formData);
      return response.data;
    },
    {
      onSuccess({ message }) {
        queryClient.refetchQueries([QUERY_KEY.PROFILE]);
      },
    },
  );
};

export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: { identityId: string }) => {
      const response = await removeAvatarApi(data.identityId);
      return response.data;
    },
    {
      onSuccess({ message }) {
        queryClient.refetchQueries([QUERY_KEY.PROFILE]);
      },
    },
  );
};
