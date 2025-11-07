import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get all services
router.get("/", async (req: Request, res: Response) => {
  try {
    const { active, limit = 50, offset = 0 } = req.query;
    let query = supabase.from("services").select("*");

    if (active) {
      query = query.eq("active", active === "true");
    }

    const { data, error, count } = await query
      .order("name", { ascending: true })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) throw new Error(error.message);

    return res.json({ success: true, data, total: count });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get single service
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("services").select("*").eq("id", id).single();

    if (error) throw new Error(error.message);

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Create service
router.post("/", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("services").insert([req.body]).select().single();

    if (error) throw new Error(error.message);

    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update service
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("services")
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

// Delete service
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) throw new Error(error.message);

    return res.json({ success: true, message: "Service deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
