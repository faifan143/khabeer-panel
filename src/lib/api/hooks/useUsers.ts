import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UsersService } from '../services/users.service'
import { User, CreateUserDto, UpdateUserDto, PaginatedResponse } from '../types'

export const useUsers = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => UsersService.getAllUsers(page, limit),
  })
}

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => UsersService.getUserById(id),
    enabled: !!id,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userData: CreateUserDto) => UsersService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: UpdateUserDto }) => 
      UsersService.updateUser(id, userData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', id] })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => UsersService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useSearchUsers = (query: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['users', 'search', query, page, limit],
    queryFn: () => UsersService.searchUsers(query, page, limit),
    enabled: !!query,
  })
}

export const useUserOrders = (userId: number) => {
  return useQuery({
    queryKey: ['users', userId, 'orders'],
    queryFn: () => UsersService.getUserOrders(userId),
    enabled: !!userId,
  })
}

export const useUserRatings = (userId: number) => {
  return useQuery({
    queryKey: ['users', userId, 'ratings'],
    queryFn: () => UsersService.getUserRatings(userId),
    enabled: !!userId,
  })
}