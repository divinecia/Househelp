import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "./supabase-auth";
import { supabase } from "./supabase";

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
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (active) setStatus("denied");
        return;
      }

      const { profile } = await getCurrentUser();
      if (requiredRole && profile?.role !== requiredRole) {
        if (active) setStatus("denied");
        return;
      }

      if (active) setStatus("allowed");
    })();

    return () => {
      active = false;
    };
  }, [requiredRole]);

  if (status === "loading") return null;
  if (status === "denied") return <Navigate to={fallbackPath} replace />;
  return <>{children}</>;
}
