import { supabase } from "./supabase";
import type { WorkerData, HomeownerData, AdminData } from "./auth";

export type UserRole = "worker" | "homeowner" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  createdAt: string;
  profileData: Record<string, any>;
}

export const registerUserSupabase = async (
  role: UserRole,
  data: WorkerData | HomeownerData | AdminData
) => {
  try {
    const email = data.email || "";
    const password = data.password || "";

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("Registration failed: User not created");
    }

    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .insert([
        {
          id: authData.user.id,
          email,
          role,
          fullName: data.fullName || "",
          profileData: data,
        },
      ])
      .select()
      .single();

    if (profileError) {
      throw new Error(profileError.message);
    }

    return {
      user: authData.user,
      profile: profileData,
    };
  } catch (error) {
    console.error("Supabase registration error:", error);
    throw error;
  }
};

export const loginUserSupabase = async (email: string, password: string) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("Login failed: User not found");
    }

    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      throw new Error(profileError.message);
    }

    return {
      user: authData.user,
      profile: profileData,
    };
  } catch (error) {
    console.error("Supabase login error:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return null;
    }

    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", sessionData.session.user.id)
      .single();

    return {
      user: sessionData.session.user,
      profile: profileData,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const logoutUserSupabase = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Supabase logout error:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  profileData: Record<string, any>
) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        profileData: {
          ...profileData,
        },
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const subscribeToUserNotifications = (
  userId: string,
  callback: (notification: any) => void
) => {
  const subscription = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
};
