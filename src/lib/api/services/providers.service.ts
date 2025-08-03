import { api } from '../axios'
import { Provider, CreateProviderDto, UpdateProviderDto, PaginatedResponse } from '../types'

export class ProvidersService {
  static async getAllProviders(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Provider>> {
    const response = await api.get<PaginatedResponse<Provider>>(`/providers?page=${page}&limit=${limit}`)
    return response.data
  }

  static async getProviderById(id: number): Promise<Provider> {
    const response = await api.get<Provider>(`/providers/${id}`)
    return response.data
  }

  static async createProvider(providerData: CreateProviderDto): Promise<Provider> {
    const response = await api.post<Provider>('/providers', providerData)
    return response.data
  }

  static async updateProvider(id: number, providerData: UpdateProviderDto): Promise<Provider> {
    const response = await api.put<Provider>(`/providers/${id}`, providerData)
    return response.data
  }

  static async deleteProvider(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/providers/${id}`)
    return response.data
  }

  static async searchProviders(query: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Provider>> {
    const response = await api.get<PaginatedResponse<Provider>>(`/providers/search?q=${query}&page=${page}&limit=${limit}`)
    return response.data
  }

  static async getProviderServices(providerId: number): Promise<any[]> {
    const response = await api.get<any[]>(`/providers/${providerId}/services`)
    return response.data
  }

  static async getProviderOrders(providerId: number): Promise<any[]> {
    const response = await api.get<any[]>(`/providers/${providerId}/orders`)
    return response.data
  }

  static async getProviderRatings(providerId: number): Promise<any[]> {
    const response = await api.get<any[]>(`/providers/${providerId}/ratings`)
    return response.data
  }

  static async getTopProviders(limit: number = 5): Promise<Provider[]> {
    const response = await api.get<Provider[]>(`/providers/top?limit=${limit}`)
    return response.data
  }
}