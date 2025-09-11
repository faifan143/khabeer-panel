import { api } from '../axios'
import type { Invoice, CreateInvoiceDto, UpdateInvoiceDto, InvoiceFilters, InvoiceStats, ServiceBreakdown } from '@/lib/types/invoice'

// Helper function to transform API response to Invoice format
const transformInvoiceResponse = (apiInvoice: any): Invoice => {
  // Calculate total commission from servicesBreakdown
  const totalCommission = apiInvoice.order?.servicesBreakdown?.reduce(
    (sum: number, service: ServiceBreakdown) => sum + (service.commissionAmount || 0),
    0
  ) || 0

  // Calculate total provider amount from servicesBreakdown
  const totalProviderAmount = apiInvoice.order?.servicesBreakdown?.reduce(
    (sum: number, service: ServiceBreakdown) => sum + service.totalPrice,
    0
  ) || 0


  return {
    ...apiInvoice,
    commission: totalCommission,
    // Map the order data to match our Invoice interface
    order: apiInvoice.order ? {
      ...apiInvoice.order,
      commissionAmount: totalCommission,
      providerAmount: totalProviderAmount,
      // Keep the original service data for backward compatibility
      service: {
        id: apiInvoice.order.serviceId,
        title: apiInvoice.order.service?.title || apiInvoice.order.servicesBreakdown?.[0]?.serviceTitle || '',
        description: apiInvoice.order.service?.description || apiInvoice.order.servicesBreakdown?.[0]?.serviceDescription || '',
        price: apiInvoice.order.servicesBreakdown?.[0]?.unitPrice || 0
      }
    } : undefined
  }
}

export class InvoiceService {
  // Get all invoices with filtering
  static async getInvoices(filters: InvoiceFilters = {}): Promise<{ data: Invoice[], total: number }> {
    try {
      const params: any = {}

      // Map paymentStatus to status for backend API
      if (filters.paymentStatus && filters.paymentStatus !== 'all') {
        params.status = filters.paymentStatus
      }

      if (filters.startDate) {
        params.startDate = filters.startDate
      }

      if (filters.endDate) {
        params.endDate = filters.endDate
      }

      const response = await api.get('/admin/invoices', { params })

      // Handle both response formats: { data: [], total: number } or direct array
      let invoices: any[] = []
      if (Array.isArray(response.data)) {
        invoices = response.data
      } else {
        invoices = response.data.data || []
      }

      // Transform each invoice to match our Invoice interface
      const transformedInvoices = invoices.map(transformInvoiceResponse)

      return {
        data: transformedInvoices,
        total: transformedInvoices.length
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      throw new Error('Failed to fetch invoices')
    }
  }

  // Get specific invoice by ID
  static async getInvoice(id: number): Promise<Invoice> {
    try {
      const response = await api.get(`/admin/invoices/${id}`)
      return transformInvoiceResponse(response.data)
    } catch (error) {
      console.error('Error fetching invoice:', error)
      throw new Error('Failed to fetch invoice')
    }
  }

  // Create new invoice
  static async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
    try {
      const response = await api.post('/admin/invoices', data)
      return response.data
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw new Error('Failed to create invoice')
    }
  }

  // Update invoice
  static async updateInvoice(id: number, data: UpdateInvoiceDto): Promise<Invoice> {
    try {
      const response = await api.put(`/admin/invoices/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating invoice:', error)
      throw new Error('Failed to update invoice')
    }
  }

  // Update payment status
  static async updatePaymentStatus(id: number, paymentStatus: string, paymentMethod?: string): Promise<Invoice> {
    try {
      const body: { paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'; paymentMethod?: string } = {
        paymentStatus: paymentStatus as 'pending' | 'paid' | 'failed' | 'refunded'
      }

      if (paymentMethod) {
        body.paymentMethod = paymentMethod
      }

      const response = await api.put(`/admin/invoices/${id}/payment-status`, body)
      return response.data
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw new Error('Failed to update payment status')
    }
  }

  // Mark invoice as paid
  static async markAsPaid(id: number, paymentMethod: string = 'Admin Payment'): Promise<Invoice> {
    try {
      const body: { paymentMethod?: string } = {}

      if (paymentMethod) {
        body.paymentMethod = paymentMethod
      }

      const response = await api.put(`/admin/invoices/${id}/mark-paid`, body)
      return response.data
    } catch (error) {
      console.error('Error marking invoice as paid:', error)
      throw new Error('Failed to mark invoice as paid')
    }
  }

  // Get invoice statistics
  static async getInvoiceStats(): Promise<InvoiceStats> {
    try {
      // Since there's no dedicated stats endpoint, calculate stats from all invoices
      const response = await api.get('/admin/invoices')

      // Handle both response formats: { data: [] } or direct array
      let invoices: any[] = []
      if (Array.isArray(response.data)) {
        invoices = response.data
      } else {
        invoices = response.data.data || []
      }

      // Transform invoices to get proper commission calculations
      const transformedInvoices = invoices.map(transformInvoiceResponse)

      const total = transformedInvoices.length
      const unpaid = transformedInvoices.filter((invoice: Invoice) => invoice.paymentStatus === 'unpaid').length
      const paid = transformedInvoices.filter((invoice: Invoice) => invoice.paymentStatus === 'paid').length
      const failed = transformedInvoices.filter((invoice: Invoice) => invoice.paymentStatus === 'failed').length

      // Calculate total amounts (what customer pays)
      const totalAmount = transformedInvoices.reduce((sum: number, invoice: Invoice) => sum + invoice.totalAmount, 0)
      const paidAmount = transformedInvoices
        .filter((invoice: Invoice) => invoice.paymentStatus === 'paid')
        .reduce((sum: number, invoice: Invoice) => sum + invoice.totalAmount, 0)
      const pendingAmount = transformedInvoices
        .filter((invoice: Invoice) => invoice.paymentStatus === 'unpaid')
        .reduce((sum: number, invoice: Invoice) => sum + invoice.totalAmount, 0)

      // Calculate provider amounts and commissions from servicesBreakdown
      let totalProviderAmount = 0
      let totalCommission = 0
      let totalProviderNetAmount = 0
      let paidProviderAmount = 0
      let paidCommission = 0
      let pendingProviderAmount = 0
      let pendingCommission = 0

      transformedInvoices.forEach((invoice: Invoice) => {
        // Calculate from servicesBreakdown for accurate amounts
        const providerAmount = invoice.order?.servicesBreakdown?.reduce(
          (sum: number, service: ServiceBreakdown) => sum + service.totalPrice,
          0
        ) || 0

        const commission = invoice.order?.servicesBreakdown?.reduce(
          (sum: number, service: ServiceBreakdown) => sum + service.commissionAmount,
          0
        ) || 0

        const providerNetAmount = providerAmount - commission

        // Add to totals
        totalProviderAmount += providerAmount
        totalCommission += commission
        totalProviderNetAmount += providerNetAmount

        // Add to status-specific totals
        if (invoice.paymentStatus === 'paid') {
          paidProviderAmount += providerAmount
          paidCommission += commission
        } else if (invoice.paymentStatus === 'unpaid') {
          pendingProviderAmount += providerAmount
          pendingCommission += commission
        }
      })

      return {
        total,
        unpaid,
        paid,
        failed,
        totalAmount,
        paidAmount,
        pendingAmount,
        totalProviderAmount,
        totalCommission,
        totalProviderNetAmount,
        paidProviderAmount,
        paidCommission,
        pendingProviderAmount,
        pendingCommission
      }
    } catch (error) {
      console.error('Error fetching invoice stats:', error)
      throw new Error('Failed to fetch invoice statistics')
    }
  }

  // Delete invoice (for cancelled orders)
  static async deleteInvoice(id: number): Promise<void> {
    try {
      await api.delete(`/admin/invoices/${id}`)
    } catch (error) {
      console.error('Error deleting invoice:', error)
      throw new Error('Failed to delete invoice')
    }
  }
}
