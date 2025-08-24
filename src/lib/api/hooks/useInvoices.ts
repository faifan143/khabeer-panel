import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { InvoiceService } from '../services/invoice.service'
import type { InvoiceFilters, UpdateInvoiceDto } from '@/lib/types/invoice'
import toast from 'react-hot-toast'

// Hook to fetch invoices with filters
export const useInvoices = (filters: InvoiceFilters = {}) => {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => InvoiceService.getInvoices(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook to fetch specific invoice
export const useInvoice = (id: number) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => InvoiceService.getInvoice(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to fetch invoice statistics
export const useInvoiceStats = () => {
  return useQuery({
    queryKey: ['invoice-stats'],
    queryFn: () => InvoiceService.getInvoiceStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to create invoice
export const useCreateInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: InvoiceService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] })
      toast.success('Invoice created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create invoice')
    },
  })
}

// Hook to update invoice
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInvoiceDto }) =>
      InvoiceService.updateInvoice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] })
      toast.success('Invoice updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update invoice')
    },
  })
}

// Hook to update payment status
export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, paymentStatus, paymentMethod }: { 
      id: number; 
      paymentStatus: string; 
      paymentMethod?: string 
    }) => InvoiceService.updatePaymentStatus(id, paymentStatus, paymentMethod),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] })
      toast.success('Payment status updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update payment status')
    },
  })
}

// Hook to mark invoice as paid
export const useMarkAsPaid = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, paymentMethod }: { id: number; paymentMethod?: string }) =>
      InvoiceService.markAsPaid(id, paymentMethod),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] })
      toast.success('Invoice marked as paid successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark invoice as paid')
    },
  })
}

// Hook to delete invoice
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: InvoiceService.deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] })
      toast.success('Invoice deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete invoice')
    },
  })
}
