"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLogin } from "@/lib/api/hooks/useAuth"
import { useAuthStore } from "@/lib/stores/auth.store"
import { Eye, EyeOff, Loader2 } from "lucide-react"


const loginSchema = yup.object({
  email: yup.string().email("Please enter a valid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
}).required()

type LoginFormData = yup.InferType<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login, isAuthenticated, isLoading, isInitialized } = useAuthStore()
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  })



  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      console.log('User already authenticated, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [isAuthenticated, isInitialized, router])

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('Attempting login with:', data)
      const result = await loginMutation.mutateAsync(data)
      console.log('Login successful:', result)
      // The useLogin hook handles the login and navigation
    } catch (err: unknown) {
      console.error('Login error:', err)
      // Error is already handled by the useLogin hook
    }
  }

  // Show loading while checking authentication
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Redirecting to dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-2xl font-bold">K</span>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your Khabeer Admin account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className={errors.password ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600">
            <p>Demo Credentials:</p>
            <p className="font-mono text-xs mt-1">
              admin@khabeer.com / admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}