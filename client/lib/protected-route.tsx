import { Navigate } from "react-router-dom";
import { getUserRole, isAuthenticated } from "./jwt-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "worker" | "homeowner";
  fallbackPath?: string;
}

/**
 * ProtectedRoute component ensures only authenticated users with correct role can access routes
 */
export function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = "/",
}: ProtectedRouteProps) {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  // Check if user is authenticated
  if (!authenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if user has required role
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
