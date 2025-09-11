export interface Invoice {
  id: number
  orderId: number
  totalAmount: number
  discount: number
  netAmount: number
  commission: number
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded'
  paymentDate?: string
  paymentMethod?: string
  isVerified: boolean
  verifiedBy?: number
  verifiedAt?: string
  payoutStatus: 'pending' | 'paid' | 'failed'
  payoutDate?: string
  createdAt: string
  updatedAt: string

  // Related data
  order?: {
    id: number
    userId: number
    providerId: number
    serviceId: number
    status: string
    orderDate: string
    bookingId: string
    commissionAmount: number
    location?: string
    locationDetails?: string
    providerAmount: number
    providerNetAmount: number
    providerLocation?: string
    quantity: number
    scheduledDate: string
    totalAmount: number
    isMultipleServices: boolean
    servicesBreakdown: ServiceBreakdown[]
    user: {
      id: number
      name: string
      email?: string
      phone: string
    }
    provider: {
      id: number
      name: string
      email: string
      phone: string
    }
    service: {
      id: number
      title: string
      description: string
      price: number
    }
  }
}

export interface ServiceBreakdown {
  quantity: number
  serviceId: number
  unitPrice: number
  commission: number
  totalPrice: number
  serviceImage: string
  serviceTitle: string
  commissionAmount: number
  serviceDescription: string
}

export interface CreateInvoiceDto {
  orderId: number
  totalAmount: number
  discount: number
  commission: number
}

export interface UpdateInvoiceDto {
  paymentStatus?: 'unpaid' | 'paid' | 'failed' | 'refunded'
  paymentDate?: string
  paymentMethod?: string
  isVerified?: boolean
  payoutStatus?: 'pending' | 'paid' | 'failed'
  payoutDate?: string
}

export interface InvoiceFilters {
  paymentStatus?: string
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
}

export interface InvoiceStats {
  total: number
  unpaid: number
  paid: number
  failed: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  totalProviderAmount: number
  totalCommission: number
  totalProviderNetAmount: number
  paidProviderAmount: number
  paidCommission: number
  pendingProviderAmount: number
  pendingCommission: number
}
