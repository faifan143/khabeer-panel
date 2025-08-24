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
    status: string
    totalAmount: number
    commissionAmount: number
    user: {
      id: number
      name: string
      email: string
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
}
