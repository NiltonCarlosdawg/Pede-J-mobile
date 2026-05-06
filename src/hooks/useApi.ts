import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, authApi, restaurantApi, orderApi, userApi } from '../services/api';

export function useAuth() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.data);
    },
  });

  const profileQuery = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: authApi.getProfile,
    enabled: false,
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    profile: profileQuery.data?.data,
    isLoadingProfile: profileQuery.isLoading,
  };
}

export function useRestaurants(params?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => restaurantApi.list(params),
  });
}

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => restaurantApi.getById(id),
    enabled: !!id,
  });
}

export function useRestaurantProducts(restaurantId: string) {
  return useQuery({
    queryKey: ['restaurant', restaurantId, 'products'],
    queryFn: () => restaurantApi.getProducts(restaurantId),
    enabled: !!restaurantId,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: orderApi.list,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useAddresses() {
  return useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: userApi.getAddresses,
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
}