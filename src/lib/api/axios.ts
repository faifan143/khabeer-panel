import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Create axios instance with default config
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem('auth-storage')
        ? JSON.parse(localStorage.getItem('auth-storage')!).state.token
        : null
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    (error) => {
      // Handle common errors
      if (error.response?.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// Singleton instance
let axiosInstance: AxiosInstance | null = null

export const getAxiosInstance = (): AxiosInstance => {
  if (!axiosInstance) {
    axiosInstance = createAxiosInstance()
  }
  return axiosInstance
}

// Export the instance directly for convenience
export const api = getAxiosInstance()

// Type for API response wrapper
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

// Type for paginated responses
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}