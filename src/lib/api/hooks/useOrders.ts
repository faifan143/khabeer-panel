import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { OrdersService } from '../services/orders.service'
import { Order, CreateOrderDto, UpdateOrderDto, PaginatedResponse } from '../types'

export const useOrders = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: () => OrdersService.getAllOrders(page, limit),
  })
}

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => OrdersService.getOrderById(id),
    enabled: !!id,
  })
}

export const useOrderByBookingId = (bookingId: string) => {
  return useQuery({
    queryKey: ['orders', 'booking', bookingId],
    queryFn: () => OrdersService.getOrderByBookingId(bookingId),
    enabled: !!bookingId,
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (orderData: CreateOrderDto) => OrdersService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export const useUpdateOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, orderData }: { id: number; orderData: UpdateOrderDto }) => 
      OrdersService.updateOrder(id, orderData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export const useDeleteOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => OrdersService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export const useDailyOrders = () => {
  return useQuery({
    queryKey: ['orders', 'daily'],
    queryFn: () => OrdersService.getDailyOrders(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export const useOrdersByStatus = (status: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['orders', 'status', status, page, limit],
    queryFn: () => OrdersService.getOrdersByStatus(status, page, limit),
    enabled: !!status,
  })
}

export const useOrdersByUser = (userId: number, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['orders', 'user', userId, page, limit],
    queryFn: () => OrdersService.getOrdersByUser(userId, page, limit),
    enabled: !!userId,
  })
}

export const useOrdersByProvider = (providerId: number, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['orders', 'provider', providerId, page, limit],
    queryFn: () => OrdersService.getOrdersByProvider(providerId, page, limit),
    enabled: !!providerId,
  })
}

export const useOrdersByService = (serviceId: number, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['orders', 'service', serviceId, page, limit],
    queryFn: () => OrdersService.getOrdersByService(serviceId, page, limit),
    enabled: !!serviceId,
  })
}

export const useSearchOrders = (query: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['orders', 'search', query, page, limit],
    queryFn: () => OrdersService.searchOrders(query, page, limit),
    enabled: !!query,
  })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      OrdersService.updateOrderStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => 
      OrdersService.cancelOrder(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export const useCompleteOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => OrdersService.completeOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}