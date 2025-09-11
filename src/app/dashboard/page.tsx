"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, Package, Calendar, DollarSign, TrendingUp, Sparkles, Star } from "lucide-react"
import { useDashboardStats } from "@/lib/api/hooks/useAdmin"
import { formatCurrency } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar"

export default function DashboardPage() {
  const { data: dashboardStats, isLoading: dashboardLoading } = useDashboardStats()
  const { t, i18n } = useTranslation()
  const router = useRouter()

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  // Function to render currency with smaller currency symbol
  const renderCurrency = (amount: number) => {
    const currentLocale = i18n.language
    const currencyString = formatCurrency(amount, currentLocale)
    const currencySymbol = currentLocale === 'ar' ? 'ر.ع.' : 'OMR'
    const parts = currencyString.split(` ${currencySymbol}`)
    return (
      <span>
        {parts[0]}
        <span className="text-sm text-muted-foreground ml-1">{currencySymbol}</span>
      </span>
    )
  }

  // Add safety checks for data
  const overview = (dashboardStats?.overview || {}) as any
  const popularServices = dashboardStats?.popularServices || []
  const topProviders = dashboardStats?.topProviders || []
  const orderStats = dashboardStats?.orderStats

  // Navigation handlers
  const handleViewAllServices = () => {
    router.push('/categories-services')
  }

  const handleViewAllProviders = () => {
    router.push('/provider-verification')
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.totalUsers')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading ? "..." : formatNumber(overview.totalUsers || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.activeUsers')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.providers')}</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading ? "..." : formatNumber(overview.totalProviders || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.activeProviders')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.dailyOrders')}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading ? "..." : formatNumber(orderStats?.today || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.todaysOrders')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.totalOrders')}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading ? "..." : formatNumber(overview.totalOrders || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.allTimeOrders')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.khabeerIncome')}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading ? "..." : renderCurrency(overview.totalCommission || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.totalCommission')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.providersIncome')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading ? "..." : renderCurrency(overview.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.totalRevenue')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Services Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('dashboard.topServices')}</h2>
              <button
                onClick={handleViewAllServices}
                className=" cursor-pointer  text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {t('dashboard.showAll')}
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {dashboardLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                popularServices.slice(0, 5).map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{service.name}</p>
                          <p className="text-sm text-muted-foreground">{service.orderCount} {t('dashboard.orders')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Top Providers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('dashboard.topProviders')}</h2>
              <button
                onClick={handleViewAllProviders}
                className=" cursor-pointer  text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {t('dashboard.showAll')}
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {dashboardLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                topProviders.slice(0, 5).map((provider) => (
                  <Card key={provider.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 rounded-full">
                          <AvatarImage
                            src={provider.image ? process.env.NEXT_PUBLIC_API_URL_IMAGE + provider.image : undefined}
                            alt={provider.name}
                            className="rounded-full object-cover"
                          />
                          <AvatarFallback className="bg-red-100 text-red-500 rounded-full">
                            <Star className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{provider.name}</p>
                          <p className="text-muted-foreground  text-sm">{provider.description}</p>
                          <p className="text-sm text-muted-foreground">{provider.orderCount} {t('dashboard.orders')}</p>
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-xs">{provider.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
