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
  trainingCertificate: string;
  languageProficiency: string;
  healthCondition: string;
  emergencyName: string;
  emergencyContact: string;
  bankAccountNumber: string;
  accountHolder: string;
  termsAccepted: boolean;
}

export interface HomeownerData {
  fullName: string;
  contactNumber: string;
  email: string;
  password: string;
  age?: string;
  homeAddress: string;
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

// Get user from localStorage
export const getUser = (role: string) => {
  const users = JSON.parse(localStorage.getItem(`${role}_users`) || "[]");
  const currentUserId = localStorage.getItem(`${role}_current_user`);
  return users.find((u: any) => u.id === currentUserId);
};

// Register user
export const registerUser = (role: string, data: UserData) => {
  const users = JSON.parse(localStorage.getItem(`${role}_users`) || "[]");
  const newUser = {
    id: Date.now().toString(),
    ...data,
  };
  users.push(newUser);
  localStorage.setItem(`${role}_users`, JSON.stringify(users));
  localStorage.setItem(`${role}_current_user`, newUser.id);
  return newUser;
};

// Login user
export const loginUser = (role: string, email: string, password: string) => {
  const users = JSON.parse(localStorage.getItem(`${role}_users`) || "[]");
  const user = users.find(
    (u: any) => u.email === email && u.password === password
  );
  if (user) {
    localStorage.setItem(`${role}_current_user`, user.id);
    return user;
  }
  return null;
};

// Logout user
export const logoutUser = (role: string) => {
  localStorage.removeItem(`${role}_current_user`);
};

// Check if user is authenticated
export const isAuthenticated = (role: string) => {
  return !!localStorage.getItem(`${role}_current_user`);
};

// Register user via API (for database persistence)
export const registerUserViaAPI = async (role: string, data: UserData) => {
  try {
    // Use the centralized auth endpoint for all roles
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

    // Also save to localStorage for quick access
    const users = JSON.parse(localStorage.getItem(`${role}_users`) || "[]");
    const newUser = {
      id: result.data?.id || Date.now().toString(),
      ...data,
    };
    users.push(newUser);
    localStorage.setItem(`${role}_users`, JSON.stringify(users));
    localStorage.setItem(`${role}_current_user`, newUser.id);

    return result.data || newUser;
  } catch (error) {
    console.error("API registration error:", error);
    throw error;
  }
};
