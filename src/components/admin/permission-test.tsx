"use client";

import { useAuthStore } from "@/lib/stores/auth.store";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export function PermissionTest() {
  const { isSuperAdmin, permissions, user, isAuthenticated } = useAuthStore();
  const { canAccessRoute, hasPermission } = usePermissions();

  const testPermissions = [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.PROVIDERS_VIEW,
    PERMISSIONS.SERVICES_VIEW,
  ];

  const testRoutes = [
    "/dashboard",
    "/users",
    "/orders",
    "/provider-verification",
    "/categories-services",
  ];

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Permission Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm mb-2">User Status</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span>Authenticated:</span>
                {isAuthenticated ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                <span>{isAuthenticated ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Super Admin:</span>
                {isSuperAdmin ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                <span>{isSuperAdmin ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Permissions Count:</span>
                <Badge variant="outline">{permissions.length}</Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Permission Tests</h4>
            <div className="space-y-1 text-xs">
              {testPermissions.map((permission) => (
                <div key={permission} className="flex items-center gap-2">
                  <span className="w-20 truncate">
                    {permission.split(":")[0]}:
                  </span>
                  {hasPermission(permission) ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs">{permission.split(":")[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm mb-2">Route Access Tests</h4>
          <div className="space-y-1 text-xs">
            {testRoutes.map((route) => (
              <div key={route} className="flex items-center gap-2">
                <span className="w-32 truncate">{route}:</span>
                {canAccessRoute(route) ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                <span className="text-xs">
                  {canAccessRoute(route) ? "Accessible" : "Blocked"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm mb-2">Current Permissions</h4>
          <div className="flex flex-wrap gap-1">
            {permissions.length > 0 ? (
              permissions.map((permission) => (
                <Badge key={permission} variant="secondary" className="text-xs">
                  {permission}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                No permissions assigned
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

