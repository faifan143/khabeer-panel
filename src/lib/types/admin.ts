export interface DashboardStats {
  overview: {
    totalUsers: number
    totalProviders: number
    totalOrders: number
    totalRevenue: number
    totalCommission: number
  }
  pending: {
    verifications: number
    joinRequests: number
  }
  active: {
    users: number
    providers: number
    completedOrders: number
  }
  // Additional data included in the consolidated response
  popularServices: Array<{
    id: number
    name: string
    description: string
    price: number
    category: {
      id: number
      name: string
    } | null
    orderCount: number
  }>
  topProviders: Array<{
    id: number
    name: string
    email: string
    phone: string
    description: string
    image: string | null
    state: string
    isActive: boolean
    isVerified: boolean
    orderCount: number
    rating: number
  }>
  orderStats: OrderStats
}

export interface OverviewStats {
  period: string
  newUsers: number
  newProviders: number
  newOrders: number
  newRevenue: number
}

export interface ServiceStats {
  total: number
  popularServices: Array<{
    id: number
    name: string
    description: string
    price: number
    category: {
      id: number
      name: string
    }
    orderCount: number
  }>
}

export interface ProviderStats {
  total: number
  active: number
  verified: number
  topProviders: Array<{
    id: number
    name: string
    email: string
    phone: string
    description: string
    image: string | null
    state: string
    isActive: boolean
    isVerified: boolean
    orderCount: number
    rating: number
  }>
}

export interface OrderStats {
  total: number
  today: number
  yesterday: number
  thisWeek: number
  thisMonth: number
  byStatus: Array<{
    status: string
    count: number
  }>
}

export interface UserStats {
  total: number
  active: number
  inactive: number
}

export interface UserReport {
  userId: number
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
  createdAt: string
  completedOrders: number
  totalSpent: number
  ratingsGiven: number
  address?: string
  state?: string
  image?: string
}

// Enhanced Provider types for admin panel
export interface AdminProvider {
  id: number
  name: string
  email: string | null
  phone: string
  description: string
  image: string
  state: string
  isActive: boolean
  isVerified: boolean
  officialDocuments: string | null
  createdAt: string
  updatedAt: string
  providerServices: Array<{
    id: number
    price: number
    isActive: boolean
    service: {
      id: number
      title: string
      description: string
      category: {
        id: number
        titleEn: string
        titleAr: string
      } | null
    }
  }>
  orders: Array<{
    id: number
    totalAmount: number
    providerAmount: number
    commissionAmount: number
  }>
  offers: Array<{
    id: number
    originalPrice: number
    offerPrice: number
  }>
  _count: {
    orders: number
    providerServices: number
    ratings: number
  }
}

export interface AdminProviderJoinRequest {
  id: number
  providerId: number
  requestDate: string
  status: string
  adminNotes: string | null
  provider: {
    id: number
    name: string
    email: string | null
    phone: string
    description: string
    image: string
    state: string
    isActive: boolean
    officialDocuments: string | null
    providerServices: Array<{
      id: number
      price: number
      isActive: boolean
      service: {
        id: number
        title: string
        description: string
        category: {
          id: number
          titleEn: string
          titleAr: string
        } | null
      }
    }>
    _count: {
      providerServices: number
    }
  }
}

export interface AdBanner {
  id: number
  title: string
  description: string
  imageUrl: string | null
  linkType: "external" | "provider"
  externalLink: string | null
  providerId: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAdBannerDto {
  title: string
  description: string
  image?: File
  linkType: "external" | "provider"
  externalLink?: string
  providerId?: number
  isActive: boolean
}

export interface UpdateAdBannerDto {
  title?: string
  description?: string
  image?: File
  linkType?: "external" | "provider"
  externalLink?: string
  providerId?: number
  isActive?: boolean
} 