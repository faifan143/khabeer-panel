import { useAuthStore } from "@/lib/stores/auth.store";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessRoute,
  filterNavigationItems,
  getAccessibleRoutes,
  canPerformAction,
  getMissingPermissions,
  canAccessAdminPanel,
  getFirstAvailablePage,
} from "@/lib/utils/permissions";

export function usePermissions() {
  const { isSuperAdmin, permissions } = useAuthStore();

  return {
    // Basic permission checks
    hasPermission: (permission: string) =>
      hasPermission(permissions, permission),
    hasAnyPermission: (requiredPermissions: string[]) =>
      hasAnyPermission(permissions, requiredPermissions),
    hasAllPermissions: (requiredPermissions: string[]) =>
      hasAllPermissions(permissions, requiredPermissions),

    // Route access checks
    canAccessRoute: (route: string) => canAccessRoute(permissions, route),
    canAccessAdminPanel: () => canAccessAdminPanel(permissions, isSuperAdmin),

    // Action checks
    canPerformAction: (
      resource: string,
      action: "view" | "create" | "edit" | "delete" | "verify"
    ) => canPerformAction(permissions, resource, action),

    // Navigation and routes
    getFilteredNavigationItems: () =>
      filterNavigationItems(permissions, isSuperAdmin),
    getAccessibleRoutes: () => getAccessibleRoutes(permissions, isSuperAdmin),
    getFirstAvailablePage: () =>
      getFirstAvailablePage(permissions, isSuperAdmin),

    // Utility functions
    getMissingPermissions: (route: string) =>
      getMissingPermissions(permissions, route),

    // State
    isSuperAdmin,
    permissions,
    permissionCount: permissions.length,
  };
}

// Hook for checking specific permissions
export function usePermission(permission: string) {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

// Hook for checking multiple permissions
export function usePermissionsCheck(requiredPermissions: string[]) {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();

  return {
    hasAny: () => hasAnyPermission(requiredPermissions),
    hasAll: () => hasAllPermissions(requiredPermissions),
  };
}

// Hook for route-based permission checking
export function useRoutePermission(route: string) {
  const { canAccessRoute, getMissingPermissions } = usePermissions();

  return {
    canAccess: canAccessRoute(route),
    missingPermissions: getMissingPermissions(route),
  };
}
