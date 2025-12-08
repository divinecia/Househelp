import { Router, Request, Response } from "express";
import { supabase, supabaseAdmin } from "../lib/supabase";
import { requireAuth } from "../middleware/require-auth";

const router = Router();

// Register new user using Supabase Auth (no password storage in custom table)
router.post("/register", async (req: Request, res: Response) => {
  try {
    console.log("Registration request received:", {
      email: req.body.email,
      has_password: !!req.body.password,
      full_name: req.body.fullName || req.body.full_name,
      role: req.body.role,
      all_fields: Object.keys(req.body),
    });

    // Normalize field names from frontend to match database schema
    const email = req.body.email;
    const password = req.body.password;
    const full_name = req.body.fullName || req.body.full_name;
    const role = req.body.role;
    const contact_number =
      req.body.contactNumber || req.body.phoneNumber || req.body.contact_number;
    const gender = req.body.gender;

    if (!email || !password || !full_name || !role) {
      const missingFields = [];
      if (!email) missingFields.push("email");
      if (!password) missingFields.push("password");
      if (!full_name) missingFields.push("fullName");
      if (!role) missingFields.push("role");

      const errorMsg = `Missing required fields: ${missingFields.join(", ")}`;
      console.error("Registration validation failed:", {
        missingFields,
        received: Object.keys(req.body),
      });
      return res.status(400).json({
        success: false,
        error: errorMsg,
      });
    }

    // Try to create user in Supabase Auth using admin client
    console.log("Attempting to create Supabase user:", { email, role });

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for testing
        user_metadata: { role },
      });

    if (authError) {
      console.error("Supabase Auth error:", {
        code: (authError as unknown as Record<string, unknown>)?.code,
        message: authError.message,
        status: (authError as unknown as Record<string, unknown>)?.status,
        name: authError.name,
        stack: authError.stack,
        fullError: JSON.stringify(authError, null, 2),
      });

      // Provide specific error messages based on error type
      let userFriendlyError = "Failed to create account";

      if (
        authError.message?.includes("already registered") ||
        (authError as unknown as Record<string, unknown>)?.code === "user_already_exists"
      ) {
        userFriendlyError =
          "This email is already registered. Please try logging in or use a different email.";
      } else if (
        authError.message?.includes("invalid") ||
        authError.message?.includes("email")
      ) {
        userFriendlyError =
          "Invalid email address. Please check and try again.";
      } else if (authError.message?.includes("password")) {
        userFriendlyError =
          "Password does not meet requirements. Must be at least 8 characters.";
      } else if (
        authError.message?.includes("Database error") ||
        (authError as unknown as Record<string, unknown>)?.code === "unexpected_failure"
      ) {
        userFriendlyError =
          "Database configuration error. Please check your Supabase setup.";
        console.error(
          "🔧 This might be a Supabase service role key issue. Please verify your SUPABASE_SERVICE_ROLE_KEY is correct.",
        );
      }

      return res.status(400).json({
        success: false,
        error: userFriendlyError,
        debug:
          process.env.NODE_ENV === "development"
            ? authError.message
            : undefined,
      });
    }

    if (!authData.user) {
      console.error("No user returned from Supabase Auth");
      return res.status(400).json({
        success: false,
        error: "Failed to create user account",
      });
    }

    const userId = authData.user.id;
    console.log("Supabase user created:", { userId, email });

    // Now save user profile to database with all available fields
    const profilePayload: Record<string, unknown> = {
      user_id: userId,
      full_name: full_name,
      role: role,
      email: email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (contact_number) profilePayload.phone = contact_number;
    if (gender) profilePayload.gender = gender;

    console.log("Saving user profile to database:", profilePayload);

    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .insert([profilePayload as never])
      .select()
      .single();

    // Create role-specific records based on user role
    if (profileData) {
      const rolePayload = {
        user_id: userId,
        full_name: full_name,
        email: email,
        phone: contact_number || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (role === "admin") {
        console.log("Creating admin record:", rolePayload);
        const { error: adminError } = await supabase
          .from("admins")
          .insert([rolePayload as never]);

        if (adminError) {
          console.error("Error creating admin record:", {
            code: (adminError as unknown as Record<string, unknown>)?.code,
            message: adminError.message,
          });
        } else {
          console.log("Admin record created successfully");
        }
      } else if (role === "homeowner") {
        // Add address for homeowners if provided
        const homeownerPayload = {
          ...rolePayload,
          address: req.body.homeAddress || req.body.address || null,
        };

        console.log("Creating homeowner record:", homeownerPayload);
        const { error: homeownerError } = await supabase
          .from("homeowners")
          .insert([homeownerPayload as never]);

        if (homeownerError) {
          console.error("Error creating homeowner record:", {
            code: (homeownerError as unknown as Record<string, unknown>)?.code,
            message: homeownerError.message,
          });
        } else {
          console.log("Homeowner record created successfully");
        }
      } else if (role === "worker") {
        // Add worker-specific fields if provided
        const workerPayload = {
          ...rolePayload,
          address: req.body.address || null,
          experience_years: req.body.experience
            ? parseInt(req.body.experience) || 0
            : 0,
          hourly_rate: req.body.expectedWages
            ? parseFloat(req.body.expectedWages) || 0
            : 0,
          skills: req.body.specificSkillsNeeded
            ? [req.body.specificSkillsNeeded]
            : [],
          availability_status: "available",
          verification_status: "pending",
        };

        console.log("Creating worker record:", workerPayload);
        const { error: workerError } = await supabase
          .from("workers")
          .insert([workerPayload as never]);

        if (workerError) {
          console.error("Error creating worker record:", {
            code: (workerError as unknown as Record<string, unknown>)?.code,
            message: workerError.message,
          });
        } else {
          console.log("Worker record created successfully");
        }
      }
    }

    if (profileError) {
      console.error("Error creating user profile:", {
        code: (profileError as unknown as Record<string, unknown>)?.code,
        message: profileError.message,
        hint: (profileError as unknown as Record<string, unknown>)?.hint,
      });

      let userFriendlyError = "Failed to save user profile";
      if (
        profileError.message?.includes("not found") ||
        profileError.message?.includes("no rows")
      ) {
        userFriendlyError =
          "User profile table not found. Please contact support.";
      } else if (
        profileError.message?.includes("permission") ||
        profileError.message?.includes("policy")
      ) {
        userFriendlyError = "Access denied. Please check database permissions.";
      } else if (
        profileError.message?.includes("constraint") ||
        profileError.message?.includes("unique")
      ) {
        userFriendlyError =
          "This user profile already exists. Please try logging in.";
      }

      return res.status(400).json({
        success: false,
        error: userFriendlyError,
        debug:
          process.env.NODE_ENV === "development"
            ? profileError.message
            : undefined,
      });
    }

    console.log("User profile created successfully:", profileData);

    console.log("Registration successful:", { email, role, userId });

    return res.json({
      success: true,
      data: {
        user: authData.user,
        profile: profileData || {
          user_id: userId,
          full_name: full_name,
          role: role,
          email: email,
        },
      },
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Unexpected registration error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({
      success: false,
      error:
        "An unexpected error occurred during registration. Please try again or contact support.",
      debug:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : undefined,
    });
  }
});

// Login user via Supabase Auth to obtain session
router.post("/login", async (req: Request, res: Response) => {
  try {
    console.log("Login request received:", {
      email: req.body.email,
      has_password: !!req.body.password,
    });

    const { email, password } = req.body;

    if (!email || !password) {
      const missing = [];
      if (!email) missing.push("email");
      if (!password) missing.push("password");
      console.error("Login validation failed:", { missingFields: missing });
      return res.status(400).json({
        success: false,
        error: `Please provide ${missing.join(" and ")}`,
      });
    }

    // Authenticate with Supabase Auth
    console.log("Authenticating with Supabase:", { email });

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.session) {
      console.error("Login authentication failed:", {
        error: authError?.message,
        code: (authError as unknown as Record<string, unknown>)?.code,
        hasSession: !!authData.session,
      });

      let errorMsg = "Invalid email or password";
      if (authError?.message?.includes("Invalid login credentials")) {
        errorMsg = "Invalid email or password. Please check and try again.";
      } else if (
        authError?.message?.includes("user not found") ||
        (authError as unknown as Record<string, unknown>)?.code === "user_not_found"
      ) {
        errorMsg = "No account found with this email. Please register first.";
      } else if (authError?.message?.includes("Email not confirmed")) {
        errorMsg = "Please confirm your email before logging in.";
      }

      return res.status(401).json({
        success: false,
        error: errorMsg,
        debug:
          process.env.NODE_ENV === "development"
            ? authError?.message
            : undefined,
      });
    }

    // Get user profile from database
    console.log("Fetching user profile");
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", authData.user.id)
      .single();

    if (profileError) {
      console.warn("User profile not found during login:", {
        code: (profileError as unknown as Record<string, unknown>)?.code,
        message: profileError.message,
      });
      // This is not fatal - we'll return user with metadata from auth
    }

    console.log("Login successful:", { email, userId: authData.user.id });

    return res.json({
      success: true,
      data: {
        user: authData.user,
        session: authData.session,
        profile: profileData || {
          user_id: authData.user.id,
          email: email,
          role: authData.user.user_metadata?.role || "user",
        },
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Unexpected login error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({
      success: false,
      error:
        "An unexpected error occurred during login. Please try again or contact support.",
      debug:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : undefined,
    });
  }
});

// Get current user (requires auth middleware)
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as unknown as { user: { id: string } }).user;

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
      console.error("Forgot password validation failed: email missing");
      return res.status(400).json({
        success: false,
        error: "Email address is required",
      });
    }

    console.log("Password reset requested for:", { email });

    // Mock password reset email (TODO: Implement real email sending via SendGrid)
    return res.json({
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link. Please check your email (including spam folder).",
    });
  } catch (error) {
    console.error("Unexpected forgot password error:", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return res.status(500).json({
      success: false,
      error:
        "An unexpected error occurred. Please try again or contact support.",
      debug:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : undefined,
    });
  }
});

// Reset password
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { password, token } = req.body;

    if (!password || !token) {
      const missing = [];
      if (!password) missing.push("password");
      if (!token) missing.push("reset token");
      console.error("Reset password validation failed:", {
        missingFields: missing,
      });
      return res.status(400).json({
        success: false,
        error: `Please provide ${missing.join(" and ")}`,
      });
    }

    console.log("Password reset attempted with token");

    // Mock password reset (TODO: Implement real password update via Supabase)
    return res.json({
      success: true,
      message:
        "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Unexpected reset password error:", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return res.status(500).json({
      success: false,
      error:
        "An unexpected error occurred while resetting your password. Please try again or contact support.",
      debug:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : undefined,
    });
  }
});

export default router;
