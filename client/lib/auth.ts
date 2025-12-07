import { supabase } from "./supabase";
import { logoutUserSupabase, getCurrentUser as getCurrentUserSupabase } from "./supabase-auth";

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
}

export interface HomeownerData {
  fullName: string;
  contactNumber: string;
  email: string;
  password: string;
  age?: string;
  homeAddress: string;
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
  termsAccepted: boolean;
}

export type UserData = WorkerData | HomeownerData | AdminData;

export const registerUser = async (role: string, data: UserData) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, role }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Registration failed");
  }

  const result = await response.json();
  return result.data;
};

export const loginUser = async (_role: string, email: string, password: string) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Login failed");
  }

  const result = await response.json();
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
    sessionStorage.setItem("user_info", JSON.stringify({
      id: user.id,
      email: user.email,
      role: profile?.role,
      fullName: profile?.full_name,
    }));
  }

  // Mirror session into Supabase client for downstream requests
  if (session?.access_token) {
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token || "",
    });
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
  const { user, profile } = await getCurrentUserSupabase();
  if (!user) return null;
  if (role && profile?.role !== role) return null;
  return { user, profile };
};

export const isAuthenticated = (_role?: string): boolean => {
  const token = sessionStorage.getItem("auth_token") || sessionStorage.getItem("access_token");
  return Boolean(token);
};

export const isAuthenticatedAsync = async (role?: string): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return false;
  if (!role) return true;
  const { profile } = await getCurrentUserSupabase();
  return profile?.role === role;
};