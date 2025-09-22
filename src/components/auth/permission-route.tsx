"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useTranslation } from "react-i18next";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { useHydrationSafe } from "@/lib/hooks/useHydrationSafe";
import {
  canAccessRoute,
  canAccessAdminPanel,
  getFirstAvailablePage,
} from "@/lib/utils/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PermissionRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallbackRoute?: string;
}

export function PermissionRoute({
  children,
  requiredPermissions = [],
  fallbackRoute,
}: PermissionRouteProps) {
  const { t } = useTranslation();
  const {
    isAuthenticated,
    isLoading,
    isInitialized,
    user,
    isSuperAdmin,
    permissions,
  } = useAuthStore();
  const router = useRouter();
  const isClient = useHydrationSafe();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isInitialized, router]);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      // Check if user can access admin panel at all
      if (!canAccessAdminPanel(permissions, isSuperAdmin)) {
        router.push("/login");
        return;
      }

      // Check specific route permissions
      if (requiredPermissions.length > 0) {
        const hasAccess =
          isSuperAdmin ||
          requiredPermissions.some((permission) =>
            permissions.includes(permission)
          );

        if (!hasAccess) {
          // Use provided fallback route or get first available page
          const redirectRoute =
            fallbackRoute || getFirstAvailablePage(permissions, isSuperAdmin);
          router.push(redirectRoute);
        }
      }
    }
  }, [
    isAuthenticated,
    isInitialized,
    isSuperAdmin,
    permissions,
    requiredPermissions,
    fallbackRoute,
    router,
  ]);

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{isClient ? t("common.loading") : "Loading..."}</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check if user can access admin panel
  if (!canAccessAdminPanel(permissions, isSuperAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-red-600">
              {t("common.accessDenied")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{t("common.noAdminAccess")}</p>
            <Button onClick={() => router.push("/login")} className="w-full">
              {t("common.backToLogin")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check specific permissions (only if requiredPermissions are specified)
  if (requiredPermissions.length > 0) {
    const hasAccess =
      isSuperAdmin ||
      requiredPermissions.some((permission) =>
        permissions.includes(permission)
      );

    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-yellow-600">
                {t("common.insufficientPermissions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {t("common.noPermissionForThisPage")}
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    const redirectRoute =
                      fallbackRoute ||
                      getFirstAvailablePage(permissions, isSuperAdmin);
                    router.push(redirectRoute);
                  }}
                  className="w-full"
                >
                  {t("common.goToDashboard")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full"
                >
                  {t("common.goBack")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
}
