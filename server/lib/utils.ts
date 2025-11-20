/**
 * Sanitize object by removing dangerous properties
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const dangerous = ["__proto__", "constructor", "prototype"];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!dangerous.includes(key)) {
      if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else if (typeof value === "string") {
        sanitized[key] = value.replace(/[<>]/g, "").trim();
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized as T;
};

/**
 * Convert camelCase keys to snake_case
 */
export const camelToSnakeCase = (
  obj: Record<string, any>,
): Record<string, any> => {
  const newObj: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    newObj[snakeKey] = value;
  }

  return newObj;
};

/**
 * Map field names from client camelCase to database snake_case
 */
export const mapWorkerFields = (
  data: Record<string, any>,
): Record<string, any> => {
  const fieldMap: Record<string, string> = {
    fullName: "full_name",
    dateOfBirth: "date_of_birth",
    maritalStatus: "marital_status",
    phoneNumber: "phone_number",
    nationalId: "national_id",
    typeOfWork: "type_of_work",
    workExperience: "work_experience",
    expectedWages: "expected_wages",
    workingHoursAndDays: "working_hours_and_days",
    educationQualification: "education_qualification",
    educationCertificate: "education_certificate_url",
    trainingCertificate: "training_certificate_url",
    criminalRecord: "criminal_record_url",
    languageProficiency: "language_proficiency",
    insuranceCompany: "insurance_company",
    healthCondition: "health_condition",
    emergencyName: "emergency_contact_name",
    emergencyContact: "emergency_contact_phone",
    bankAccountNumber: "bank_account_number",
    accountHolder: "account_holder_name",
    termsAccepted: "terms_accepted",
  };

  const excludeFields = ["email", "password", "role", "fullName"];
  const mappedData: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip excluded fields and null/undefined values
    if (excludeFields.includes(key) || value === null || value === undefined) {
      continue;
    }

    const dbKey = fieldMap[key] || key;
    let transformedValue = value;

    // Transform values to match database CHECK constraints
    if (dbKey === "gender" && typeof value === "string") {
      // Database expects: 'male', 'female', 'other'
      transformedValue = value.toLowerCase();
    }
    if (dbKey === "marital_status" && typeof value === "string") {
      // Database expects lowercase values
      transformedValue = value.toLowerCase();
    }

    mappedData[dbKey] = transformedValue;
  }

  return mappedData;
};

/**
 * Map field names from client camelCase to database snake_case for homeowners
 */
export const mapHomeownerFields = (
  data: Record<string, any>,
): Record<string, any> => {
  const fieldMap: Record<string, string> = {
    fullName: "full_name",
    contactNumber: "contact_number",
    homeAddress: "home_address",
    typeOfResidence: "type_of_residence",
    numberOfFamilyMembers: "number_of_family_members",
    homeComposition: "home_composition",
    homeCompositionDetails: "home_composition_details",
    nationalId: "national_id",
    workerInfo: "worker_info",
    specificDuties: "specific_duties",
    workingHoursAndSchedule: "working_hours_and_schedule",
    numberOfWorkersNeeded: "number_of_workers_needed",
    preferredGender: "preferred_gender",
    languagePreference: "language_preference",
    wagesOffered: "wages_offered",
    reasonForHiring: "reason_for_hiring",
    specialRequirements: "special_requirements",
    startDateRequired: "start_date_required",
    criminalRecord: "criminal_record_required",
    criminalRecordRequired: "criminal_record_required",
    paymentMode: "payment_mode",
    bankDetails: "bank_details",
    religious: "religious_preferences",
    religiousPreferences: "religious_preferences",
    smokingDrinkingRestrictions: "smoking_drinking_restrictions",
    specificSkillsNeeded: "specific_skills_needed",
    selectedDays: "selected_days",
    termsAccepted: "terms_accepted",
  };

  const excludeFields = ["email", "password", "role", "fullName"];
  const mappedData: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip excluded fields and null/undefined values
    if (excludeFields.includes(key) || value === null || value === undefined) {
      continue;
    }

    const dbKey = fieldMap[key] || key;
    let transformedValue = value;

    // Transform values to match database CHECK constraints
    if (dbKey === "type_of_residence" && typeof value === "string") {
      // Database expects: 'studio', 'apartment', 'villa', 'mansion'
      transformedValue = value.toLowerCase();
    }
    if (dbKey === "worker_info" && typeof value === "string") {
      // Database expects: 'full-time', 'part-time', 'live-in'
      transformedValue = value.toLowerCase();
    }
    if (dbKey === "preferred_gender" && typeof value === "string") {
      // Database expects: 'male', 'female', 'any'
      // Frontend sends 'male', 'female', or empty (which should be 'any')
      transformedValue = value.toLowerCase() || "any";
    }
    if (dbKey === "payment_mode" && typeof value === "string") {
      // Database expects: 'bank', 'cash', 'mobile'
      // Map common variations
      const paymentMap: Record<string, string> = {
        "bank-transfer": "bank",
        bank_transfer: "bank",
        "mobile-money": "mobile",
        mobile_money: "mobile",
        paypack: "mobile",
        stripe: "bank",
      };
      transformedValue = paymentMap[value.toLowerCase()] || value.toLowerCase();
    }
    if (dbKey === "criminal_record_required") {
      // Convert to boolean
      if (typeof value === "string") {
        transformedValue = value.toLowerCase() === "yes" || value === "true";
      } else if (typeof value === "boolean") {
        transformedValue = value;
      } else {
        transformedValue = false;
      }
    }
    if (
      dbKey === "smoking_drinking_restrictions" &&
      typeof value === "string"
    ) {
      // Keep as-is, just ensure it's a string
      transformedValue = value;
    }

    mappedData[dbKey] = transformedValue;
  }

  return mappedData;
};

/**
 * Map field names from client camelCase to database snake_case for admins
 */
export const mapAdminFields = (
  data: Record<string, any>,
): Record<string, any> => {
  const fieldMap: Record<string, string> = {
    fullName: "full_name",
    contactNumber: "contact_number",
    termsAccepted: "terms_accepted",
  };

  const excludeFields = ["email", "password", "role", "fullName"];
  const mappedData: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip excluded fields and null/undefined values
    if (excludeFields.includes(key) || value === null || value === undefined) {
      continue;
    }

    const dbKey = fieldMap[key] || key;
    mappedData[dbKey] = value;
  }

  return mappedData;
};
