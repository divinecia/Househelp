export interface WorkerData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  password: string;
  phoneNumber: string;
  maritalStatus: string;
  nationalId: string;
  criminalRecord: string;
  typeOfWork: string;
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
  numberOfFamilyMembers?: string;
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
  numberOfWorkersNeeded?: string;
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
}

export type UserData = WorkerData | HomeownerData | AdminData;

// Get user from API (replaces insecure localStorage usage)
export const getUser = async (role: string) => {
  const token = sessionStorage.getItem("auth_token");
  if (!token) return null;

  try {
    const response = await fetch("/api/auth/user", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const userData = await response.json();
      if (userData.role === role) {
        return userData;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
};

// Register user via API only (removes insecure localStorage registration)
export const registerUser = async (role: string, data: UserData) => {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        role,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("API registration error:", error);
    throw error;
  }
};

// Login user via API only (removes insecure localStorage login)
export const loginUser = async (role: string, email: string, password: string) => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        role,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const result = await response.json();

    // Store tokens securely - handle both session-based and token-based auth
    if (result.data?.token) {
      sessionStorage.setItem("auth_token", result.data.token);

      if (result.data.user) {
        sessionStorage.setItem("user_info", JSON.stringify({
          id: result.data.user.id,
          email: result.data.user.email,
          role: result.data.user.role || role,
          fullName: result.data.user.fullName
        }));
      }
    } else if (result.data?.session) {
      // Legacy support for session-based auth
      sessionStorage.setItem("auth_token", result.data.session.access_token);
      sessionStorage.setItem("refresh_token", result.data.session.refresh_token || "");

      if (result.data.user) {
        sessionStorage.setItem("user_info", JSON.stringify({
          id: result.data.user.id,
          email: result.data.user.email,
          role: result.data.user.role || role
        }));
      }
    }

    return result.data?.user || null;
  } catch (error) {
    console.error("API login error:", error);
    throw error;
  }
};

// Logout user (clear all auth data)
export const logoutUser = async () => {
  try {
    const token = sessionStorage.getItem("auth_token");
    
    // Call API logout if token exists
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
    }
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    // Always clear local storage
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user_info");
  }
};

// Check if user is authenticated via API
export const isAuthenticated = async (role?: string): Promise<boolean> => {
  const token = sessionStorage.getItem("auth_token");
  if (!token) return false;

  try {
    const response = await fetch("/api/auth/verify", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const result = await response.json();

      // Handle both response formats
      const userData = result.data?.user || result;

      // If role is specified, check if it matches
      if (role && userData.role !== role) {
        return false;
      }

      return true;
    }
    return false;
  } catch (error) {
    console.error("Auth verification error:", error);
    return false;
  }
};