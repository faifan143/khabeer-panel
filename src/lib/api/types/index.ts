// Base types
export interface BaseEntity {
  id: number
  createdAt: string
  updatedAt: string
}

// User types
export interface User extends BaseEntity {
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  image: string
  address: string
  phone: string
  state: string
  isActive: boolean
  officialDocuments?: string
}

export interface CreateUserDto {
  name: string
  email: string
  password: string
  image: string
  address: string
  phone: string
  state: string
}

export interface UpdateUserDto {
  name?: string
  email?: string
  image?: string
  address?: string
  phone?: string
  state?: string
  isActive?: boolean
}

// Provider types
export interface Provider extends BaseEntity {
  name: string
  email?: string
  image: string
  description: string
  state: string
  phone: string
  isActive: boolean
  isVerified: boolean
  location?: {
    lat: number
    lng: number
  }
  officialDocuments?: string
}

export interface CreateProviderDto {
  name: string
  email?: string
  password?: string
  image: string
  description: string
  state: string
  phone: string
  location?: {
    lat: number
    lng: number
  }
  officialDocuments?: string
}

export interface UpdateProviderDto {
  name?: string
  email?: string
  image?: string
  description?: string
  state?: string
  phone?: string
  isActive?: boolean
  isVerified?: boolean
  location?: {
    lat: number
    lng: number
  }
  officialDocuments?: string
}

// Category types
export interface Category extends BaseEntity {
  image: string
  titleAr: string
  titleEn: string
  state: string
}

export interface CreateCategoryDto {
  image: string
  titleAr: string
  titleEn: string
  state: string
}

export interface UpdateCategoryDto {
  image?: string
  titleAr?: string
  titleEn?: string
  state?: string
}

// Service types
export interface Service extends BaseEntity {
  image: string
  title: string
  description: string
  commission: number
  whatsapp: string
  categoryId?: number
  category?: Category
}

export interface CreateServiceDto {
  image: string
  title: string
  description: string
  commission: number
  whatsapp: string
  categoryId?: number
}

export interface UpdateServiceDto {
  image?: string
  title?: string
  description?: string
  commission?: number
  whatsapp?: string
  categoryId?: number
}

// Order types
export interface Order extends BaseEntity {
  bookingId: string
  userId: number
  providerId: number
  serviceId: number
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  orderDate: string
  scheduledDate?: string
  location?: string
  locationDetails?: string
  providerLocation?: {
    lat: number
    lng: number
  }
  quantity: number
  totalAmount: number
  providerAmount: number
  commissionAmount: number
  user?: User
  provider?: Provider
  service?: Service
  invoice?: Invoice
}

export interface CreateOrderDto {
  userId: number
  providerId: number
  serviceId: number
  scheduledDate?: string
  location?: string
  locationDetails?: string
  quantity?: number
}

export interface UpdateOrderDto {
  status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  scheduledDate?: string
  location?: string
  locationDetails?: string
  providerLocation?: {
    lat: number
    lng: number
  }
  quantity?: number
}

// Invoice types
export interface Invoice extends BaseEntity {
  orderId: number
  paymentDate?: string
  totalAmount: number
  discount: number
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod?: string
  isVerified: boolean
  verifiedBy?: number
  verifiedAt?: string
  payoutStatus: 'pending' | 'paid' | 'failed'
  payoutDate?: string
  order?: Order
}

// Provider Verification types
export interface ProviderVerification {
  id: string
  providerId: number
  status: 'pending' | 'approved' | 'rejected'
  documents: string[]
  adminNotes?: string
  createdAt: string
  updatedAt: string
  provider?: Provider
}

// Provider Join Request types
export interface ProviderJoinRequest {
  providerId: number
  requestDate: string
  status: 'pending' | 'approved' | 'rejected'
  adminNotes?: string
  provider?: Provider
}

// Provider Service types
export interface ProviderService {
  providerId: number
  serviceId: number
  price: number
  isActive: boolean
  provider?: Provider
  service?: Service
}

// Offer types
export interface Offer {
  providerId: number
  serviceId: number
  startDate: string
  endDate: string
  originalPrice: number
  offerPrice: number
  description: string
  isActive: boolean
  provider?: Provider
  service?: Service
}

// Provider Rating types
export interface ProviderRating {
  userId: number
  providerId: number
  orderId?: number
  rating: number
  comment?: string
  ratingDate: string
  user?: User
  provider?: Provider
}

// Location Tracking types
export interface LocationTracking {
  orderId: number
  providerId: number
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: string
  isActive: boolean
  order?: Order
  provider?: Provider
}

// Dashboard Stats types
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
}

export interface OverviewStats {
  period: string
  newUsers: number
  newProviders: number
  newOrders: number
  newRevenue: number
}

export interface RevenueStats {
  totalRevenue: number
  totalTransactions: number
  totalCommission: number
  netRevenue: number
}

export interface UserStats {
  total: number
  active: number
  inactive: number
}

export interface ProviderStats {
  total: number
  active: number
  inactive: number
  verified: number
  unverified: number
}

export interface OrderStats {
  total: number
  byStatus: Array<{
    status: string
    count: number
  }>
}

export interface ServiceStats {
  total: number
  popularServices: Array<Service & { orderCount: number }>
}

// Auth types
export interface LoginDto {
  email: string
  password: string
}

export interface PhoneLoginDto {
  phone: string
  otp: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
  phone: string
}

export interface AuthResponse {
  user: {
    id: number
    email: string
    role: string
  }
  access_token: string
}

// API Response types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}