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
} 