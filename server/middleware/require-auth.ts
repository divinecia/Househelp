import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";

// Middleware to require a valid Supabase access token (Authorization: Bearer <token>)
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

    if (!token) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ success: false, error: "Invalid or expired token" });
    }

    // Fetch user profile to determine role and tenant scoping
    const { data: profile } = await (supabase as any)
      .from("user_profiles")
      .select("*")
      .eq("user_id", data.user.id)
      .single();

    if (!profile) {
      return res.status(403).json({ success: false, error: "Profile not found" });
    }

    (req as any).user = data.user;
    (req as any).userProfile = profile;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
}
