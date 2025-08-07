import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ProvidersService } from '../services/providers.service'
import { Provider, CreateProviderDto, UpdateProviderDto, PaginatedResponse } from '../types'

export const useProviders = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['providers', page, limit],
    queryFn: () => ProvidersService.getAllProviders(page, limit),
  })
}

export const useProvider = (id: number) => {
  return useQuery({
    queryKey: ['providers', id],
    queryFn: () => ProvidersService.getProviderById(id),
    enabled: !!id,
  })
}

export const useCreateProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (providerData: CreateProviderDto & { image?: File }) => ProvidersService.createProvider(providerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
  })
}

export const useUpdateProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, providerData }: { id: number; providerData: UpdateProviderDto & { image?: File } }) =>
      ProvidersService.updateProvider(id, providerData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      queryClient.invalidateQueries({ queryKey: ['providers', id] })
    },
  })
}

export const useDeleteProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => ProvidersService.deleteProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
  })
}

export const useSearchProviders = (query: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['providers', 'search', query, page, limit],
    queryFn: () => ProvidersService.searchProviders(query, page, limit),
    enabled: !!query,
  })
}

export const useProviderServices = (providerId: number) => {
  return useQuery({
    queryKey: ['providers', providerId, 'services'],
    queryFn: () => ProvidersService.getProviderServices(providerId),
    enabled: !!providerId,
  })
}

export const useProviderOrders = (providerId: number) => {
  return useQuery({
    queryKey: ['providers', providerId, 'orders'],
    queryFn: () => ProvidersService.getProviderOrders(providerId),
    enabled: !!providerId,
  })
}

export const useProviderRatings = (providerId: number) => {
  return useQuery({
    queryKey: ['providers', providerId, 'ratings'],
    queryFn: () => ProvidersService.getProviderRatings(providerId),
    enabled: !!providerId,
  })
}

export const useTopProviders = (limit: number = 5) => {
  return useQuery({
    queryKey: ['providers', 'top', limit],
    queryFn: () => ProvidersService.getTopProviders(limit),
  })
}