import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AuthService } from '../services/auth.service'
import { LoginDto, PhoneLoginDto, RegisterDto, User } from '../types'
import { useAuthStore } from '@/lib/stores/auth.store'

export const useLogin = () => {
  const queryClient = useQueryClient()
  const { login } = useAuthStore()

  return useMutation({
    mutationFn: (credentials: LoginDto) => AuthService.login(credentials),
    onSuccess: (data) => {
      // Store in Zustand store (which persists to localStorage)
      login(data.user, data.token)
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export const usePhoneLogin = () => {
  const queryClient = useQueryClient()
  const { login } = useAuthStore()

  return useMutation({
    mutationFn: (phoneData: PhoneLoginDto) => AuthService.phoneLogin(phoneData),
    onSuccess: (data) => {
      login(data.user, data.token)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export const useRegister = () => {
  const queryClient = useQueryClient()
  const { login } = useAuthStore()

  return useMutation({
    mutationFn: (userData: RegisterDto) => AuthService.register(userData),
    onSuccess: (data) => {
      login(data.user, data.token)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export const useSendOtp = () => {
  return useMutation({
    mutationFn: (phone: string) => AuthService.sendOtp(phone),
  })
}

export const useProfile = () => {
  const { token } = useAuthStore()

  return useQuery({
    queryKey: ['profile'],
    queryFn: () => AuthService.getProfile(),
    enabled: !!token,
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      logout()
      queryClient.clear()
    },
  })
}

export const useRefreshToken = () => {
  const { login } = useAuthStore()

  return useMutation({
    mutationFn: () => AuthService.refreshToken(),
    onSuccess: (data) => {
      // Note: This would need the user data as well
      // For now, just update the token
      localStorage.setItem('auth-storage', JSON.stringify({
        state: { token: data.token },
        version: 0
      }))
    },
  })
}