import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get all trainings
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, status, limit = 50, offset = 0 } = req.query;
    let query = supabase.from("trainings").select("*");

    if (category) {
      query = query.eq("category", category);
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

// Get single training
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("trainings").select("*").eq("id", id).single();

    if (error) throw new Error(error.message);

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Create training
router.post("/", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("trainings").insert([req.body]).select().single();

    if (error) throw new Error(error.message);

    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update training
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("trainings")
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

// Delete training
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("trainings").delete().eq("id", id);

    if (error) throw new Error(error.message);

    return res.json({ success: true, message: "Training deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Enroll worker in training
router.post("/:id/enroll", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { worker_id } = req.body;

    const { data, error } = await supabase
      .from("worker_trainings")
      .insert([{ training_id: id, worker_id, status: "enrolled" }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return res.status(201).json({ success: true, data, message: "Worker enrolled successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get worker's trainings
router.get("/worker/:worker_id", async (req: Request, res: Response) => {
  try {
    const { worker_id } = req.params;
    const { data, error } = await supabase
      .from("worker_trainings")
      .select("*, trainings(*)")
      .eq("worker_id", worker_id);

    if (error) throw new Error(error.message);

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update training progress
router.put("/progress/:enrollment_id", async (req: Request, res: Response) => {
  try {
    const { enrollment_id } = req.params;
    const { progress_percentage, status } = req.body;

    const { data, error } = await supabase
      .from("worker_trainings")
      .update({ progress_percentage, status })
      .eq("id", enrollment_id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
