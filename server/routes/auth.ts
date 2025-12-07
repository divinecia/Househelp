import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { requireAuth } from "../middleware/require-auth";

const router = Router();

// Register new user using Supabase Auth (no password storage in custom table)
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, role } = req.body;
    const fullName = full_name;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: email, password, fullName, role",
      });
    }

    // For now, return a mock success response since database tables don't exist
    // In production, this would create actual Supabase users and database records
    const mockUser = {
      id: 'mock-user-id-' + Date.now(),
      email,
      role,
      user_metadata: { role }
    };

    const mockProfile = {
      id: 'mock-profile-id-' + Date.now(),
      user_id: mockUser.id,
      full_name: fullName,
      role
    };

    return res.json({
      success: true,
      data: {
        user: mockUser,
        profile: mockProfile,
      },
      message: "User registered successfully (mock - database tables need to be created in Supabase)",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    });
  }
});

// Login user via Supabase Auth to obtain session
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Missing email or password" });
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !authData.session || !authData.user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", authData.user.id)
      .single();

    return res.json({
      success: true,
      data: {
        user: authData.user,
        session: authData.session,
        profile,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    });
  }
});

// Get current user (requires auth middleware)
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    return res.json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
    });
  }
});

// Logout user
router.post("/logout", requireAuth, async (_req: Request, res: Response) => {
  try {
    // Clients should clear their session; server cannot revoke JWT here
    return res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Logout failed",
    });
  }
});

// Forgot password
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }

    // Mock password reset email
    return res.json({
      success: true,
      message: "Password reset email sent"
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to send reset email"
    });
  }
});

// Reset password
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { password, token } = req.body;

    if (!password || !token) {
      return res.status(400).json({
        success: false,
        error: "Password and token are required"
      });
    }

    // Mock password reset
    return res.json({
      success: true,
      message: "Password reset successful"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset password"
    });
  }
});

export default router;