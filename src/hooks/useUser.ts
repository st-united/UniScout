import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { User, UserProfile } from '../types/user';

import { NAVIGATE_URL, QUERY_KEY } from '@app/constants';
import { GetUsersParams, UserDetail } from '@app/interface/user.interface';
import { createUser, deleteUserAPI, getUserByIdAPI, getUsersAPI, updateUser } from '@app/services';

export const useCreateUser = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await createUser(formData);
      return response.data;
    },
    onSuccess: () => {
      navigate(NAVIGATE_URL.USERS);
    },
  });
};

export const useGetUsers = (params: GetUsersParams) =>
  useQuery({
    queryKey: [QUERY_KEY.USERS, params.search, params.status, params.page, params.take],
    queryFn: async () => {
      const { data } = await getUsersAPI(params);
      return data;
    },
    enabled: false,
    placeholderData: (previousData) => previousData,
    gcTime: 0,
  });

export const useGetUserById = (id: number) =>
  useQuery({
    queryKey: [QUERY_KEY.USERS, id],
    queryFn: async () => {
      const { data } = await getUserByIdAPI(id);
      return data.data;
    }
  });

export const useUpdateUser = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: UserDetail) => {
      const response = await updateUser(user);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.USERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROFILE] });
      navigate(NAVIGATE_URL.USERS);
    },
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteUserAPI(id);
      return response.data;
    }
  });
};

export const useUser = (id?: number) => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: [QUERY_KEY.USERS, id],
    queryFn: async () => {
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  const updateUser = useMutation({
    mutationFn: async (user: UserProfile) => {
      const response = await api.put(`/users/${id}`, user);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.USERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROFILE] });
    }
  });

  const deleteUser = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.USERS] });
    }
  });

  return {
    user,
    isLoading,
    updateUser,
    deleteUser
  };
};
