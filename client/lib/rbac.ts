/**
 * Role-Based Access Control (RBAC) system
 */

export type UserRole = "worker" | "homeowner" | "admin" | "guest";

export interface Permission {
  resource: string;
  actions: string[];
}

/**
 * Define role-based permissions
 */
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    { resource: "workers", actions: ["read", "create", "update", "delete"] },
    { resource: "homeowners", actions: ["read", "create", "update", "delete"] },
    { resource: "bookings", actions: ["read", "create", "update", "delete"] },
    { resource: "payments", actions: ["read", "update"] },
    { resource: "reports", actions: ["read", "update", "delete"] },
    { resource: "trainings", actions: ["read", "create", "update", "delete"] },
    { resource: "services", actions: ["read", "create", "update", "delete"] },
    { resource: "users", actions: ["read", "update", "delete"] },
    { resource: "analytics", actions: ["read"] },
  ],
  worker: [
    { resource: "profile", actions: ["read", "update"] },
    { resource: "bookings", actions: ["read", "update"] },
    { resource: "payments", actions: ["read"] },
    { resource: "trainings", actions: ["read"] },
    { resource: "tasks", actions: ["read", "update"] },
    { resource: "ratings", actions: ["read"] },
  ],
  homeowner: [
    { resource: "profile", actions: ["read", "update"] },
    { resource: "bookings", actions: ["read", "create", "update"] },
    { resource: "workers", actions: ["read"] },
    { resource: "payments", actions: ["read", "create"] },
    { resource: "ratings", actions: ["create"] },
  ],
  guest: [
    { resource: "public", actions: ["read"] },
    { resource: "auth", actions: ["login", "register"] },
  ],
};

/**
 * Check if a role has permission to perform an action on a resource
 */
export const hasPermission = (
  role: UserRole,
  resource: string,
  action: string
): boolean => {
  const permissions = rolePermissions[role];
  if (!permissions) {
    return false;
  }

  const resourcePermission = permissions.find((p) => p.resource === resource);
  if (!resourcePermission) {
    return false;
  }

  return resourcePermission.actions.includes(action);
};

/**
 * Check if a role has any of the specified permissions
 */
export const hasAnyPermission = (
  role: UserRole,
  requirements: Array<{ resource: string; action: string }>
): boolean => {
  return requirements.some((req) => hasPermission(role, req.resource, req.action));
};

/**
 * Check if a role has all of the specified permissions
 */
export const hasAllPermissions = (
  role: UserRole,
  requirements: Array<{ resource: string; action: string }>
): boolean => {
  return requirements.every((req) => hasPermission(role, req.resource, req.action));
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: UserRole): Permission[] => {
  return rolePermissions[role] || [];
};

/**
 * Get all resources a role can access
 */
export const getRoleResources = (role: UserRole): string[] => {
  return rolePermissions[role]?.map((p) => p.resource) || [];
};

/**
 * Check if a role is higher or equal than another role
 * Admin > Homeowner/Worker > Guest
 */
export const hasHigherOrEqualRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    homeowner: 2,
    worker: 2,
    guest: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Get role-specific routes and navigation items
 */
export const getRoleRoutes = (role: UserRole): string[] => {
  const routes: Record<UserRole, string[]> = {
    admin: [
      "/admin/dashboard",
      "/admin/workers",
      "/admin/homeowners",
      "/admin/bookings",
      "/admin/payments",
      "/admin/reports",
      "/admin/analytics",
    ],
    worker: [
      "/worker/dashboard",
      "/worker/profile",
      "/worker/bookings",
      "/worker/payments",
      "/worker/trainings",
    ],
    homeowner: [
      "/homeowner/dashboard",
      "/homeowner/profile",
      "/homeowner/workers",
      "/homeowner/bookings",
      "/homeowner/payments",
    ],
    guest: ["/", "/login", "/register"],
  };

  return routes[role] || [];
};

/**
 * Validate if a user can access a specific route
 */
export const canAccessRoute = (role: UserRole, route: string): boolean => {
  const allowedRoutes = getRoleRoutes(role);
  return allowedRoutes.some((r) => route.startsWith(r));
};

/**
 * Get role-specific action buttons and menu items
 */
export const getRoleActions = (role: UserRole): Record<string, boolean> => {
  const actions: Record<UserRole, Record<string, boolean>> = {
    admin: {
      canCreateWorker: true,
      canDeleteUser: true,
      canViewAnalytics: true,
      canManagePayments: true,
    },
    worker: {
      canEditProfile: true,
      canViewBookings: true,
      canAcceptBookings: true,
    },
    homeowner: {
      canCreateBooking: true,
      canViewWorkers: true,
      canRateWorker: true,
      canMakePayment: true,
    },
    guest: {
      canViewPublic: true,
      canLogin: true,
    },
  };

  return actions[role] || {};
};
