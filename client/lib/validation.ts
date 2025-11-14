import { z } from "zod";

/**
 * Common validation schemas reused across forms
 */

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .min(1, "Password is required");

export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^[\d+\-\s()]+$/, "Invalid phone number format");

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .min(1, "Name is required");

/**
 * Worker Registration Schema
 */
export const workerRegistrationSchema = z.object({
  fullName: nameSchema,
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]).optional(),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]).optional(),
  email: emailSchema,
  phoneNumber: phoneSchema,
  password: passwordSchema,
  nationalId: z
    .string()
    .min(1, "National ID is required")
    .regex(/^\d{16}$/, "National ID must be exactly 16 digits in Rwanda format"),
  typeOfWork: z.string().optional(),
  workExperience: z.string().optional(),
  expectedWages: z.string().optional(),
  workingHoursAndDays: z.string().optional(),
  educationQualification: z.string().optional(),
  educationCertificate: z.string().optional(),
  trainingCertificate: z.string().optional(),
  criminalRecord: z.string().optional(),
  languageProficiency: z.string().optional(),
  insuranceCompany: z.string().optional(),
  healthCondition: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyContact: phoneSchema.optional(),
  bankAccountNumber: z.string().optional(),
  accountHolder: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
});

export type WorkerRegistrationInput = z.infer<typeof workerRegistrationSchema>;

/**
 * Homeowner Registration Schema
 */
export const homeownerRegistrationSchema = z.object({
  fullName: nameSchema,
  age: z.string().optional(),
  contactNumber: phoneSchema,
  email: emailSchema,
  password: passwordSchema,
  homeAddress: z.string().min(1, "Home address is required"),
  typeOfResidence: z.enum(["studio", "apartment", "villa", "mansion"]).optional(),
  numberOfFamilyMembers: z.string().optional(),
  homeComposition: z
    .object({
      adults: z.boolean(),
      children: z.boolean(),
      elderly: z.boolean(),
      pets: z.boolean(),
    })
    .optional(),
  homeCompositionDetails: z.string().optional(),
  nationalId: z.string().optional(),
  workerInfo: z.enum(["full-time", "part-time", "live-in"]).optional(),
  specificDuties: z.string().optional(),
  workingHoursAndSchedule: z.string().optional(),
  numberOfWorkersNeeded: z.string().optional(),
  preferredGender: z.enum(["male", "female"]).optional(),
  languagePreference: z.string().optional(),
  wagesOffered: z.string().optional(),
  reasonForHiring: z.string().optional(),
  specialRequirements: z.string().optional(),
  startDateRequired: z.string().optional(),
  criminalRecord: z.enum(["yes", "no"]).optional(),
  paymentMode: z.enum(["bank", "cash", "mobile"]).optional(),
  bankDetails: z.string().optional(),
  religious: z.string().optional(),
  smokingDrinkingRestrictions: z
    .enum(["no_smoking_no_drinking", "smoking_allowed", "drinking_allowed", "both_allowed"])
    .optional(),
  specificSkillsNeeded: z.string().optional(),
  selectedDays: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
});

export type HomeownerRegistrationInput = z.infer<typeof homeownerRegistrationSchema>;

/**
 * Admin Registration Schema
 */
export const adminRegistrationSchema = z.object({
  fullName: nameSchema,
  contactNumber: phoneSchema,
  gender: z.enum(["male", "female", "other"]).optional(),
  email: emailSchema,
  password: passwordSchema,
});

export type AdminRegistrationInput = z.infer<typeof adminRegistrationSchema>;

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Validate form data and return errors
 */
export const validateFormData = <T extends Record<string, any>>(
  schema: z.ZodSchema,
  data: T
): Record<string, string> => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((error) => {
      const path = error.path.join(".");
      errors[path] = error.message;
    });
    return errors;
  }

  return {};
};
