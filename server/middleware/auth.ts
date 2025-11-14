import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "worker" | "homeowner" | "admin";
  };
}

/**
 * Verify JWT token and attach user to request
 */
export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    // Get user profile to get role
    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    req.user = {
      id: data.user.id,
      email: data.user.email || "",
      role: profileData?.role || "worker",
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Authentication failed",
    });
  }
};

/**
 * Check if user has specific role
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Admin-only middleware
 */
export const adminOnly = requireRole(["admin"]);

/**
 * Worker-only middleware
 */
export const workerOnly = requireRole(["worker"]);

/**
 * Homeowner-only middleware
 */
export const homeownerOnly = requireRole(["homeowner"]);
