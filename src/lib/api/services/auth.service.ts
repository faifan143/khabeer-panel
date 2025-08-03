import { api } from '../axios'
import { LoginDto, PhoneLoginDto, RegisterDto, AuthResponse, User } from '../types'

export class AuthService {
  static async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    return response.data
  }

  static async phoneLogin(phoneData: PhoneLoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/phone-login', phoneData)
    return response.data
  }

  static async register(userData: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData)
    return response.data
  }

  static async sendOtp(phone: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/send-otp', { phone })
    return response.data
  }

  static async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  }

  static async refreshToken(): Promise<{ token: string }> {
    const response = await api.post<{ token: string }>('/auth/refresh')
    return response.data
  }
}