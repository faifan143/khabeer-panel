import { api } from '../axios'
import type { DashboardStats, OverviewStats, ServiceStats, ProviderStats, OrderStats } from '@/lib/types/admin'

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/admin/dashboard')
    return response.data
  },

  // Get overview statistics
  getOverviewStats: async (period: number = 30): Promise<OverviewStats> => {
    const response = await api.get(`/admin/overview?period=${period}`)
    return response.data
  },

  // Get service statistics
  getServiceStats: async (): Promise<ServiceStats> => {
    const response = await api.get('/admin/services/stats')
    return response.data
  },

  // Get provider statistics
  getProviderStats: async (): Promise<ProviderStats> => {
    const response = await api.get('/admin/providers/stats')
    return response.data
  },

  // Get order statistics
  getOrderStats: async (): Promise<OrderStats> => {
    const response = await api.get('/admin/orders/stats')
    return response.data
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get('/admin/users/stats')
    return response.data
  },

  // Get revenue statistics
  getRevenueStats: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await api.get(`/admin/revenue?${params.toString()}`)
    return response.data
  }
}