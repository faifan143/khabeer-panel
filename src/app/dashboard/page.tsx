"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Building2, Package, Calendar, DollarSign, TrendingUp, Sparkles, Star, MapPin, X } from "lucide-react"
import { useDashboardStats } from "@/lib/api/hooks/useAdmin"
import { formatCurrency } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar"

export default function DashboardPage() {
  const { data: dashboardStats, isLoading: dashboardLoading } = useDashboardStats()
  const { t, i18n } = useTranslation()
  const [servicesModalOpen, setServicesModalOpen] = useState(false)
  const [providersModalOpen, setProvidersModalOpen] = useState(false)

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
  const stateBreakdown = dashboardStats?.stateBreakdown || { providers: [], services: [] }

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
              <Dialog open={servicesModalOpen} onOpenChange={setServicesModalOpen}>
                <DialogTrigger asChild>
                  <button className="cursor-pointer text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                    {t('dashboard.showAll')}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[85vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      {t('dashboard.servicesByState')}
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[70vh] pr-4">
                    <div className="space-y-8">
                      {stateBreakdown.services.map((stateGroup, index) => (
                        <div key={index} className="space-y-4">
                          {/* State Header */}
                          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-lg">
                                  <MapPin className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-primary">{stateGroup.state}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {stateGroup.services.length} {t('dashboard.services')} available
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">{stateGroup.services.length}</div>
                                <div className="text-xs text-muted-foreground">Services</div>
                              </div>
                            </div>
                          </div>

                          {/* Services Grid */}
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {stateGroup.services.map((service) => (
                              <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-[1.02]">
                                <CardContent className="p-6">
                                  <div className="space-y-4">
                                    {/* Service Icon & Name */}
                                    <div className="flex items-start gap-3">
                                      <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Sparkles className="h-6 w-6 text-red-500" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-base break-words group-hover:text-primary transition-colors">
                                          {service.name}
                                        </h4>
                                        {service.description && (
                                          <p className="text-sm text-muted-foreground mt-1 break-words line-clamp-2">
                                            {service.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Category Badge */}
                                    {service.category && (
                                      <div className="flex justify-start">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          {service.category.name}
                                        </span>
                                      </div>
                                    )}

                                    {/* Stats & Price */}
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Package className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm text-muted-foreground">
                                            {service.orderCount} {t('dashboard.orders')}
                                          </span>
                                        </div>
                                        {service.price && (
                                          <div className="text-right">
                                            <div className="text-lg font-bold text-green-600">
                                              {renderCurrency(service.price)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Price</div>
                                          </div>
                                        )}
                                      </div>

                                      {!service.price && (
                                        <div className="text-center py-2">
                                          <span className="text-sm text-muted-foreground italic">
                                            Price on request
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                      {stateBreakdown.services.length === 0 && (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                            {t('dashboard.noServicesFound')}
                          </h3>
                          <p className="text-muted-foreground">
                            No services are currently available in any state.
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
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
              <Dialog open={providersModalOpen} onOpenChange={setProvidersModalOpen}>
                <DialogTrigger asChild>
                  <button className="cursor-pointer text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                    {t('dashboard.showAll')}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[85vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      {t('dashboard.providersByState')}
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[70vh] pr-4">
                    <div className="space-y-8">
                      {stateBreakdown.providers.map((stateGroup, index) => (
                        <div key={index} className="space-y-4">
                          {/* State Header */}
                          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-lg">
                                  <MapPin className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-primary">{stateGroup.state}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {stateGroup.providers.length} {t('dashboard.providers')} available
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">{stateGroup.providers.length}</div>
                                <div className="text-xs text-muted-foreground">Providers</div>
                              </div>
                            </div>
                          </div>

                          {/* Providers Grid */}
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {stateGroup.providers.map((provider) => (
                              <Card key={provider.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-[1.02]">
                                <CardContent className="p-6">
                                  <div className="space-y-4">
                                    {/* Provider Avatar & Name */}
                                    <div className="flex items-start gap-3">
                                      <Avatar className="h-16 w-16 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <AvatarImage
                                          src={provider.image ? process.env.NEXT_PUBLIC_API_URL_IMAGE + provider.image : undefined}
                                          alt={provider.name}
                                          className="rounded-xl object-cover"
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary rounded-xl">
                                          <Star className="h-8 w-8" />
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-base break-words group-hover:text-primary transition-colors">
                                          {provider.name}
                                        </h4>
                                        <p className="text-sm text-muted-foreground mt-1 break-words line-clamp-2">
                                          {provider.description}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Status Badges */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {provider.isVerified && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                          {t('dashboard.verified')}
                                        </span>
                                      )}
                                      {provider.isActive && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                          {t('dashboard.active')}
                                        </span>
                                      )}
                                    </div>

                                    {/* Stats & Rating */}
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Package className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm text-muted-foreground">
                                            {provider.orderCount} {t('dashboard.orders')}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                          <span className="text-sm font-medium">{provider.rating.toFixed(1)}</span>
                                        </div>
                                      </div>

                                      {/* Phone Number */}
                                      {provider.phone && (
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span className="text-sm text-muted-foreground break-all">
                                            {provider.phone}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                      {stateBreakdown.providers.length === 0 && (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                            {t('dashboard.noProvidersFound')}
                          </h3>
                          <p className="text-muted-foreground">
                            No providers are currently available in any state.
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
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
