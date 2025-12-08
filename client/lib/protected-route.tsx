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
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">(
    "loading",
  );

  useEffect(() => {
    let active = true;
    (async () => {
      console.log(
        "ProtectedRoute - checking auth, requiredRole:",
        requiredRole,
      );

      // First check for mock auth token
      const mockToken = sessionStorage.getItem("auth_token");
      console.log("ProtectedRoute - checking mock token:", !!mockToken);

      if (mockToken) {
        // Check role from user_info
        const userInfo = sessionStorage.getItem("user_info");
        console.log("ProtectedRoute - user_info:", userInfo);

        if (userInfo) {
          try {
            const parsed = JSON.parse(userInfo);
            console.log("ProtectedRoute - parsed user_info role:", parsed.role);

            if (requiredRole && parsed.role !== requiredRole) {
              console.log("ProtectedRoute - role mismatch:", {
                required: requiredRole,
                actual: parsed.role,
              });
              if (active) setStatus("denied");
              return;
            }

            console.log("ProtectedRoute - allowing access");
            if (active) setStatus("allowed");
            return;
          } catch (err) {
            console.error("ProtectedRoute - error parsing user_info:", err);
          }
        }
      }

      // Fall back to Supabase session
      console.log("ProtectedRoute - checking Supabase session");
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        console.log("ProtectedRoute - no Supabase session, denying access");
        if (active) setStatus("denied");
        return;
      }

      const { profile } = await getCurrentUser();
      if (requiredRole && profile?.role !== requiredRole) {
        console.log("ProtectedRoute - Supabase role mismatch:", {
          required: requiredRole,
          actual: profile?.role,
        });
        if (active) setStatus("denied");
        return;
      }

      console.log("ProtectedRoute - Supabase auth allowed");
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
