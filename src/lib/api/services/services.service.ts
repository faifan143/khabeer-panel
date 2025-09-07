import { api } from '../axios'
import { Service, CreateServiceDto, UpdateServiceDto, Category, CreateCategoryDto, UpdateCategoryDto, PaginatedResponse } from '../types'

export class ServicesService {
  // Services
  static async getAllServices(page: number = 1, limit: number = 10, serviceType?: 'NORMAL' | 'KHABEER'): Promise<PaginatedResponse<Service>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    if (serviceType) {
      params.append('serviceType', serviceType)
    }
    const response = await api.get<PaginatedResponse<Service>>(`/services?${params.toString()}`)
    return response.data
  }

  static async getNormalServices(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Service>> {
    const response = await api.get<PaginatedResponse<Service>>(`/services/normal?page=${page}&limit=${limit}`)
    return response.data
  }

  static async getKhabeerServices(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Service>> {
    const response = await api.get<PaginatedResponse<Service>>(`/services/khabeer?page=${page}&limit=${limit}`)
    return response.data
  }

  static async getServiceById(id: number): Promise<Service> {
    const response = await api.get<Service>(`/services/${id}`)
    return response.data
  }

  static async createService(serviceData: CreateServiceDto, imageFile?: File): Promise<Service> {
    const formData = new FormData()

    // Add all service data to formData (excluding image if we have a file)
    Object.entries(serviceData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && (key !== 'image' || !imageFile)) {
        formData.append(key, value.toString())
      }
    })

    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile)
    }

    const response = await api.post<Service>('/services', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  static async updateService(id: number, serviceData: UpdateServiceDto, imageFile?: File): Promise<Service> {
    const formData = new FormData()

    // Add all service data to formData (excluding image if we have a file)
    Object.entries(serviceData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && (key !== 'image' || !imageFile)) {
        formData.append(key, value.toString())
      }
    })

    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile)
    }

    const response = await api.put<Service>(`/services/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  static async deleteService(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/services/${id}`)
    return response.data
  }

  static async getServicesByCategory(categoryId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Service>> {
    const response = await api.get<PaginatedResponse<Service>>(`/services/category/${categoryId}?page=${page}&limit=${limit}`)
    return response.data
  }

  static async searchServices(query: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Service>> {
    const response = await api.get<PaginatedResponse<Service>>(`/services/search?q=${query}&page=${page}&limit=${limit}`)
    return response.data
  }

  static async getTopServices(limit: number = 5): Promise<Service[]> {
    const response = await api.get<Service[]>(`/services/top?limit=${limit}`)
    return response.data
  }

  // Categories
  static async getAllCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories')
    return response.data
  }

  static async getCategoryById(id: number): Promise<Category> {
    const response = await api.get<Category>(`/categories/${id}`)
    return response.data
  }

  static async createCategory(categoryData: CreateCategoryDto, imageFile?: File): Promise<Category> {
    const formData = new FormData()

    // Add all category data to formData (excluding image if we have a file)
    Object.entries(categoryData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && (key !== 'image' || !imageFile)) {
        formData.append(key, value.toString())
      }
    })

    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile)
    }

    const response = await api.post<Category>('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  static async updateCategory(id: number, categoryData: UpdateCategoryDto, imageFile?: File): Promise<Category> {
    const formData = new FormData()

    // Add all category data to formData (excluding image if we have a file)
    Object.entries(categoryData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && (key !== 'image' || !imageFile)) {
        formData.append(key, value.toString())
      }
    })

    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile)
    }

    const response = await api.put<Category>(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  static async deleteCategory(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/categories/${id}`)
    return response.data
  }

  static async searchCategories(query: string): Promise<Category[]> {
    const response = await api.get<Category[]>(`/categories/search?q=${query}`)
    return response.data
  }
}