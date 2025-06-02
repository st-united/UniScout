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
import { api } from '@app/services/api';

export const useGetProfile = () => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: [QUERY_KEY.PROFILE],
    queryFn: async () => {
      const { data } = await getProfileApi();
      dispatch(setAuth(data.data));
      return data.data;
    }
  });
};

export const useChangePassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (password: ChangePassword) => {
      const response = await changePassword(password);
      return response.data;
    },
    onSuccess: () => {
      navigate(NAVIGATE_URL.PROFILE);
    },
    onError: (error: Error) => {
      console.log(error);
    },
  });
};

export const useUpdateProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: UserProfile) => {
      const response = await updateProfileApi(user);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROFILE] });
      navigate(NAVIGATE_URL.PROFILE);
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { identityId: string; formData: FormData }) => {
      const response = await uploadAvatarApi(data.identityId, data.formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROFILE] });
    },
  });
};

export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { identityId: string }) => {
      const response = await removeAvatarApi(data.identityId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROFILE] });
    },
  });
};

export const useProfile = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: [QUERY_KEY.PROFILE],
    queryFn: async () => {
      const response = await api.get<UserProfile>('/users/profile');
      return response.data;
    }
  });

  const updateProfile = useMutation({
    mutationFn: async (user: UserProfile) => {
      const response = await api.put('/users/profile', user);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROFILE] });
    }
  });

  const changePassword = useMutation({
    mutationFn: async (password: ChangePassword) => {
      const response = await api.put('/users/change-password', password);
      return response.data;
    }
  });

  const uploadAvatar = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROFILE] });
    }
  });

  const deleteAvatar = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/users/avatar');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROFILE] });
    }
  });

  return {
    profile,
    isLoading,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar
  };
};
