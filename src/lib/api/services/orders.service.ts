import { api } from '../axios'
import { Order, CreateOrderDto, UpdateOrderDto, PaginatedResponse } from '../types'

export class OrdersService {
  static async getAllOrders(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>(`/orders?page=${page}&limit=${limit}`)
    return response.data
  }

  static async getOrderById(id: number): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`)
    return response.data
  }

  static async getOrderByBookingId(bookingId: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/booking/${bookingId}`)
    return response.data
  }

  static async createOrder(orderData: CreateOrderDto): Promise<Order> {
    const response = await api.post<Order>('/orders', orderData)
    return response.data
  }

  static async updateOrder(id: number, orderData: UpdateOrderDto): Promise<Order> {
    const response = await api.put<Order>(`/orders/${id}`, orderData)
    return response.data
  }

  static async deleteOrder(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/orders/${id}`)
    return response.data
  }

  static async getDailyOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders/daily')
    return response.data
  }

  static async getOrdersByStatus(status: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>(`/orders/status/${status}?page=${page}&limit=${limit}`)
    return response.data
  }

  static async getOrdersByUser(userId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>(`/orders/user/${userId}?page=${page}&limit=${limit}`)
    return response.data
  }

  static async getOrdersByProvider(providerId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>(`/orders/provider/${providerId}?page=${page}&limit=${limit}`)
    return response.data
  }

  static async getOrdersByService(serviceId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>(`/orders/service/${serviceId}?page=${page}&limit=${limit}`)
    return response.data
  }

  static async searchOrders(query: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>(`/orders/search?q=${query}&page=${page}&limit=${limit}`)
    return response.data
  }

  static async updateOrderStatus(id: number, status: string): Promise<Order> {
    const response = await api.put<Order>(`/orders/${id}/status`, { status })
    return response.data
  }

  static async cancelOrder(id: number, reason?: string): Promise<Order> {
    const response = await api.put<Order>(`/orders/${id}/cancel`, { reason })
    return response.data
  }

  static async completeOrder(id: number): Promise<Order> {
    const response = await api.put<Order>(`/orders/${id}/complete`)
    return response.data
  }
}