import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get all homeowners
router.get("/", async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const { data, error, count } = await supabase
      .from("homeowners")
      .select("*")
      .order("created_at", { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) throw new Error(error.message);

    return res.json({ success: true, data, total: count });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get single homeowner
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("homeowners").select("*").eq("id", id).single();

    if (error) throw new Error(error.message);

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Create homeowner
router.post("/", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("homeowners").insert([req.body]).select().single();

    if (error) throw new Error(error.message);

    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update homeowner
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("homeowners")
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

// Delete homeowner
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("homeowners").delete().eq("id", id);

    if (error) throw new Error(error.message);

    return res.json({ success: true, message: "Homeowner deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
