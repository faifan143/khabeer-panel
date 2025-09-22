// Permission constants for the admin panel
// Note: These match the actual permission strings returned by the backend
export const PERMISSIONS = {
  // Dashboard permissions
  DASHBOARD_VIEW: "dashboard",

  // User management permissions
  USERS_VIEW: "users",
  USERS_CREATE: "users:create",
  USERS_EDIT: "users:edit",
  USERS_DELETE: "users:delete",

  // Provider management permissions
  PROVIDERS_VIEW: "providers",
  PROVIDERS_CREATE: "providers:create",
  PROVIDERS_EDIT: "providers:edit",
  PROVIDERS_DELETE: "providers:delete",
  PROVIDERS_VERIFY: "providers:verify",

  // Service management permissions
  SERVICES_VIEW: "services",
  SERVICES_CREATE: "services:create",
  SERVICES_EDIT: "services:edit",
  SERVICES_DELETE: "services:delete",

  // Category management permissions
  CATEGORIES_VIEW: "categories",
  CATEGORIES_CREATE: "categories:create",
  CATEGORIES_EDIT: "categories:edit",
  CATEGORIES_DELETE: "categories:delete",

  // Order management permissions
  ORDERS_VIEW: "orders",
  ORDERS_EDIT: "orders:edit",
  ORDERS_DELETE: "orders:delete",

  // Invoice management permissions
  INVOICES_VIEW: "invoices",
  INVOICES_CREATE: "invoices:create",
  INVOICES_EDIT: "invoices:edit",
  INVOICES_DELETE: "invoices:delete",

  // Rating management permissions
  RATINGS_VIEW: "ratings",
  RATINGS_EDIT: "ratings:edit",
  RATINGS_DELETE: "ratings:delete",

  // Notification permissions
  NOTIFICATIONS_VIEW: "notifications",
  NOTIFICATIONS_CREATE: "notifications:create",
  NOTIFICATIONS_EDIT: "notifications:edit",
  NOTIFICATIONS_DELETE: "notifications:delete",

  // Settings permissions
  SETTINGS_VIEW: "settings",
  SETTINGS_EDIT: "settings:edit",

  // Income/Finance permissions
  INCOME_VIEW: "income",
  INCOME_EDIT: "income:edit",
} as const;

// Route to permission mapping
export const ROUTE_PERMISSIONS = {
  "/dashboard": [PERMISSIONS.DASHBOARD_VIEW], // Dashboard requires dashboard permission
  "/users": [PERMISSIONS.USERS_VIEW],
  "/categories-services": [
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.SERVICES_VIEW,
  ],
  "/provider-verification": [
    PERMISSIONS.PROVIDERS_VIEW,
    PERMISSIONS.PROVIDERS_VERIFY,
  ],
  "/orders": [PERMISSIONS.ORDERS_VIEW],
  "/invoices": [PERMISSIONS.INVOICES_VIEW],
  "/ratings": [PERMISSIONS.RATINGS_VIEW],
  "/notifications": [PERMISSIONS.NOTIFICATIONS_VIEW],
  "/settings": [PERMISSIONS.SETTINGS_VIEW],
  "/income": [PERMISSIONS.INCOME_VIEW],
} as const;

// Navigation items with their required permissions
export const NAVIGATION_ITEMS = [
  {
    key: "dashboard",
    titleKey: "navigation.dashboard",
    href: "/dashboard",
    icon: "Home",
    descriptionKey: "dashboard.subtitle",
    requiredPermissions: [PERMISSIONS.DASHBOARD_VIEW],
  },
  {
    key: "categories-services",
    titleKey: "navigation.categoriesServices",
    href: "/categories-services",
    icon: "Building2",
    descriptionKey: "categories.subtitle",
    requiredPermissions: [
      PERMISSIONS.CATEGORIES_VIEW,
      PERMISSIONS.SERVICES_VIEW,
    ],
  },
  {
    key: "orders",
    titleKey: "navigation.ordersManagement",
    href: "/orders",
    icon: "Package",
    descriptionKey: "orders.subtitle",
    requiredPermissions: [PERMISSIONS.ORDERS_VIEW],
  },
  {
    key: "provider-verification",
    titleKey: "navigation.providerVerification",
    href: "/provider-verification",
    icon: "CheckCircle",
    descriptionKey: "providers.subtitle",
    requiredPermissions: [
      PERMISSIONS.PROVIDERS_VIEW,
      PERMISSIONS.PROVIDERS_VERIFY,
    ],
  },
  {
    key: "users",
    titleKey: "navigation.usersManagement",
    href: "/users",
    icon: "Users",
    descriptionKey: "users.subtitle",
    requiredPermissions: [PERMISSIONS.USERS_VIEW],
  },
  {
    key: "invoices",
    titleKey: "navigation.invoiceManagement",
    href: "/invoices",
    icon: "FileText",
    descriptionKey: "invoices.subtitle",
    requiredPermissions: [PERMISSIONS.INVOICES_VIEW],
  },
  {
    key: "ratings",
    titleKey: "navigation.ratingsReviews",
    href: "/ratings",
    icon: "Star",
    descriptionKey: "ratings.subtitle",
    requiredPermissions: [PERMISSIONS.RATINGS_VIEW],
  },
  {
    key: "notifications",
    titleKey: "navigation.notifications",
    href: "/notifications",
    icon: "Bell",
    descriptionKey: "notifications.subtitle",
    requiredPermissions: [PERMISSIONS.NOTIFICATIONS_VIEW],
  },
  {
    key: "settings",
    titleKey: "navigation.settings",
    href: "/settings",
    icon: "Settings",
    descriptionKey: "settings.subtitle",
    requiredPermissions: [PERMISSIONS.SETTINGS_VIEW],
  },
] as const;

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  DASHBOARD: [PERMISSIONS.DASHBOARD_VIEW],
  USER_MANAGEMENT: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
  ],
  PROVIDER_MANAGEMENT: [
    PERMISSIONS.PROVIDERS_VIEW,
    PERMISSIONS.PROVIDERS_CREATE,
    PERMISSIONS.PROVIDERS_EDIT,
    PERMISSIONS.PROVIDERS_DELETE,
    PERMISSIONS.PROVIDERS_VERIFY,
  ],
  SERVICE_MANAGEMENT: [
    PERMISSIONS.SERVICES_VIEW,
    PERMISSIONS.SERVICES_CREATE,
    PERMISSIONS.SERVICES_EDIT,
    PERMISSIONS.SERVICES_DELETE,
  ],
  CATEGORY_MANAGEMENT: [
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_EDIT,
    PERMISSIONS.CATEGORIES_DELETE,
  ],
  ORDER_MANAGEMENT: [
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_EDIT,
    PERMISSIONS.ORDERS_DELETE,
  ],
  INVOICE_MANAGEMENT: [
    PERMISSIONS.INVOICES_VIEW,
    PERMISSIONS.INVOICES_CREATE,
    PERMISSIONS.INVOICES_EDIT,
    PERMISSIONS.INVOICES_DELETE,
  ],
  RATING_MANAGEMENT: [
    PERMISSIONS.RATINGS_VIEW,
    PERMISSIONS.RATINGS_EDIT,
    PERMISSIONS.RATINGS_DELETE,
  ],
  NOTIFICATION_MANAGEMENT: [
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_CREATE,
    PERMISSIONS.NOTIFICATIONS_EDIT,
    PERMISSIONS.NOTIFICATIONS_DELETE,
  ],
  SETTINGS_MANAGEMENT: [PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_EDIT],
  INCOME_MANAGEMENT: [PERMISSIONS.INCOME_VIEW, PERMISSIONS.INCOME_EDIT],
} as const;
