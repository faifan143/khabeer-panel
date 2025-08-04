import { api } from '../axios'

export interface RevenueStats {
  totalRevenue: number
  totalTransactions: number
  totalCommission: number
  netRevenue: number
}

export interface InvoiceData {
  invoiceId: number
  orderId: number
  paymentDate: string
  totalAmount: number
  discount: number
  netAmount: number
  commission: number
  user: {
    name: string
    email: string
  }
  provider: {
    name: string
    phone: string
  }
  service: {
    title: string
    commission: number
  }
  paymentStatus?: string
}

export interface OfferData {
  id: number
  provider: {
    id: number
    name: string
    image: string
    isVerified: boolean
  }
  service: {
    id: number
    title: string
    description: string
    image: string
  }
  startDate: string
  endDate: string
  originalPrice: number
  offerPrice: number
  description: string
  isActive: boolean
  discountAmount: number
  discountPercentage: number
}

export interface FinancialSummary {
  totalRevenue: number
  totalCommission: number
  totalDiscounts: number
  netIncome: number
  totalOffers: number
  activeOffers: number
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  totalTransactions: number
}

export class FinanceService {
  // Get revenue statistics
  static async getRevenueStats(startDate?: string, endDate?: string): Promise<RevenueStats> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await api.get(`/admin/revenue?${params.toString()}`)
    return response.data
  }

  // Get revenue report with detailed invoice data (paid invoices only)
  static async getRevenueReport(startDate?: string, endDate?: string): Promise<InvoiceData[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await api.get(`/admin/reports/revenue?${params.toString()}`)
    return response.data
  }

  // Get all orders report (not just paid invoices)
  static async getAllOrdersReport(startDate?: string, endDate?: string): Promise<any[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await api.get(`/admin/reports/orders?${params.toString()}`)
    return response.data
  }

  // Get all offers
  static async getOffers(): Promise<OfferData[]> {
    const response = await api.get('/offers')
    return response.data.map((offer: any) => ({
      ...offer,
      discountAmount: offer.originalPrice - offer.offerPrice,
      discountPercentage: ((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100
    }))
  }

  // Get active offers only
  static async getActiveOffers(): Promise<OfferData[]> {
    const response = await api.get('/offers?activeOnly=true')
    return response.data.map((offer: any) => ({
      ...offer,
      discountAmount: offer.originalPrice - offer.offerPrice,
      discountPercentage: ((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100
    }))
  }

  // Get financial summary
  static async getFinancialSummary(startDate?: string, endDate?: string): Promise<FinancialSummary> {
    const [revenueStats, invoices, offers] = await Promise.all([
      this.getRevenueStats(startDate, endDate),
      this.getRevenueReport(startDate, endDate),
      this.getOffers()
    ])

    const totalDiscounts = invoices.reduce((sum, invoice) => sum + invoice.discount, 0)
    const activeOffers = offers.filter(offer => offer.isActive).length
    const totalOffers = offers.length

    return {
      totalRevenue: revenueStats.totalRevenue,
      totalCommission: revenueStats.totalCommission,
      totalDiscounts,
      netIncome: revenueStats.netRevenue - totalDiscounts,
      totalOffers,
      activeOffers,
      totalInvoices: invoices.length,
      paidInvoices: invoices.length, // All invoices in revenue report are paid
      pendingInvoices: 0, // Revenue report only includes paid invoices
      totalTransactions: revenueStats.totalTransactions
    }
  }

  // Get dashboard financial stats
  static async getDashboardStats() {
    const response = await api.get('/admin/dashboard')
    return response.data
  }
} 