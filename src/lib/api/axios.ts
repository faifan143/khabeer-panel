import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (!authStorage) return null

    const authData = JSON.parse(authStorage)
    // Zustand persist stores data in state property
    const token = authData.state?.token || authData.token

    return token || null
  } catch (error) {
    console.error('Error accessing auth token:', error)
    return null
  }
}

// Create axios instance with default config
const createAxiosInstance = (): AxiosInstance => {
  const baseURL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api')
  console.log('Axios base URL:', baseURL)

  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = getAuthToken()
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
        // Unauthorized - clear auth storage and redirect to login
        try {
          localStorage.removeItem('auth-storage')
          // Force a page reload to clear any in-memory state
          window.location.href = '/login'
        } catch (e) {
          console.error('Error during logout:', e)
          window.location.href = '/login'
        }
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