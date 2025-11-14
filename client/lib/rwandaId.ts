/**
 * Rwanda National ID Validation and Formatting Utility
 * 
 * Rwanda national ID format (16 digits):
 * Position 1: Status (1=Rwandan citizen, 2=refugee, 3=foreigner)
 * Positions 2-5: Year of Birth (4 digits, e.g., 1990)
 * Position 6: Gender (8=male, 7=female)
 * Positions 7-13: Birth Order (7 digits, sequential order)
 * Position 14: Issue Frequency (1 digit, 0 for first time)
 * Positions 15-16: Security Code (2 digits)
 */

export enum RwandanIDStatus {
  CITIZEN = "1",
  REFUGEE = "2",
  FOREIGNER = "3",
}

export enum RwandanIDGender {
  MALE = "8",
  FEMALE = "7",
}

export interface ParsedRwandanID {
  status: RwandanIDStatus;
  statusLabel: string;
  yearOfBirth: string;
  gender: RwandanIDGender;
  genderLabel: string;
  birthOrder: string;
  issueFrequency: string;
  securityCode: string;
  isValid: boolean;
  errors: string[];
}

/**
 * Validate a Rwanda National ID format
 * Accepts both 10-digit (1 XXXXXXXXX) and 16-digit formats
 */
export const validateRwandaID = (id: string): boolean => {
  const cleanId = id.replace(/\s/g, "");
  
  // Accept 10-digit format (1 + 9 digits)
  if (/^1\d{9}$/.test(cleanId)) {
    return true;
  }
  
  // Accept 16-digit format (full Rwanda ID)
  if (/^\d{16}$/.test(cleanId)) {
    return validateFullRwandaID(cleanId);
  }
  
  return false;
};

/**
 * Validate the complete 16-digit Rwanda National ID
 */
export const validateFullRwandaID = (id: string): boolean => {
  const cleanId = id.replace(/\s/g, "");
  
  if (cleanId.length !== 16) {
    return false;
  }
  
  // Position 1: Status (1, 2, or 3)
  const status = cleanId[0];
  if (!["1", "2", "3"].includes(status)) {
    return false;
  }
  
  // Positions 2-5: Year of birth (valid year format)
  const yearOfBirth = cleanId.substring(1, 5);
  const year = parseInt(yearOfBirth, 10);
  if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
    return false;
  }
  
  // Position 6: Gender (7 or 8)
  const gender = cleanId[5];
  if (!["7", "8"].includes(gender)) {
    return false;
  }
  
  // Positions 7-13: Birth order (7 digits)
  const birthOrder = cleanId.substring(6, 13);
  if (!/^\d{7}$/.test(birthOrder)) {
    return false;
  }
  
  // Position 14: Issue frequency (single digit)
  const issueFrequency = cleanId[13];
  if (!/^\d$/.test(issueFrequency)) {
    return false;
  }
  
  // Positions 15-16: Security code (2 digits)
  const securityCode = cleanId.substring(14, 16);
  if (!/^\d{2}$/.test(securityCode)) {
    return false;
  }
  
  return true;
};

/**
 * Parse a Rwanda National ID and extract components
 */
export const parseRwandaID = (id: string): ParsedRwandanID => {
  const cleanId = id.replace(/\s/g, "");
  const errors: string[] = [];
  let isValid = true;

  // Validate length
  if (cleanId.length !== 16) {
    errors.push(`ID must be 16 digits (got ${cleanId.length})`);
    isValid = false;
    return {
      status: RwandanIDStatus.CITIZEN,
      statusLabel: "",
      yearOfBirth: "",
      gender: RwandanIDGender.MALE,
      genderLabel: "",
      birthOrder: "",
      issueFrequency: "",
      securityCode: "",
      isValid,
      errors,
    };
  }

  // Parse status
  const statusStr = cleanId[0];
  let status: RwandanIDStatus = RwandanIDStatus.CITIZEN;
  let statusLabel = "";
  
  if (statusStr === "1") {
    status = RwandanIDStatus.CITIZEN;
    statusLabel = "Rwandan Citizen";
  } else if (statusStr === "2") {
    status = RwandanIDStatus.REFUGEE;
    statusLabel = "Refugee";
  } else if (statusStr === "3") {
    status = RwandanIDStatus.FOREIGNER;
    statusLabel = "Foreigner";
  } else {
    errors.push(`Invalid status: ${statusStr} (must be 1, 2, or 3)`);
    isValid = false;
  }

  // Parse year of birth
  const yearOfBirth = cleanId.substring(1, 5);
  const year = parseInt(yearOfBirth, 10);
  if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
    errors.push(`Invalid year of birth: ${yearOfBirth}`);
    isValid = false;
  }

  // Parse gender
  const genderStr = cleanId[5];
  let gender: RwandanIDGender = RwandanIDGender.MALE;
  let genderLabel = "";
  
  if (genderStr === "8") {
    gender = RwandanIDGender.MALE;
    genderLabel = "Male";
  } else if (genderStr === "7") {
    gender = RwandanIDGender.FEMALE;
    genderLabel = "Female";
  } else {
    errors.push(`Invalid gender: ${genderStr} (must be 7 for female or 8 for male)`);
    isValid = false;
  }

  // Parse birth order
  const birthOrder = cleanId.substring(6, 13);
  if (!/^\d{7}$/.test(birthOrder)) {
    errors.push("Invalid birth order (must be 7 digits)");
    isValid = false;
  }

  // Parse issue frequency
  const issueFrequency = cleanId[13];
  if (!/^\d$/.test(issueFrequency)) {
    errors.push("Invalid issue frequency (must be single digit)");
    isValid = false;
  }

  // Parse security code
  const securityCode = cleanId.substring(14, 16);
  if (!/^\d{2}$/.test(securityCode)) {
    errors.push("Invalid security code (must be 2 digits)");
    isValid = false;
  }

  return {
    status,
    statusLabel,
    yearOfBirth,
    gender,
    genderLabel,
    birthOrder,
    issueFrequency,
    securityCode,
    isValid: isValid && validateFullRwandaID(cleanId),
    errors,
  };
};

/**
 * Format Rwanda National ID for display
 * Input: 16-digit ID
 * Output: formatted string with visual separation
 */
export const formatRwandaIDForDisplay = (id: string): string => {
  const cleanId = id.replace(/\s/g, "");
  
  if (cleanId.length !== 16) {
    return id;
  }
  
  // Format: 1 2345 6 7890123 4 56
  // Position 1 | YoB (4) | Gender | BirthOrder (7) | Frequency | Security (2)
  return `${cleanId[0]} ${cleanId.substring(1, 5)} ${cleanId[5]} ${cleanId.substring(6, 13)} ${cleanId[13]} ${cleanId.substring(14, 16)}`;
};
