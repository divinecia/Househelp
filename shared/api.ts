/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Homeowner registration request payload
 */
export interface HomeownerRegistrationRequest {
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

/**
 * Homeowner registration response
 */
export interface HomeownerRegistrationResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}
