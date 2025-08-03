import { api } from '../axios'
import {
  DashboardStats,
  OverviewStats,
  RevenueStats,
  UserStats,
  ProviderStats,
  OrderStats,
  ServiceStats,
  ProviderVerification,
  ProviderJoinRequest,
  Provider,
  User,
  Order,
  Invoice
} from '../types'

export class AdminService {
  // Dashboard
  static async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/admin/dashboard')
    return response.data
  }

  static async getOverviewStats(period: number = 30): Promise<OverviewStats> {
    const response = await api.get<OverviewStats>(`/admin/overview?period=${period}`)
    return response.data
  }

  static async getRevenueStats(startDate?: string, endDate?: string): Promise<RevenueStats> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const response = await api.get<RevenueStats>(`/admin/revenue?${params.toString()}`)
    return response.data
  }

  // User Management
  static async getUserStats(): Promise<UserStats> {
    const response = await api.get<UserStats>('/admin/users/stats')
    return response.data
  }

  static async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/admin/users')
    return response.data
  }

  static async activateUser(id: number): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/admin/users/${id}/activate`)
    return response.data
  }

  static async deactivateUser(id: number): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/admin/users/${id}/deactivate`)
    return response.data
  }

  // Provider Management
  static async getProviderStats(): Promise<ProviderStats> {
    const response = await api.get<ProviderStats>('/admin/providers/stats')
    return response.data
  }

  static async getAllProviders(): Promise<Provider[]> {
    const response = await api.get<Provider[]>('/admin/providers')
    return response.data
  }

  static async getUnverifiedProviders(): Promise<Provider[]> {
    const response = await api.get<Provider[]>('/admin/providers/unverified')
    return response.data
  }

  static async activateProvider(id: number): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/admin/providers/${id}/activate`)
    return response.data
  }

  static async deactivateProvider(id: number): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/admin/providers/${id}/deactivate`)
    return response.data
  }

  static async verifyProvider(id: number): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/admin/providers/${id}/verify`)
    return response.data
  }

  static async unverifyProvider(id: number): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/admin/providers/${id}/unverify`)
    return response.data
  }

  // Verification Management
  static async getPendingVerifications(): Promise<ProviderVerification[]> {
    const response = await api.get<ProviderVerification[]>('/admin/verifications/pending')
    return response.data
  }

  static async approveVerification(id: string, notes?: string): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/admin/verifications/${id}/approve`, { notes })
    return response.data
  }

  static async rejectVerification(id: string, notes: string): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/admin/verifications/${id}/reject`, { notes })
    return response.data
  }

  // Join Requests
  static async getPendingJoinRequests(): Promise<ProviderJoinRequest[]> {
    const response = await api.get<ProviderJoinRequest[]>('/admin/join-requests/pending')
    return response.data
  }

  static async approveJoinRequest(id: number, notes?: string): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/admin/join-requests/${id}/approve`, { notes })
    return response.data
  }

  static async rejectJoinRequest(id: number, notes: string): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/admin/join-requests/${id}/reject`, { notes })
    return response.data
  }

  // Orders
  static async getOrderStats(): Promise<OrderStats> {
    const response = await api.get<OrderStats>('/admin/orders/stats')
    return response.data
  }

  static async getOrderReport(startDate?: string, endDate?: string): Promise<Order[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const response = await api.get<Order[]>(`/admin/reports/orders?${params.toString()}`)
    return response.data
  }

  // Services
  static async getServiceStats(): Promise<ServiceStats> {
    const response = await api.get<ServiceStats>('/admin/services/stats')
    return response.data
  }

  // Reports
  static async getRevenueReport(startDate?: string, endDate?: string): Promise<Invoice[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const response = await api.get<Invoice[]>(`/admin/reports/revenue?${params.toString()}`)
    return response.data
  }

  static async getProviderReport(startDate?: string, endDate?: string): Promise<any[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const response = await api.get<any[]>(`/admin/reports/providers?${params.toString()}`)
    return response.data
  }

  static async getUserReport(startDate?: string, endDate?: string): Promise<any[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const response = await api.get<any[]>(`/admin/reports/users?${params.toString()}`)
    return response.data
  }
}