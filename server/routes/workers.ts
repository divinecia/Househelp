import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get all workers with filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const { typeOfWork, type_of_work, status, limit = 50, offset = 0 } = req.query;
    let query = supabase.from("workers").select("*");

    // Accept both camelCase and snake_case for type_of_work
    const workType = typeOfWork || type_of_work;
    if (workType) {
      query = query.eq("type_of_work", workType);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) throw new Error(error.message);

    return res.json({ success: true, data, total: count });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get single worker
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("workers").select("*").eq("id", id).single();

    if (error) throw new Error(error.message);

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Create worker
router.post("/", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("workers").insert([req.body]).select().single();

    if (error) throw new Error(error.message);

    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update worker
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Define allowed fields for update (prevent updating system fields)
    const allowedFields = [
      'date_of_birth', 'gender', 'marital_status', 'phone_number',
      'national_id', 'type_of_work', 'work_experience', 'expected_wages',
      'working_hours_and_days', 'education_qualification', 'training_certificate_url',
      'language_proficiency', 'health_condition', 'emergency_contact_name',
      'emergency_contact_phone', 'bank_account_number', 'account_holder_name',
      'insurance_company', 'terms_accepted'
    ];
    
    // Filter request body to only include allowed fields
    const updateData: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
    
    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "No valid fields provided for update" 
      });
    }
    
    const { data, error } = await supabase
      .from("workers")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Delete worker
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("workers").delete().eq("id", id);

    if (error) throw new Error(error.message);

    return res.json({ success: true, message: "Worker deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Search workers by skills or location
router.get("/search/advanced", async (req: Request, res: Response) => {
  try {
    const { skill, location, rate } = req.query;
    let query = supabase.from("workers").select("*");

    if (skill) {
      query = query.or(`type_of_work.ilike.%${skill}%,language_proficiency.ilike.%${skill}%`);
    }

    const { data, error } = await query.limit(20);

    if (error) throw new Error(error.message);

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
