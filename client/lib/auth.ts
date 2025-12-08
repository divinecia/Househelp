import { supabase } from "./supabase";
import {
  logoutUserSupabase,
  getCurrentUser as getCurrentUserSupabase,
} from "./supabase-auth";

export interface WorkerData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  password: string;
  phoneNumber: string;
  maritalStatus: string;
  address?: string;
  nationalId: string;
  criminalRecord: string;
  typeOfWork: string;
  experience?: string;
  workExperience: string;
  expectedWages: string;
  workingHoursAndDays: string;
  educationQualification: string;
  educationCertificate?: string;
  trainingCertificate: string;
  languageProficiency: string;
  healthCondition: string;
  emergencyName: string;
  emergencyContact: string;
  bankAccountNumber: string;
  accountHolder: string;
  insuranceCompany?: string;
  termsAccepted: boolean;
  // Additional fields for database compatibility
  experience_years?: number;
  hourly_rate?: number;
  skills?: string[];
  specificSkillsNeeded?: string;
  verification_status?: string;
  availability_status?: string;
}

export interface HomeownerData {
  fullName: string;
  contactNumber: string;
  email: string;
  password: string;
  age?: string;
  homeAddress: string;
  address?: string; // Database field name
  city?: string;
  state?: string;
  postalCode?: string;
  typeOfResidence?: string;
  numberOfFamilyMembers?: string | number;
  homeComposition?: {
    adults: boolean;
    children: boolean;
    elderly: boolean;
    pets: boolean;
  };
  homeCompositionDetails?: string;
  nationalId?: string;
  workerInfo?: string;
  specificDuties?: string;
  workingHoursAndSchedule?: string;
  numberOfWorkersNeeded?: string | number;
  preferredGender?: string;
  languagePreference?: string;
  wagesOffered?: string;
  reasonForHiring?: string;
  specialRequirements?: string;
  startDateRequired?: string;
  criminalRecord?: string;
  paymentMode?: string;
  bankDetails?: string;
  religious?: string;
  smokingDrinkingRestrictions?: string;
  specificSkillsNeeded?: string;
  selectedDays?: string;
  termsAccepted: boolean;
}

export interface AdminData {
  fullName: string;
  contactNumber: string;
  gender: string;
  email: string;
  password: string;
  termsAccepted?: boolean;
}

export type UserData = WorkerData | HomeownerData | AdminData;

export const registerUser = async (role: string, data: UserData) => {
  // Normalize data based on role to ensure database compatibility
  const normalizedData: Record<string, unknown> = { ...data, role };

  // Ensure address field is populated for homeowners
  if (role === "homeowner" && "homeAddress" in data && data.homeAddress) {
    normalizedData.address = data.homeAddress;
  }

  // Ensure phone field is populated correctly for all roles
  if ("contactNumber" in data) {
    normalizedData.contactNumber = data.contactNumber;
  } else if ("phoneNumber" in data) {
    normalizedData.contactNumber = data.phoneNumber;
  }

  // Add worker-specific defaults
  if (role === "worker") {
    if ("expectedWages" in data && data.expectedWages) {
      normalizedData.expectedWages = data.expectedWages;
    }
    if ("experience" in data && data.experience) {
      normalizedData.experience = data.experience;
    }
    if ("specificSkillsNeeded" in data && data.specificSkillsNeeded) {
      normalizedData.specificSkillsNeeded = data.specificSkillsNeeded;
    }
  }

  console.log("Registering user with normalized data:", {
    role,
    fields: Object.keys(normalizedData),
  });

  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalizedData),
  });

  const result = await response.json();

  if (!response.ok) {
    // Provide clear error message to user
    const errorMessage =
      result.error || "Registration failed. Please try again.";
    console.error("Registration failed:", {
      status: response.status,
      error: result.error,
      debug: result.debug,
    });
    throw new Error(errorMessage);
  }

  return result.data;
};

export const loginUser = async (
  _role: string,
  email: string,
  password: string,
) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    const errorMessage =
      result.error || "Login failed. Please check your email and password.";
    console.error("Login failed:", {
      status: response.status,
      error: result.error,
      debug: result.debug,
    });
    throw new Error(errorMessage);
  }

  console.log("Login response received:", {
    success: result.success,
    hasData: !!result.data,
  });

  const session = result.data?.session;
  const user = result.data?.user;
  const profile = result.data?.profile;

  if (session?.access_token) {
    sessionStorage.setItem("auth_token", session.access_token);
    if (session.refresh_token) {
      sessionStorage.setItem("refresh_token", session.refresh_token);
    }
  }

  if (user) {
    sessionStorage.setItem(
      "user_info",
      JSON.stringify({
        id: user.id,
        email: user.email,
        role: profile?.role,
        fullName: profile?.full_name,
      }),
    );
  }

  // Mirror session into Supabase client for downstream requests
  if (session?.access_token) {
    try {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token || "",
      });
      console.log("Supabase session set successfully");
    } catch (err) {
      console.error("Error setting Supabase session:", err);
      // Continue anyway - the mock tokens are stored in sessionStorage
    }
  }

  return user || null;
};

export const logoutUser = async () => {
  try {
    await logoutUserSupabase();
  } finally {
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user_info");
  }
};

export const getUser = async (role?: string) => {
  // First check for mock auth user info
  const userInfo = sessionStorage.getItem("user_info");
  console.log("getUser - checking user_info:", {
    hasUserInfo: !!userInfo,
    requestedRole: role,
  });

  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      console.log("getUser - parsed user_info:", parsed);

      if (role && parsed.role !== role) {
        console.log("getUser - role mismatch:", {
          requested: role,
          actual: parsed.role,
        });
        return null;
      }

      // Return mock user and profile for compatibility
      const result = {
        user: {
          id: parsed.id,
          email: parsed.email,
          user_metadata: { role: parsed.role },
        },
        profile: {
          full_name: parsed.fullName,
          role: parsed.role,
          email: parsed.email,
          id: parsed.id,
        },
      };
      console.log("getUser - returning mock user:", result);
      return result;
    } catch (err) {
      console.error("getUser - error parsing user_info:", err);
      // Continue to Supabase auth
    }
  }

  console.log("getUser - no user_info, checking Supabase");
  // Fall back to Supabase session
  const { user, profile } = await getCurrentUserSupabase();
  if (!user) return null;
  if (role && profile?.role !== role) return null;
  return { user, profile };
};

export const isAuthenticated = (_role?: string): boolean => {
  const token =
    sessionStorage.getItem("auth_token") ||
    sessionStorage.getItem("access_token");
  return Boolean(token);
};

export const isAuthenticatedAsync = async (role?: string): Promise<boolean> => {
  // First check for mock auth token
  const mockToken = sessionStorage.getItem("auth_token");
  console.log("isAuthenticatedAsync - checking mock token:", {
    mockToken: !!mockToken,
    role,
  });

  if (mockToken) {
    if (!role) return true;
    // For mock auth, check user_info for role
    const userInfo = sessionStorage.getItem("user_info");
    console.log("isAuthenticatedAsync - user_info:", userInfo);

    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        console.log("isAuthenticatedAsync - parsed user_info:", parsed);
        const hasRole = parsed.role === role;
        console.log("isAuthenticatedAsync - role match:", {
          expectedRole: role,
          actualRole: parsed.role,
          match: hasRole,
        });
        return hasRole;
      } catch (err) {
        console.error("isAuthenticatedAsync - error parsing user_info:", err);
        return false;
      }
    }
    console.log("isAuthenticatedAsync - no user_info found");
    return false;
  }

  console.log("isAuthenticatedAsync - no mock token, checking Supabase");
  // Fall back to Supabase session
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return false;
  if (!role) return true;
  const { profile } = await getCurrentUserSupabase();
  return profile?.role === role;
};
