import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AdminService } from '../services/admin.service'
import { 
  DashboardStats, 
  OverviewStats, 
  RevenueStats, 
  UserStats, 
  ProviderStats, 
  OrderStats, 
  ServiceStats,
  ProviderVerification,
  ProviderJoinRequest
} from '../types'

// Dashboard hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => AdminService.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export const useOverviewStats = (period: number = 30) => {
  return useQuery({
    queryKey: ['dashboard', 'overview', period],
    queryFn: () => AdminService.getOverviewStats(period),
  })
}

export const useRevenueStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['dashboard', 'revenue', startDate, endDate],
    queryFn: () => AdminService.getRevenueStats(startDate, endDate),
    enabled: !!(startDate && endDate),
  })
}

// User management hooks
export const useUserStats = () => {
  return useQuery({
    queryKey: ['admin', 'users', 'stats'],
    queryFn: () => AdminService.getUserStats(),
  })
}

export const useActivateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => AdminService.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export const useDeactivateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => AdminService.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

// Provider management hooks
export const useProviderStats = () => {
  return useQuery({
    queryKey: ['admin', 'providers', 'stats'],
    queryFn: () => AdminService.getProviderStats(),
  })
}

export const useAllProviders = () => {
  return useQuery({
    queryKey: ['admin', 'providers', 'all'],
    queryFn: () => AdminService.getAllProviders(),
  })
}

export const useUnverifiedProviders = () => {
  return useQuery({
    queryKey: ['admin', 'providers', 'unverified'],
    queryFn: () => AdminService.getUnverifiedProviders(),
  })
}

export const useActivateProvider = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => AdminService.activateProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export const useDeactivateProvider = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => AdminService.deactivateProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export const useVerifyProvider = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => AdminService.verifyProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export const useUnverifyProvider = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => AdminService.unverifyProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

// Verification management hooks
export const usePendingVerifications = () => {
  return useQuery({
    queryKey: ['admin', 'verifications', 'pending'],
    queryFn: () => AdminService.getPendingVerifications(),
    refetchInterval: 60000, // Refetch every minute
  })
}

export const useApproveVerification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => 
      AdminService.approveVerification(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export const useRejectVerification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => 
      AdminService.rejectVerification(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

// Join requests hooks
export const usePendingJoinRequests = () => {
  return useQuery({
    queryKey: ['admin', 'join-requests', 'pending'],
    queryFn: () => AdminService.getPendingJoinRequests(),
    refetchInterval: 60000, // Refetch every minute
  })
}

export const useApproveJoinRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => 
      AdminService.approveJoinRequest(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'join-requests'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export const useRejectJoinRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) => 
      AdminService.rejectJoinRequest(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'join-requests'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

// Orders and services hooks
export const useOrderStats = () => {
  return useQuery({
    queryKey: ['admin', 'orders', 'stats'],
    queryFn: () => AdminService.getOrderStats(),
  })
}

export const useServiceStats = () => {
  return useQuery({
    queryKey: ['admin', 'services', 'stats'],
    queryFn: () => AdminService.getServiceStats(),
  })
}

// Report hooks
export const useOrderReport = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['admin', 'reports', 'orders', startDate, endDate],
    queryFn: () => AdminService.getOrderReport(startDate, endDate),
    enabled: !!(startDate && endDate),
  })
}

export const useRevenueReport = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['admin', 'reports', 'revenue', startDate, endDate],
    queryFn: () => AdminService.getRevenueReport(startDate, endDate),
    enabled: !!(startDate && endDate),
  })
}

export const useProviderReport = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['admin', 'reports', 'providers', startDate, endDate],
    queryFn: () => AdminService.getProviderReport(startDate, endDate),
    enabled: !!(startDate && endDate),
  })
}

export const useUserReport = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['admin', 'reports', 'users', startDate, endDate],
    queryFn: () => AdminService.getUserReport(startDate, endDate),
    enabled: !!(startDate && endDate),
  })
}