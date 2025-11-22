import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get all services with worker counts
router.get("/", async (req: Request, res: Response) => {
  try {
    const { active, limit = 50, offset = 0 } = req.query;

    // Get services from database if table exists, otherwise return hardcoded services with worker counts
    let services = [];

    try {
      let query = supabase.from("services").select("*");

      if (active) {
        query = query.eq("active", active === "true");
      }

      const { data: servicesData, error: servicesError } = await query
        .order("name", { ascending: true })
        .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

      if (!servicesError && servicesData) {
        services = servicesData;
      }
    } catch (err) {
      // Services table doesn't exist, use hardcoded services
    }

    // If no services from database, use hardcoded ones
    if (services.length === 0) {
      services = [
        { id: "cooking", name: "Cooking", active: true },
        { id: "washing", name: "Washing", active: true },
        { id: "cleaning", name: "Cleaning", active: true },
        { id: "gardening", name: "Gardening", active: true },
        { id: "elderlycare", name: "Elderly Care", active: true },
        { id: "petcare", name: "Pet Care", active: true },
        { id: "childcare", name: "Child Care", active: true },
        { id: "laundry", name: "Laundry & Ironing", active: true },
      ];
    }

    // Get worker counts for each service
    const servicesWithCounts = await Promise.all(
      services.map(async (service: any) => {
        try {
          // Count workers with this type of work
          const { count, error: countError } = await supabase
            .from("workers")
            .select("*", { count: "exact", head: true })
            .eq("type_of_work", service.name)
            .eq("status", "active");

          return {
            ...service,
            workers: countError ? 0 : (count || 0),
          };
        } catch (err) {
          return {
            ...service,
            workers: 0,
          };
        }
      })
    );

    return res.json({
      success: true,
      data: servicesWithCounts,
      total: servicesWithCounts.length
    });
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
