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
    const { data, error } = await supabase
      .from("workers")
      .update(req.body)
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
      query = query.or(`typeOfWork.ilike.%${skill}%,languageProficiency.ilike.%${skill}%`);
    }

    const { data, error } = await query.limit(20);

    if (error) throw new Error(error.message);

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
