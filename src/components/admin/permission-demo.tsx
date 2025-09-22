"use client";

import { usePermissions } from "@/lib/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Crown, Users, Package, Settings } from "lucide-react";

export function PermissionDemo() {
  const {
    isSuperAdmin,
    permissions,
    permissionCount,
    hasPermission,
    canPerformAction,
    getAccessibleRoutes,
    getFirstAvailablePage,
  } = usePermissions();

  const accessibleRoutes = getAccessibleRoutes();

  const permissionExamples = [
    {
      permission: PERMISSIONS.USERS_VIEW,
      label: "View Users",
      icon: Users,
    },
    {
      permission: PERMISSIONS.ORDERS_VIEW,
      label: "View Orders",
      icon: Package,
    },
    {
      permission: PERMISSIONS.SETTINGS_VIEW,
      label: "View Settings",
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isSuperAdmin ? (
              <Crown className="h-5 w-5 text-yellow-500" />
            ) : (
              <Shield className="h-5 w-5 text-blue-500" />
            )}
            Permission System Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {isSuperAdmin ? "Super" : "Sub"}
              </div>
              <div className="text-sm text-gray-600">Admin Type</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {permissionCount}
              </div>
              <div className="text-sm text-gray-600">Permissions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {accessibleRoutes.length}
              </div>
              <div className="text-sm text-gray-600">Accessible Routes</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Current Permissions:</h3>
            <div className="flex flex-wrap gap-2">
              {permissions.length > 0 ? (
                permissions.map((permission) => (
                  <Badge key={permission} variant="outline">
                    {permission}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary">No specific permissions</Badge>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Permission Examples:</h3>
            <div className="space-y-2">
              {permissionExamples.map(({ permission, label, icon: Icon }) => (
                <div
                  key={permission}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{label}</span>
                  </div>
                  <Badge
                    variant={
                      hasPermission(permission) ? "default" : "secondary"
                    }
                  >
                    {hasPermission(permission) ? "Allowed" : "Denied"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Action Examples:</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Can view users?</span>
                <Badge
                  variant={
                    canPerformAction("users", "view") ? "default" : "secondary"
                  }
                >
                  {canPerformAction("users", "view") ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Can edit orders?</span>
                <Badge
                  variant={
                    canPerformAction("orders", "edit") ? "default" : "secondary"
                  }
                >
                  {canPerformAction("orders", "edit") ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">First Available Page:</h3>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Badge variant="default" className="text-lg">
                {getFirstAvailablePage()}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                This is where you would be redirected after login
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">All Accessible Routes:</h3>
            <div className="flex flex-wrap gap-2">
              {accessibleRoutes.map((route) => (
                <Badge key={route} variant="outline">
                  {route}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
