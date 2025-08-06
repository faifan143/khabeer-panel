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
  },

  // Get all orders with admin privileges
  getAllOrders: async (page: number = 1, limit: number = 1000) => {
    const response = await api.get(`/admin/orders?page=${page}&limit=${limit}`)
    return response.data
  },

  // Update order status with admin privileges
  updateOrderStatus: async (id: number, status: string) => {
    const response = await api.put(`/admin/orders/${id}/status`, { status })
    return response.data
  },

  // Cancel order with admin privileges
  cancelOrder: async (id: number, reason?: string) => {
    const response = await api.put(`/admin/orders/${id}/cancel`, { reason })
    return response.data
  },

  // Complete order with admin privileges
  completeOrder: async (id: number) => {
    const response = await api.put(`/admin/orders/${id}/complete`)
    return response.data
  },

  // Accept order with admin privileges
  acceptOrder: async (id: number, notes?: string) => {
    const response = await api.put(`/admin/orders/${id}/accept`, { notes })
    return response.data
  },

  // Reject order with admin privileges
  rejectOrder: async (id: number, reason: string) => {
    const response = await api.put(`/admin/orders/${id}/reject`, { reason })
    return response.data
  },

  // Provider Management Functions
  getAllProviders: async () => {
    const response = await api.get('/admin/providers')
    return response.data
  },

  getUnverifiedProviders: async () => {
    const response = await api.get('/admin/providers/unverified')
    return response.data
  },

  activateProvider: async (id: number) => {
    const response = await api.put(`/admin/providers/${id}/activate`)
    return response.data
  },

  deactivateProvider: async (id: number) => {
    const response = await api.put(`/admin/providers/${id}/deactivate`)
    return response.data
  },

  verifyProvider: async (id: number) => {
    const response = await api.put(`/admin/providers/${id}/verify`)
    return response.data
  },

  unverifyProvider: async (id: number) => {
    const response = await api.put(`/admin/providers/${id}/unverify`)
    return response.data
  },

  // Verification Management
  getPendingVerifications: async () => {
    const response = await api.get('/admin/verifications/pending')
    return response.data
  },

  approveVerification: async (id: string, notes?: string) => {
    const response = await api.put(`/admin/verifications/${id}/approve`, { notes })
    return response.data
  },

  rejectVerification: async (id: string, notes: string) => {
    const response = await api.put(`/admin/verifications/${id}/reject`, { notes })
    return response.data
  },

  // Join Requests Management
  getPendingJoinRequests: async () => {
    const response = await api.get('/admin/join-requests/pending')
    return response.data
  },

  approveJoinRequest: async (id: number, notes?: string) => {
    const response = await api.put(`/admin/join-requests/${id}/approve`, { notes })
    return response.data
  },

  rejectJoinRequest: async (id: number, notes: string) => {
    const response = await api.put(`/admin/join-requests/${id}/reject`, { notes })
    return response.data
  },

  // User Management Functions
  getUserReport: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await api.get(`/admin/reports/users?${params.toString()}`)
    return response.data
  },

  activateUser: async (id: number) => {
    const response = await api.put(`/admin/users/${id}/activate`)
    return response.data
  },

  deactivateUser: async (id: number) => {
    const response = await api.put(`/admin/users/${id}/deactivate`)
    return response.data
  },

  // Get all ratings for admin
  getAllRatings: async () => {
    const response = await api.get('/admin/ratings')
    return response.data
  }
}