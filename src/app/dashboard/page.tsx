"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, Package, Calendar, DollarSign, TrendingUp, Sparkles, Star } from "lucide-react"
import { useDashboardStats } from "@/lib/api/hooks/useAdmin"
import { formatCurrency } from "@/lib/utils"

export default function DashboardPage() {
  const { data: dashboardStats, isLoading: dashboardLoading } = useDashboardStats()

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  // Function to render currency with smaller OMR
  const renderCurrency = (amount: number) => {
    const currencyString = formatCurrency(amount)
    const parts = currencyString.split(' OMR')
    return (
      <span>
        {parts[0]}
        <span className="text-sm text-muted-foreground ml-1">OMR</span>
      </span>
    )
  }

  // Add safety checks for data
  const overview = dashboardStats?.overview || {}
  const popularServices = dashboardStats?.popularServices || []
  const topProviders = dashboardStats?.topProviders || []
  const orderStats = dashboardStats?.orderStats

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to Khabeer Admin Panel. Here's an overview of your platform.
            </p>
          </div>

          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading ? "..." : formatNumber(overview.totalUsers || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Providers</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading ? "..." : formatNumber(overview.totalProviders || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active providers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Orders</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading ? "..." : formatNumber(orderStats?.today || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Today's orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading ? "..." : formatNumber(overview.totalOrders || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Khabeer Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading ? "..." : renderCurrency(overview.totalCommission || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total commission
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Providers Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading ? "..." : renderCurrency(overview.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total revenue
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Services Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Top Services</h2>
              <button className="text-sm text-primary hover:text-primary/80 font-medium">
                Show All
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
                          <p className="text-sm text-muted-foreground">{service.orderCount} orders</p>
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
              <h2 className="text-xl font-semibold">Top Providers</h2>
              <button className="text-sm text-primary hover:text-primary/80 font-medium">
                Show All
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
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{provider.name}</p>
                          <p className="text-sm text-muted-foreground">{provider.orderCount} orders</p>
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
