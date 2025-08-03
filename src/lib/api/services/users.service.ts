import { api } from '../axios'
import { User, CreateUserDto, UpdateUserDto, PaginatedResponse } from '../types'

export class UsersService {
  static async getAllUsers(page: number = 1, limit: number = 10): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`)
    return response.data
  }

  static async getUserById(id: number): Promise<User> {
    const response = await api.get<User>(`/users/${id}`)
    return response.data
  }

  static async createUser(userData: CreateUserDto): Promise<User> {
    const response = await api.post<User>('/users', userData)
    return response.data
  }

  static async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, userData)
    return response.data
  }

  static async deleteUser(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/users/${id}`)
    return response.data
  }

  static async searchUsers(query: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>(`/users/search?q=${query}&page=${page}&limit=${limit}`)
    return response.data
  }

  static async getUserOrders(userId: number): Promise<any[]> {
    const response = await api.get<any[]>(`/users/${userId}/orders`)
    return response.data
  }

  static async getUserRatings(userId: number): Promise<any[]> {
    const response = await api.get<any[]>(`/users/${userId}/ratings`)
    return response.data
  }
}