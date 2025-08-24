import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../services/admin.service'
import type { InvoiceFilters, UpdateInvoiceDto } from '@/lib/types/invoice'
import toast from 'react-hot-toast'

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

// Admin User Management hooks
export const useUserReport = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['admin', 'user-report', startDate, endDate],
    queryFn: () => adminService.getUserReport(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAdminActivateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.activateUser(id),
    onSuccess: () => {
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-report'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

export const useAdminDeactivateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.deactivateUser(id),
    onSuccess: () => {
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-report'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

// Admin Orders hooks
export const useAdminOrders = (page: number = 1, limit: number = 1000) => {
  return useQuery({
    queryKey: ['admin', 'orders', page, limit],
    queryFn: () => adminService.getAllOrders(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useAdminUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

export const useAdminCancelOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      adminService.cancelOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

export const useAdminCompleteOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.completeOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

export const useAdminAcceptOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => adminService.acceptOrder(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

export const useAdminRejectOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => adminService.rejectOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

// Admin Provider Management hooks
export const useAdminProviders = () => {
  return useQuery({
    queryKey: ['admin', 'providers'],
    queryFn: adminService.getAllProviders,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAdminUnverifiedProviders = () => {
  return useQuery({
    queryKey: ['admin', 'providers', 'unverified'],
    queryFn: adminService.getUnverifiedProviders,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useAdminActivateProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.activateProvider(id),
    onSuccess: () => {
      // Invalidate all provider-related queries
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'provider-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

export const useAdminDeactivateProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.deactivateProvider(id),
    onSuccess: () => {
      // Invalidate all provider-related queries
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'provider-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

export const useAdminVerifyProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.verifyProvider(id),
    onSuccess: () => {
      // Invalidate all provider-related queries
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'provider-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

export const useAdminUnverifyProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.unverifyProvider(id),
    onSuccess: () => {
      // Invalidate all provider-related queries
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'provider-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

// Admin Verification Management hooks
export const useAdminPendingVerifications = () => {
  return useQuery({
    queryKey: ['admin', 'verifications', 'pending'],
    queryFn: adminService.getPendingVerifications,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useAdminApproveVerification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      adminService.approveVerification(id, notes),
    onSuccess: () => {
      // Invalidate all provider-related queries
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'provider-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

export const useAdminRejectVerification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      adminService.rejectVerification(id, notes),
    onSuccess: () => {
      // Invalidate all provider-related queries
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'provider-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

// Admin Join Requests Management hooks
export const useAdminPendingJoinRequests = () => {
  return useQuery({
    queryKey: ['admin', 'join-requests', 'pending'],
    queryFn: adminService.getPendingJoinRequests,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useAdminApproveJoinRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      adminService.approveJoinRequest(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'join-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'provider-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

export const useAdminRejectJoinRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      adminService.rejectJoinRequest(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'join-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'provider-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

// Admin Ratings hooks
export const useAdminRatings = () => {
  return useQuery({
    queryKey: ['admin', 'ratings'],
    queryFn: adminService.getAllRatings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Admin Settings hooks
export const useSystemSettings = (category?: string) => {
  return useQuery({
    queryKey: ['admin', 'settings', category],
    queryFn: () => adminService.getSystemSettings(category),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useUpdateSystemSetting = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ key, value, description, category }: {
      key: string
      value: string
      description?: string
      category?: string
    }) => adminService.updateSystemSetting(key, value, description, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] })
    },
  })
}

// File Upload hooks
export const useUploadLegalDocuments = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (files: File[]) => adminService.uploadLegalDocuments(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] })
    },
  })
}

export const useUploadBannerImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => adminService.uploadBannerImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ad-banners'] })
    },
  })
}

// Admin Sub-Admin hooks
export const useSubAdmins = () => {
  return useQuery({
    queryKey: ['admin', 'subadmins'],
    queryFn: adminService.getSubAdmins,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateSubAdmin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, email, password, permissions }: {
      name: string
      email: string
      password: string
      permissions: string[]
    }) => adminService.createSubAdmin(name, email, password, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subadmins'] })
    },
  })
}

export const useDeleteSubAdmin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.deleteSubAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subadmins'] })
    },
  })
}

// Admin Ad Banner hooks
export const useAdBanners = () => {
  return useQuery({
    queryKey: ['admin', 'ad-banners'],
    queryFn: adminService.getAdBanners,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateAdBanner = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      title: string
      description: string
      imageUrl?: string
      linkType: string
      externalLink?: string
      providerId?: number
      isActive: boolean
    }) => adminService.createAdBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ad-banners'] })
    },
  })
}

export const useUpdateAdBanner = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: {
      id: number
      data: {
        title?: string
        description?: string
        imageUrl?: string
        linkType?: string
        externalLink?: string
        providerId?: number
        isActive?: boolean
      }
    }) => adminService.updateAdBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ad-banners'] })
    },
  })
}

export const useDeleteAdBanner = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.deleteAdBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ad-banners'] })
    },
  })
}

// Admin Notification hooks
export const useNotifications = () => {
  return useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: adminService.getAllNotifications,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      title: string
      image?: File
      targetAudience: string[]
    }) => adminService.createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] })
    },
  })
}

export const useSendNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.sendNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] })
    },
  })
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] })
    },
  })
}

// Admin Invoice hooks
export const useAdminInvoices = (filters: InvoiceFilters = {}) => {
  return useQuery({
    queryKey: ['admin', 'invoices', filters],
    queryFn: () => adminService.getInvoices(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useAdminInvoice = (id: number) => {
  return useQuery({
    queryKey: ['admin', 'invoice', id],
    queryFn: () => adminService.getInvoice(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAdminInvoiceStats = () => {
  return useQuery({
    queryKey: ['admin', 'invoice-stats'],
    queryFn: () => adminService.getInvoiceStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAdminCreateInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoice-stats'] })
      toast.success('Invoice created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create invoice')
    },
  })
}

export const useAdminUpdateInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInvoiceDto }) =>
      adminService.updateInvoice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoice', id] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoice-stats'] })
      toast.success('Invoice updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update invoice')
    },
  })
}

export const useAdminUpdatePaymentStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, paymentStatus, paymentMethod }: { 
      id: number; 
      paymentStatus: string; 
      paymentMethod?: string 
    }) => adminService.updatePaymentStatus(id, paymentStatus, paymentMethod),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoice', id] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoice-stats'] })
      toast.success('Payment status updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update payment status')
    },
  })
}

export const useAdminMarkAsPaid = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, paymentMethod }: { id: number; paymentMethod?: string }) =>
      adminService.markAsPaid(id, paymentMethod),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoice', id] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoice-stats'] })
      toast.success('Invoice marked as paid successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark invoice as paid')
    },
  })
}

export const useAdminDeleteInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminService.deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoice-stats'] })
      toast.success('Invoice deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete invoice')
    },
  })
}