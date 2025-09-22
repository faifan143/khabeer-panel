"use client";

import { AdminLayout } from "@/components/layout/admin-layout";
import { PermissionRoute } from "@/components/auth/permission-route";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Building2,
  Package,
  Calendar,
  DollarSign,
  TrendingUp,
  Sparkles,
  Star,
  MapPin,
  X,
  Shield,
  Crown,
} from "lucide-react";
import { useDashboardStats } from "@/lib/api/hooks/useAdmin";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { getLocalizedStateName } from "@/lib/constants/oman-states";
import { useAuthStore } from "@/lib/stores/auth.store";
import { PermissionDemo } from "@/components/admin/permission-demo";
import { PermissionTest } from "@/components/admin/permission-test";

export default function DashboardPage() {
  const { data: dashboardStats, isLoading: dashboardLoading } =
    useDashboardStats();
  const { t, i18n } = useTranslation();
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [providersModalOpen, setProvidersModalOpen] = useState(false);
  const { isSuperAdmin, permissions, user } = useAuthStore();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  // Function to render currency with smaller currency symbol
  const renderCurrency = (amount: number) => {
    const currentLocale = i18n.language;
    const currencyString = formatCurrency(amount, currentLocale);
    const currencySymbol = currentLocale === "ar" ? "ر.ع." : "OMR";
    const parts = currencyString.split(` ${currencySymbol}`);
    return (
      <span className="flex items-center gap-1 rtl:flex-row-reverse">
        {parts[0]}
        <span className="text-sm text-muted-foreground">{currencySymbol}</span>
      </span>
    );
  };

  // Add safety checks for data
  const overview = (dashboardStats?.overview || {}) as any;
  const popularServices = dashboardStats?.popularServices || [];
  const topProviders = dashboardStats?.topProviders || [];
  const orderStats = dashboardStats?.orderStats;
  const stateBreakdown = dashboardStats?.stateBreakdown || {
    providers: [],
    services: [],
  };

  return (
    <PermissionRoute requiredPermissions={[PERMISSIONS.DASHBOARD_VIEW]}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("dashboard.totalUsers")}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading
                    ? "..."
                    : formatNumber(overview.totalUsers || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.activeUsers")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("dashboard.providers")}
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading
                    ? "..."
                    : formatNumber(overview.totalProviders || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.activeProviders")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("dashboard.dailyOrders")}
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading
                    ? "..."
                    : formatNumber(orderStats?.today || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.todaysOrders")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("dashboard.totalOrders")}
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading
                    ? "..."
                    : formatNumber(overview.totalOrders || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.allTimeOrders")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("dashboard.khabeerIncome")}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading
                    ? "..."
                    : renderCurrency(overview.totalCommission || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.totalCommission")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("dashboard.providersIncome")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading
                    ? "..."
                    : renderCurrency(overview.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.totalRevenue")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Services Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {t("dashboard.topServices")}
              </h2>
              <Dialog
                open={servicesModalOpen}
                onOpenChange={setServicesModalOpen}
              >
                <DialogTrigger asChild>
                  <button className="cursor-pointer text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                    {t("dashboard.showAll")}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[85vh] w-[90vw] rtl:text-right ltr:text-left rtl:dir-rtl ltr:dir-ltr">
                  <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-3 text-xl font-semibold rtl:gap-3 ">
                      <MapPin className="h-5 w-5 text-primary" />
                      {t("dashboard.servicesByState")}
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[70vh]">
                    <div className="space-y-6">
                      {stateBreakdown.services.map((stateGroup, index) => (
                        <div key={index} className="space-y-3">
                          {/* Minimal State Header */}
                          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border rtl:flex-row-reverse">
                            <div className="flex items-center gap-3 rtl:gap-3 rtl:flex-row-reverse">
                              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                              <h3 className="font-semibold text-primary">
                                {getLocalizedStateName(
                                  stateGroup.state,
                                  i18n.language as "en" | "ar"
                                )}
                              </h3>
                              <span className="text-sm text-muted-foreground">
                                {stateGroup.services.length}{" "}
                                {t("dashboard.services")}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-primary">
                              {stateGroup.services.length}
                            </div>
                          </div>

                          {/* Simple Services List */}
                          <div className="space-y-1">
                            {stateGroup.services.map((service) => (
                              <div
                                key={service.id}
                                className="flex items-center gap-3 py-2 px-1 hover:bg-gray-50 transition-colors rtl:gap-3 rtl:flex-row-reverse"
                              >
                                <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                                  <Sparkles className="h-3 w-3 text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate text-right rtl:text-right ltr:text-left">
                                    {service.name}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground rtl:gap-2 ltr:gap-2 rtl:flex-row-reverse">
                                    <span className="flex items-center gap-1 rtl:flex-row-reverse">
                                      {service.orderCount}
                                      <span className="text-sm text-muted-foreground">
                                        {t("dashboard.orders")}
                                      </span>
                                    </span>
                                    {service.price && (
                                      <>
                                        <span>•</span>
                                        <span className="text-green-600 font-medium">
                                          {renderCurrency(service.price)}
                                        </span>
                                      </>
                                    )}
                                    {service.category && (
                                      <>
                                        <span>•</span>
                                        <span className="text-blue-600">
                                          {service.category.name}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {stateBreakdown.services.length === 0 && (
                        <div className="text-center py-12">
                          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-muted-foreground mb-1">
                            {t("dashboard.noServicesFound")}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t("dashboard.noServicesAvailable")}
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {dashboardLoading
                ? Array.from({ length: 5 }).map((_, i) => (
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
                : popularServices.slice(0, 5).map((service) => (
                    <Card
                      key={service.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-red-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {service.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {service.orderCount} {t("dashboard.orders")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </div>

          {/* Top Providers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {t("dashboard.topProviders")}
              </h2>
              <Dialog
                open={providersModalOpen}
                onOpenChange={setProvidersModalOpen}
              >
                <DialogTrigger asChild>
                  <button className="cursor-pointer text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                    {t("dashboard.showAll")}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[85vh] w-[90vw] rtl:text-right ltr:text-left rtl:dir-rtl ltr:dir-ltr">
                  <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-3 text-xl font-semibold rtl:gap-3 ">
                      <MapPin className="h-5 w-5 text-primary" />
                      {t("dashboard.providersByState")}
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[70vh]">
                    <div className="space-y-6">
                      {stateBreakdown.providers.map((stateGroup, index) => (
                        <div key={index} className="space-y-3">
                          {/* Minimal State Header */}
                          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border rtl:flex-row-reverse">
                            <div className="flex items-center gap-3 rtl:gap-3 rtl:flex-row-reverse">
                              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                              <h3 className="font-semibold text-primary">
                                {getLocalizedStateName(
                                  stateGroup.state,
                                  i18n.language as "en" | "ar"
                                )}
                              </h3>
                              <span className="text-sm text-muted-foreground">
                                {stateGroup.providers.length}
                                {t("dashboard.providers")}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-primary">
                              {stateGroup.providers.length}
                            </div>
                          </div>

                          {/* Simple Providers List */}
                          <div className="space-y-1">
                            {stateGroup.providers.map((provider) => (
                              <div
                                key={provider.id}
                                className="flex items-center gap-3 py-2 px-1 hover:bg-gray-50 transition-colors rtl:gap-3 rtl:flex-row-reverse"
                              >
                                <Avatar className="h-8 w-8 rounded flex-shrink-0">
                                  <AvatarImage
                                    src={
                                      provider.image
                                        ? process.env
                                            .NEXT_PUBLIC_API_URL_IMAGE +
                                          provider.image
                                        : undefined
                                    }
                                    alt={provider.name}
                                    className="rounded object-cover"
                                  />
                                  <AvatarFallback className="bg-primary/10 text-primary rounded">
                                    <Star className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 rtl:gap-2 rtl:flex-row-reverse">
                                    <h4 className="font-medium text-sm truncate text-right rtl:text-right ltr:text-left">
                                      {provider.name}
                                    </h4>
                                    {provider.isVerified && (
                                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                    )}
                                    {provider.isActive && (
                                      <span className="text-xs text-blue-600 flex-shrink-0">
                                        {t("dashboard.active")}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground rtl:gap-2 ltr:gap-2 rtl:flex-row-reverse">
                                    <span className="flex items-center gap-1 rtl:flex-row-reverse">
                                      {provider.orderCount}
                                      <span className="text-sm text-muted-foreground">
                                        {t("dashboard.orders")}
                                      </span>
                                    </span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                      <span>{provider.rating.toFixed(1)}</span>
                                    </div>
                                    {provider.phone && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate max-w-20">
                                          {provider.phone}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {stateBreakdown.providers.length === 0 && (
                        <div className="text-center py-12">
                          <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-muted-foreground mb-1">
                            {t("dashboard.noProvidersFound")}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t("dashboard.noProvidersAvailable")}
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {dashboardLoading
                ? Array.from({ length: 5 }).map((_, i) => (
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
                : topProviders.slice(0, 5).map((provider) => (
                    <Card
                      key={provider.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 rounded-full">
                            <AvatarImage
                              src={
                                provider.image
                                  ? process.env.NEXT_PUBLIC_API_URL_IMAGE +
                                    provider.image
                                  : undefined
                              }
                              alt={provider.name}
                              className="rounded-full object-cover"
                            />
                            <AvatarFallback className="bg-red-100 text-red-500 rounded-full">
                              <Star className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {provider.name}
                            </p>
                            <p className="text-muted-foreground  text-sm">
                              {provider.description}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {provider.orderCount} {t("dashboard.orders")}
                            </p>
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-500">★</span>
                              <span className="text-xs">
                                {provider.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </PermissionRoute>
  );
}
