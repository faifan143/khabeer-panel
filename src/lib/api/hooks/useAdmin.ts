import { useQuery } from '@tanstack/react-query'
import { adminService } from '../services/admin.service'

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: adminService.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export const useOverviewStats = (period: number = 30) => {
  return useQuery({
    queryKey: ['admin', 'overview-stats', period],
    queryFn: () => adminService.getOverviewStats(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useRevenueStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['admin', 'revenue-stats', startDate, endDate],
    queryFn: () => adminService.getRevenueStats(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Note: The following hooks are kept for other pages that might need specific data
// The dashboard now uses the consolidated useDashboardStats hook

export const useServiceStats = () => {
  return useQuery({
    queryKey: ['admin', 'service-stats'],
    queryFn: adminService.getServiceStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useProviderStats = () => {
  return useQuery({
    queryKey: ['admin', 'provider-stats'],
    queryFn: adminService.getProviderStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useOrderStats = () => {
  return useQuery({
    queryKey: ['admin', 'order-stats'],
    queryFn: adminService.getOrderStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  })
}

export const useUserStats = () => {
  return useQuery({
    queryKey: ['admin', 'user-stats'],
    queryFn: adminService.getUserStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}