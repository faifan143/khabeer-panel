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
  },

  // Settings Management Functions
  getSystemSettings: async (category?: string) => {
    const params = new URLSearchParams()
    if (category) params.append('category', category)

    const response = await api.get(`/admin/settings?${params.toString()}`)
    return response.data
  },

  updateSystemSetting: async (key: string, value: string, description?: string, category?: string) => {
    const response = await api.post('/admin/settings', {
      key,
      value,
      description,
      category
    })
    return response.data
  },

  // File Upload Functions
  uploadLegalDocuments: async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append('documents', file)
    })

    const response = await api.post('/admin/settings/upload-legal-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  uploadBannerImage: async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.post('/admin/settings/upload-banner-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Sub-Admin Management Functions
  getSubAdmins: async () => {
    const response = await api.get('/admin/subadmins')
    return response.data
  },

  createSubAdmin: async (name: string, email: string, password: string, permissions: string[]) => {
    const response = await api.post('/admin/subadmins', {
      name,
      email,
      password,
      permissions
    })
    return response.data
  },

  deleteSubAdmin: async (id: number) => {
    const response = await api.delete(`/admin/subadmins/${id}`)
    return response.data
  },

  // Ad Banner Management Functions
  getAdBanners: async () => {
    const response = await api.get('/admin/ad-banners')
    return response.data
  },

  createAdBanner: async (data: {
    title: string
    description: string
    image?: File
    linkType: string
    externalLink?: string
    providerId?: number
    isActive: boolean
  }) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('linkType', data.linkType)
    formData.append('isActive', data.isActive.toString())

    if (data.externalLink) {
      formData.append('externalLink', data.externalLink)
    }
    if (data.providerId) {
      formData.append('providerId', data.providerId.toString())
    }
    if (data.image) {
      formData.append('image', data.image)
    }

    const response = await api.post('/admin/ad-banners', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  updateAdBanner: async (id: number, data: {
    title?: string
    description?: string
    image?: File
    linkType?: string
    externalLink?: string
    providerId?: number
    isActive?: boolean
  }) => {
    const formData = new FormData()

    if (data.title) formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    if (data.linkType) formData.append('linkType', data.linkType)
    if (data.externalLink) formData.append('externalLink', data.externalLink)
    if (data.providerId) formData.append('providerId', data.providerId.toString())
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString())
    if (data.image) formData.append('image', data.image)

    const response = await api.put(`/admin/ad-banners/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  deleteAdBanner: async (id: number) => {
    const response = await api.delete(`/admin/ad-banners/${id}`)
    return response.data
  },

  // Notification Management Functions
  getAllNotifications: async () => {
    const response = await api.get('/admin/notifications')
    return response.data
  },

  createNotification: async (data: {
    title: string
    image?: File
    targetAudience: string[]
  }) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('targetAudience', JSON.stringify(data.targetAudience))

    if (data.image) {
      formData.append('image', data.image)
    }

    const response = await api.post('/admin/notifications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  sendNotification: async (id: number) => {
    const response = await api.put(`/admin/notifications/${id}/send`)
    return response.data
  },

  deleteNotification: async (id: number) => {
    const response = await api.delete(`/admin/notifications/${id}`)
    return response.data
  }
}