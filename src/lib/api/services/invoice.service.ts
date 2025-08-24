import { api } from '../axios'
import type { Invoice, CreateInvoiceDto, UpdateInvoiceDto, InvoiceFilters, InvoiceStats } from '@/lib/types/invoice'

// Mock data for development (replace with actual API calls when backend is ready)
const mockInvoices: Invoice[] = [
  {
    id: 1,
    orderId: 101,
    totalAmount: 150.00,
    discount: 10.00,
    netAmount: 140.00,
    commission: 15.00,
    paymentStatus: 'unpaid',
    isVerified: false,
    payoutStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    order: {
      id: 101,
      status: 'completed',
      totalAmount: 150.00,
      commissionAmount: 15.00,
      user: {
        id: 1,
        name: 'Ahmed Al-Rashid',
        email: 'ahmed@example.com',
        phone: '+968 9123 4567'
      },
      provider: {
        id: 1,
        name: 'Oman Services Co.',
        email: 'info@omanservices.com',
        phone: '+968 2456 7890'
      },
      service: {
        id: 1,
        title: 'Home Cleaning Service',
        description: 'Professional home cleaning service',
        price: 150.00
      }
    }
  },
  {
    id: 2,
    orderId: 102,
    totalAmount: 200.00,
    discount: 0.00,
    netAmount: 200.00,
    commission: 20.00,
    paymentStatus: 'paid',
    paymentDate: new Date().toISOString(),
    paymentMethod: 'Bank Transfer',
    isVerified: true,
    verifiedBy: 1,
    verifiedAt: new Date().toISOString(),
    payoutStatus: 'paid',
    payoutDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString(),
    order: {
      id: 102,
      status: 'completed',
      totalAmount: 200.00,
      commissionAmount: 20.00,
      user: {
        id: 2,
        name: 'Fatima Al-Zahra',
        email: 'fatima@example.com',
        phone: '+968 9234 5678'
      },
      provider: {
        id: 2,
        name: 'Muscat Maintenance',
        email: 'contact@muscatmaintenance.com',
        phone: '+968 2567 8901'
      },
      service: {
        id: 2,
        title: 'Plumbing Repair',
        description: 'Emergency plumbing repair service',
        price: 200.00
      }
    }
  }
]

export class InvoiceService {
  // Get all invoices with filtering
  static async getInvoices(filters: InvoiceFilters = {}): Promise<{ data: Invoice[], total: number }> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.get('/admin/invoices', { params: filters })
      // return response.data
      
      // Mock implementation
      let filteredInvoices = [...mockInvoices]
      
      // Apply filters
      if (filters.paymentStatus && filters.paymentStatus !== 'all') {
        filteredInvoices = filteredInvoices.filter(invoice => 
          invoice.paymentStatus === filters.paymentStatus
        )
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        filteredInvoices = filteredInvoices.filter(invoice =>
          invoice.order?.user.name.toLowerCase().includes(searchTerm) ||
          invoice.order?.provider.name.toLowerCase().includes(searchTerm) ||
          invoice.order?.service.title.toLowerCase().includes(searchTerm)
        )
      }
      
      if (filters.startDate) {
        filteredInvoices = filteredInvoices.filter(invoice =>
          new Date(invoice.createdAt) >= new Date(filters.startDate!)
        )
      }
      
      if (filters.endDate) {
        filteredInvoices = filteredInvoices.filter(invoice =>
          new Date(invoice.createdAt) <= new Date(filters.endDate!)
        )
      }
      
      // Pagination
      const page = filters.page || 1
      const limit = filters.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex)
      
      return {
        data: paginatedInvoices,
        total: filteredInvoices.length
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      throw new Error('Failed to fetch invoices')
    }
  }

  // Get specific invoice by ID
  static async getInvoice(id: number): Promise<Invoice> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.get(`/admin/invoices/${id}`)
      // return response.data
      
      // Mock implementation
      const invoice = mockInvoices.find(inv => inv.id === id)
      if (!invoice) {
        throw new Error('Invoice not found')
      }
      return invoice
    } catch (error) {
      console.error('Error fetching invoice:', error)
      throw new Error('Failed to fetch invoice')
    }
  }

  // Create new invoice
  static async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.post('/admin/invoices', data)
      // return response.data
      
      // Mock implementation
      const newInvoice: Invoice = {
        id: Math.max(...mockInvoices.map(inv => inv.id)) + 1,
        orderId: data.orderId,
        totalAmount: data.totalAmount,
        discount: data.discount,
        netAmount: data.totalAmount - data.discount,
        commission: data.commission,
        paymentStatus: 'unpaid',
        isVerified: false,
        payoutStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      mockInvoices.push(newInvoice)
      return newInvoice
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw new Error('Failed to create invoice')
    }
  }

  // Update invoice
  static async updateInvoice(id: number, data: UpdateInvoiceDto): Promise<Invoice> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.put(`/admin/invoices/${id}`, data)
      // return response.data
      
      // Mock implementation
      const invoiceIndex = mockInvoices.findIndex(inv => inv.id === id)
      if (invoiceIndex === -1) {
        throw new Error('Invoice not found')
      }
      
      const updatedInvoice = {
        ...mockInvoices[invoiceIndex],
        ...data,
        updatedAt: new Date().toISOString()
      }
      
      mockInvoices[invoiceIndex] = updatedInvoice
      return updatedInvoice
    } catch (error) {
      console.error('Error updating invoice:', error)
      throw new Error('Failed to update invoice')
    }
  }

  // Update payment status
  static async updatePaymentStatus(id: number, paymentStatus: string, paymentMethod?: string): Promise<Invoice> {
    try {
      const updateData: UpdateInvoiceDto = {
        paymentStatus: paymentStatus as any,
        paymentDate: paymentStatus === 'paid' ? new Date().toISOString() : undefined,
        paymentMethod
      }
      
      return await this.updateInvoice(id, updateData)
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw new Error('Failed to update payment status')
    }
  }

  // Mark invoice as paid
  static async markAsPaid(id: number, paymentMethod: string = 'Admin Payment'): Promise<Invoice> {
    try {
      return await this.updatePaymentStatus(id, 'paid', paymentMethod)
    } catch (error) {
      console.error('Error marking invoice as paid:', error)
      throw new Error('Failed to mark invoice as paid')
    }
  }

  // Get invoice statistics
  static async getInvoiceStats(): Promise<InvoiceStats> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.get('/admin/invoices/stats')
      // return response.data
      
      // Mock implementation
      const total = mockInvoices.length
      const unpaid = mockInvoices.filter(inv => inv.paymentStatus === 'unpaid').length
      const paid = mockInvoices.filter(inv => inv.paymentStatus === 'paid').length
      const failed = mockInvoices.filter(inv => inv.paymentStatus === 'failed').length
      
      const totalAmount = mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
      const paidAmount = mockInvoices
        .filter(inv => inv.paymentStatus === 'paid')
        .reduce((sum, inv) => sum + inv.totalAmount, 0)
      const pendingAmount = mockInvoices
        .filter(inv => inv.paymentStatus === 'unpaid')
        .reduce((sum, inv) => sum + inv.totalAmount, 0)
      
      return {
        total,
        unpaid,
        paid,
        failed,
        totalAmount,
        paidAmount,
        pendingAmount
      }
    } catch (error) {
      console.error('Error fetching invoice stats:', error)
      throw new Error('Failed to fetch invoice statistics')
    }
  }

  // Delete invoice (for cancelled orders)
  static async deleteInvoice(id: number): Promise<void> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // await api.delete(`/admin/invoices/${id}`)
      
      // Mock implementation
      const invoiceIndex = mockInvoices.findIndex(inv => inv.id === id)
      if (invoiceIndex === -1) {
        throw new Error('Invoice not found')
      }
      
      mockInvoices.splice(invoiceIndex, 1)
    } catch (error) {
      console.error('Error deleting invoice:', error)
      throw new Error('Failed to delete invoice')
    }
  }
}
