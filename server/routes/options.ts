import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Helper function to get options from a table
async function getOptions(tableName: string, fallbackData?: Array<{ id: string; name: string }>) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    // If no data from database and fallback exists, use fallback
    if ((!data || data.length === 0) && fallbackData) {
      return { success: true, data: fallbackData };
    }

    // Convert id to string for consistency
    const formattedData = (data || []).map((item: any) => ({
      id: String(item.id),
      name: item.name
    }));

    return { success: true, data: formattedData };
  } catch (error: any) {
    // If database error and fallback exists, use fallback
    if (fallbackData) {
      return { success: true, data: fallbackData };
    }
    return { success: false, error: error.message };
  }
}

// Genders
router.get("/genders", async (_req: Request, res: Response) => {
  const fallbackGenders = [
    { id: "1", name: "Male" },
    { id: "2", name: "Female" },
    { id: "3", name: "Other" }
  ];
  const result = await getOptions("genders", fallbackGenders);
  return res.json(result);
});

// Marital Statuses
router.get("/marital-statuses", async (_req: Request, res: Response) => {
  const fallbackMaritalStatuses = [
    { id: "1", name: "Single" },
    { id: "2", name: "Married" },
    { id: "3", name: "Divorced" },
    { id: "4", name: "Widowed" }
  ];
  const result = await getOptions("marital_statuses", fallbackMaritalStatuses);
  return res.json(result);
});

// Service Types
router.get("/service-types", async (_req: Request, res: Response) => {
  const fallbackServiceTypes = [
    { id: "1", name: "Housekeeping" },
    { id: "2", name: "Cooking" },
    { id: "3", name: "Childcare" },
    { id: "4", name: "Elderly Care" },
    { id: "5", name: "Pet Care" },
    { id: "6", name: "Gardening" },
    { id: "7", name: "Laundry" }
  ];
  const result = await getOptions("service_types", fallbackServiceTypes);
  return res.json(result);
});

// Insurance Companies
router.get("/insurance-companies", async (_req: Request, res: Response) => {
  const fallbackInsuranceCompanies = [
    { id: "1", name: "SONARWA" },
    { id: "2", name: "SORAS" },
    { id: "3", name: "Radiant Insurance" },
    { id: "4", name: "Prime Insurance" },
    { id: "5", name: "Other" }
  ];
  const result = await getOptions("insurance_companies", fallbackInsuranceCompanies);
  return res.json(result);
});

// Payment Methods
router.get("/payment-methods", async (_req: Request, res: Response) => {
  const fallbackPaymentMethods = [
    { id: "1", name: "Bank Transfer" },
    { id: "2", name: "Mobile Money" }
  ];
  const result = await getOptions("payment_methods", fallbackPaymentMethods);
  return res.json(result);
});

// Report Issue Types
router.get("/report-types", async (_req: Request, res: Response) => {
  const fallbackReportTypes = [
    { id: "1", name: "Worker Misconduct" },
    { id: "2", name: "Safety Issue" },
    { id: "3", name: "Payment Dispute" },
    { id: "4", name: "Service Quality" },
    { id: "5", name: "Other" }
  ];
  const result = await getOptions("report_types", fallbackReportTypes);
  return res.json(result);
});

// Training Categories
router.get("/training-categories", async (_req: Request, res: Response) => {
  const fallbackTrainingCategories = [
    { id: "1", name: "Housekeeping & Cleaning" },
    { id: "2", name: "Cooking & Nutrition" },
    { id: "3", name: "Childcare & Development" },
    { id: "4", name: "Elderly Care" },
    { id: "5", name: "First Aid & Safety" },
    { id: "6", name: "Professional Development" }
  ];
  const result = await getOptions("training_categories", fallbackTrainingCategories);
  return res.json(result);
});

// Wage Units (Per Hour, Per Day, Per Month)
router.get("/wage-units", async (_req: Request, res: Response) => {
  const fallbackWageUnits = [
    { id: "1", name: "Per Hour" },
    { id: "2", name: "Per Day" },
    { id: "3", name: "Per Week" },
    { id: "4", name: "Per Month" }
  ];
  const result = await getOptions("wage_units", fallbackWageUnits);
  return res.json(result);
});

// Language Levels (Beginner, Intermediate, Fluent, Native)
router.get("/language-levels", async (_req: Request, res: Response) => {
  const fallbackLanguageLevels = [
    { id: "1", name: "Basic" },
    { id: "2", name: "Intermediate" },
    { id: "3", name: "Advanced" },
    { id: "4", name: "Fluent" },
    { id: "5", name: "Native" }
  ];
  const result = await getOptions("language_levels", fallbackLanguageLevels);
  return res.json(result);
});

// Residence Types (Studio, Apartment, Villa, Mansion)
router.get("/residence-types", async (_req: Request, res: Response) => {
  const fallbackResidenceTypes = [
    { id: "1", name: "Studio" },
    { id: "2", name: "Apartment" },
    { id: "3", name: "Villa" },
    { id: "4", name: "Mansion" },
    { id: "5", name: "House" }
  ];
  const result = await getOptions("residence_types", fallbackResidenceTypes);
  return res.json(result);
});

// Worker Info Options (Full-time, Part-time, Live-in)
router.get("/worker-info-options", async (_req: Request, res: Response) => {
  const fallbackWorkerInfoOptions = [
    { id: "1", name: "Full-time" },
    { id: "2", name: "Part-time" },
    { id: "3", name: "Live-in" },
    { id: "4", name: "Live-out" }
  ];
  const result = await getOptions("worker_info_options", fallbackWorkerInfoOptions);
  return res.json(result);
});

// Criminal Record Options (Yes, No)
router.get("/criminal-record-options", async (_req: Request, res: Response) => {
  const fallbackCriminalRecordOptions = [
    { id: "1", name: "Yes" },
    { id: "2", name: "No" }
  ];
  const result = await getOptions("criminal_record_options", fallbackCriminalRecordOptions);
  return res.json(result);
});

// Smoking/Drinking Options
router.get(
  "/smoking-drinking-options",
  async (_req: Request, res: Response) => {
    const fallbackSmokingDrinkingOptions = [
      { id: "1", name: "No smoking/drinking allowed" },
      { id: "2", name: "Smoking allowed outside only" },
      { id: "3", name: "Drinking allowed in moderation" },
      { id: "4", name: "No restrictions" }
    ];
    const result = await getOptions("smoking_drinking_restrictions", fallbackSmokingDrinkingOptions);
    return res.json(result);
  },
);

export default router;
