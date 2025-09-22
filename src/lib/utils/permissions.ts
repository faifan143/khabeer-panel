import {
  PERMISSIONS,
  ROUTE_PERMISSIONS,
  NAVIGATION_ITEMS,
} from "@/lib/constants/permissions";

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: readonly string[]
): boolean {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
}

/**
 * Check if user has all of the required permissions
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: readonly string[]
): boolean {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission)
  );
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(
  userPermissions: string[],
  route: string
): boolean {
  const routePermissions =
    ROUTE_PERMISSIONS[route as keyof typeof ROUTE_PERMISSIONS];

  if (!routePermissions) {
    // If route is not in our mapping, allow access (for backward compatibility)
    return true;
  }

  return hasAnyPermission(userPermissions, routePermissions);
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigationItems(
  userPermissions: string[],
  isSuperAdmin: boolean
) {
  if (isSuperAdmin) {
    // Super admin has access to everything
    return NAVIGATION_ITEMS;
  }

  return NAVIGATION_ITEMS.filter((item) => {
    return hasAnyPermission(userPermissions, item.requiredPermissions);
  });
}

/**
 * Get user's accessible routes
 */
export function getAccessibleRoutes(
  userPermissions: string[],
  isSuperAdmin: boolean
): string[] {
  if (isSuperAdmin) {
    return Object.keys(ROUTE_PERMISSIONS);
  }

  return Object.keys(ROUTE_PERMISSIONS).filter((route) =>
    canAccessRoute(userPermissions, route)
  );
}

/**
 * Check if user can perform a specific action on a resource
 */
export function canPerformAction(
  userPermissions: string[],
  resource: string,
  action: "view" | "create" | "edit" | "delete" | "verify"
): boolean {
  const permissionKey = `${resource}:${action}` as keyof typeof PERMISSIONS;
  const permission = PERMISSIONS[permissionKey];

  if (!permission) {
    return false;
  }

  return hasPermission(userPermissions, permission);
}

/**
 * Get missing permissions for a route
 */
export function getMissingPermissions(
  userPermissions: string[],
  route: string
): string[] {
  const routePermissions =
    ROUTE_PERMISSIONS[route as keyof typeof ROUTE_PERMISSIONS];

  if (!routePermissions) {
    return [];
  }

  return routePermissions.filter(
    (permission) => !userPermissions.includes(permission)
  );
}

/**
 * Check if user has permission to access admin panel at all
 */
export function canAccessAdminPanel(
  userPermissions: string[],
  isSuperAdmin: boolean
): boolean {
  if (isSuperAdmin) {
    return true;
  }

  // User needs at least one permission to access the admin panel
  return userPermissions.length > 0;
}

/**
 * Get the first available page for the user based on their permissions
 * This is used as a fallback when the user doesn't have dashboard access
 */
export function getFirstAvailablePage(
  userPermissions: string[],
  isSuperAdmin: boolean
): string {
  if (isSuperAdmin) {
    // Super admin always gets dashboard first
    return "/dashboard";
  }

  // Check dashboard first
  if (canAccessRoute(userPermissions, "/dashboard")) {
    return "/dashboard";
  }

  // Find the first accessible route from navigation items
  const accessibleItems = filterNavigationItems(userPermissions, isSuperAdmin);

  if (accessibleItems.length > 0) {
    return accessibleItems[0].href;
  }

  // If no accessible routes, return dashboard as fallback (will show error)
  return "/dashboard";
}

/**
 * Get permission display name
 */
export function getPermissionDisplayName(permission: string): string {
  const permissionMap: Record<string, string> = {
    [PERMISSIONS.DASHBOARD_VIEW]: "View Dashboard",
    [PERMISSIONS.USERS_VIEW]: "View Users",
    [PERMISSIONS.USERS_CREATE]: "Create Users",
    [PERMISSIONS.USERS_EDIT]: "Edit Users",
    [PERMISSIONS.USERS_DELETE]: "Delete Users",
    [PERMISSIONS.PROVIDERS_VIEW]: "View Providers",
    [PERMISSIONS.PROVIDERS_CREATE]: "Create Providers",
    [PERMISSIONS.PROVIDERS_EDIT]: "Edit Providers",
    [PERMISSIONS.PROVIDERS_DELETE]: "Delete Providers",
    [PERMISSIONS.PROVIDERS_VERIFY]: "Verify Providers",
    [PERMISSIONS.SERVICES_VIEW]: "View Services",
    [PERMISSIONS.SERVICES_CREATE]: "Create Services",
    [PERMISSIONS.SERVICES_EDIT]: "Edit Services",
    [PERMISSIONS.SERVICES_DELETE]: "Delete Services",
    [PERMISSIONS.CATEGORIES_VIEW]: "View Categories",
    [PERMISSIONS.CATEGORIES_CREATE]: "Create Categories",
    [PERMISSIONS.CATEGORIES_EDIT]: "Edit Categories",
    [PERMISSIONS.CATEGORIES_DELETE]: "Delete Categories",
    [PERMISSIONS.ORDERS_VIEW]: "View Orders",
    [PERMISSIONS.ORDERS_EDIT]: "Edit Orders",
    [PERMISSIONS.ORDERS_DELETE]: "Delete Orders",
    [PERMISSIONS.INVOICES_VIEW]: "View Invoices",
    [PERMISSIONS.INVOICES_CREATE]: "Create Invoices",
    [PERMISSIONS.INVOICES_EDIT]: "Edit Invoices",
    [PERMISSIONS.INVOICES_DELETE]: "Delete Invoices",
    [PERMISSIONS.RATINGS_VIEW]: "View Ratings",
    [PERMISSIONS.RATINGS_EDIT]: "Edit Ratings",
    [PERMISSIONS.RATINGS_DELETE]: "Delete Ratings",
    [PERMISSIONS.NOTIFICATIONS_VIEW]: "View Notifications",
    [PERMISSIONS.NOTIFICATIONS_CREATE]: "Create Notifications",
    [PERMISSIONS.NOTIFICATIONS_EDIT]: "Edit Notifications",
    [PERMISSIONS.NOTIFICATIONS_DELETE]: "Delete Notifications",
    [PERMISSIONS.SETTINGS_VIEW]: "View Settings",
    [PERMISSIONS.SETTINGS_EDIT]: "Edit Settings",
    [PERMISSIONS.INCOME_VIEW]: "View Income",
    [PERMISSIONS.INCOME_EDIT]: "Edit Income",
  };

  return permissionMap[permission] || permission;
}
