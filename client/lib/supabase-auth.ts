import { supabase } from "./supabase";
import type { WorkerData, HomeownerData, AdminData } from "./auth";
import type { Database } from "../../shared/types";

export type UserRole = "worker" | "homeowner" | "admin";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

export const registerUserSupabase = async (
  role: UserRole,
  data: WorkerData | HomeownerData | AdminData
): Promise<{ user: any; profile: UserProfile }> => {
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

    const { data: profile, error: profileError } = await (supabase as any)
      .from("user_profiles")
      .insert([
        {
          user_id: authData.user.id,
          full_name: data.fullName || "",
          role,
        },
      ])
      .select()
      .single();

    if (profileError) {
      throw new Error(profileError.message);
    }

    return {
      user: authData.user,
      profile: profile as UserProfile,
    };
  } catch (error) {
    console.error("Supabase registration error:", error);
    throw error;
  }
};

export const loginUserSupabase = async (
  email: string,
  password: string
): Promise<{ user: any; profile: UserProfile }> => {
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

    const { data: profile, error: profileError } = await (supabase as any)
      .from("user_profiles")
      .select("*")
      .eq("user_id", authData.user.id)
      .single() as { data: UserProfile; error: any };

    if (profileError) {
      throw new Error(profileError.message);
    }

    return {
      user: authData.user,
      profile: profile as UserProfile,
    };
  } catch (error) {
    console.error("Supabase login error:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<{
  user: any;
  profile: UserProfile | null;
}> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return { user: null, profile: null };
    }

    const { data: profile, error: profileError } = await (supabase as any)
      .from("user_profiles")
      .select("*")
      .eq("user_id", sessionData.session.user.id)
      .single() as { data: UserProfile; error: any };

    if (profileError) {
      console.error("Error fetching profile:", profileError.message);
      return { user: sessionData.session.user, profile: null };
    }

    return {
      user: sessionData.session.user,
      profile: profile as UserProfile,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { user: null, profile: null };
  }
};

export const logoutUserSupabase = async (): Promise<void> => {
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
  profileData: Partial<Database["public"]["Tables"]["user_profiles"]["Update"]>
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await (supabase
      .from("user_profiles") as any)
      .update(profileData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as UserProfile;
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