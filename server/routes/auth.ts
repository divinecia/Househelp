import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import {
  mapWorkerFields,
  mapHomeownerFields,
  mapAdminFields,
} from "../lib/utils";

const router = Router();

/**
 * Register user (Worker, Homeowner, or Admin)
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    // Handle both camelCase and snake_case for compatibility
    const email = req.body.email;
    const password = req.body.password;
    const fullName = req.body.full_name || req.body.fullName;
    const role = req.body.role;
    const contactNumber = req.body.contact_number || req.body.contactNumber;
    const gender = req.body.gender;

    // Extract remaining profile data
    const { email: _e, password: _p, full_name: _fn, fullName: _fN, role: _r, contact_number: _cn, contactNumber: _cN, gender: _g, ...profileData } = req.body;

    if (!email || !password || !fullName || !role) {
      console.error("Registration validation failed:", { email: !!email, password: !!password, fullName: !!fullName, role: !!role });
      console.error("Request body:", JSON.stringify(req.body, null, 2));
      return res.status(400).json({
        success: false,
        error: "Missing required fields: email, password, fullName, role",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already registered",
      });
    }

    // Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        error: authError.message,
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        error: "User creation failed",
      });
    }

    // First, create user profile in user_profiles table
    const { data: userProfileData, error: userProfileError } = await supabase
      .from("user_profiles")
      .insert([
        {
          id: authData.user.id,
          email,
          full_name: fullName,
          role,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (userProfileError) {
      console.error(`User profile creation error:`, userProfileError);
      // Note: Can't delete auth user with anon key, would need service role key
      return res.status(400).json({
        success: false,
        error: "Failed to create user profile: " + userProfileError.message,
      });
    }

    // Then, create role-specific profile
    let profileTable = "user_profiles";
    let mappedProfileData: any = {};

    if (role === "worker") {
      profileTable = "workers";
      mappedProfileData = mapWorkerFields(profileData);
    } else if (role === "homeowner") {
      profileTable = "homeowners";
      mappedProfileData = mapHomeownerFields(profileData);
    } else if (role === "admin") {
      profileTable = "admins";
      // For admin, only include contact_number and gender
      mappedProfileData = {
        contact_number: contactNumber,
        gender: gender,
      };
    }

    const { data: profileDataResult, error: profileError } = await supabase
      .from(profileTable)
      .insert([
        {
          id: authData.user.id,
          email,
          full_name: fullName,
          role,
          ...mappedProfileData,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (profileError) {
      // Clean up user profile if role-specific profile creation fails
      console.error(`Profile creation error for ${role}:`, profileError);
      await supabase.from("user_profiles").delete().eq("id", authData.user.id);
      // Note: Can't delete auth user with anon key, would need service role key
      return res.status(400).json({
        success: false,
        error: "Failed to create user profile: " + profileError.message,
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role,
        },
        profile: profileDataResult,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Registration failed",
    });
  }
});

/**
 * Login user
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: email, password",
      });
    }

    // Sign in user
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return res.status(401).json({
        success: false,
        error: authError.message,
      });
    }

    if (!authData.user) {
      return res.status(401).json({
        success: false,
        error: "Login failed",
      });
    }

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      return res.status(400).json({
        success: false,
        error: "Failed to fetch user profile",
      });
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: profileData.role,
        },
        profile: profileData,
        session: authData.session,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Login failed",
    });
  }
});

/**
 * Get current user
 */
router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Missing authorization header",
      });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    // Get user profile
    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    return res.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        profile: profileData,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to get user",
    });
  }
});

/**
 * Refresh access token
 */
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "Refresh token is required",
      });
    }

    // Use Supabase to refresh the session
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      return res.status(401).json({
        success: false,
        error: "Failed to refresh token",
      });
    }

    return res.json({
      success: true,
      data: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Token refresh failed",
    });
  }
});

/**
 * Logout user (client-side only, but included for completeness)
 */
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({
        success: true,
        message: "Logged out",
      });
    }

    const token = authHeader.substring(7);
    await supabase.auth.signOut();

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Logout failed",
    });
  }
});

/**
 * Request password reset
 */
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Send password reset email via Supabase
    // Note: Supabase will only send if email exists, but we always return success for security
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.origin || 'http://localhost:5173'}/reset-password`,
    });

    if (error) {
      console.error("Password reset error:", error);
      // Don't expose whether email exists
    }

    return res.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process password reset request",
    });
  }
});

/**
 * Reset password with token
 */
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { password, token } = req.body;

    if (!password || !token) {
      return res.status(400).json({
        success: false,
        error: "Password and token are required",
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    // Update password using Supabase
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to reset password",
    });
  }
});

export default router;
