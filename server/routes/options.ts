import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Helper function to get options from a table
async function getOptions(tableName: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Genders
router.get("/genders", async (_req: Request, res: Response) => {
  const result = await getOptions("genders");
  return res.json(result);
});

// Marital Statuses
router.get("/marital-statuses", async (_req: Request, res: Response) => {
  const result = await getOptions("marital_statuses");
  return res.json(result);
});

// Service Types
router.get("/service-types", async (_req: Request, res: Response) => {
  const result = await getOptions("service_types");
  return res.json(result);
});

// Insurance Companies
router.get("/insurance-companies", async (_req: Request, res: Response) => {
  const result = await getOptions("insurance_companies");
  return res.json(result);
});

// Payment Methods
router.get("/payment-methods", async (_req: Request, res: Response) => {
  const result = await getOptions("payment_methods");
  return res.json(result);
});

// Report Issue Types
router.get("/report-types", async (_req: Request, res: Response) => {
  const result = await getOptions("report_issue_types");
  return res.json(result);
});

// Training Categories
router.get("/training-categories", async (_req: Request, res: Response) => {
  const result = await getOptions("training_categories");
  return res.json(result);
});

// Wage Units (Per Hour, Per Day, Per Month)
router.get("/wage-units", async (_req: Request, res: Response) => {
  const result = await getOptions("wage_units");
  return res.json(result);
});

// Language Levels (Beginner, Intermediate, Fluent, Native)
router.get("/language-levels", async (_req: Request, res: Response) => {
  const result = await getOptions("language_levels");
  return res.json(result);
});

// Residence Types (Studio, Apartment, Villa, Mansion)
router.get("/residence-types", async (_req: Request, res: Response) => {
  const result = await getOptions("residence_types");
  return res.json(result);
});

// Worker Info Options (Full-time, Part-time, Live-in)
router.get("/worker-info-options", async (_req: Request, res: Response) => {
  const result = await getOptions("worker_info_options");
  return res.json(result);
});

// Criminal Record Options (Yes, No)
router.get("/criminal-record-options", async (_req: Request, res: Response) => {
  const result = await getOptions("criminal_record_options");
  return res.json(result);
});

// Smoking/Drinking Options
router.get("/smoking-drinking-options", async (_req: Request, res: Response) => {
  const result = await getOptions("smoking_drinking_restrictions");
  return res.json(result);
});

export default router;
