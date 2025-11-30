import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get all favorites for a homeowner
router.get("/:homeowner_id", async (req: Request, res: Response) => {
  try {
    const { homeowner_id } = req.params;

    const { data: favorites, error } = await supabase
      .from("favorites")
      .select(`
        *,
        worker:workers(
          id,
          first_name,
          last_name,
          email,
          phone,
          rating,
          total_reviews,
          hourly_rate,
          experience_years,
          skills,
          bio,
          profile_picture_url,
          city,
          district,
          availability_status
        )
      `)
      .eq("homeowner_id", homeowner_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching favorites:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch favorites",
      });
    }

    res.json({
      success: true,
      data: favorites,
      total: favorites?.length || 0,
    });
  } catch (error: any) {
    console.error("Error in GET /favorites/:homeowner_id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Check if a worker is favorited by a homeowner
router.get("/check/:homeowner_id/:worker_id", async (req: Request, res: Response) => {
  try {
    const { homeowner_id, worker_id } = req.params;

    const { data: favorite, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("homeowner_id", homeowner_id)
      .eq("worker_id", worker_id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking favorite:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to check favorite status",
      });
    }

    res.json({
      success: true,
      data: {
        is_favorited: !!favorite,
        favorite_id: favorite?.id || null,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /favorites/check:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Add a worker to favorites
router.post("/", async (req: Request, res: Response) => {
  try {
    const { homeowner_id, worker_id, notes } = req.body;

    // Validate required fields
    if (!homeowner_id || !worker_id) {
      return res.status(400).json({
        success: false,
        error: "homeowner_id and worker_id are required",
      });
    }

    // Check if worker exists
    const { data: worker, error: workerError } = await supabase
      .from("workers")
      .select("id, first_name, last_name")
      .eq("id", worker_id)
      .single();

    if (workerError || !worker) {
      return res.status(404).json({
        success: false,
        error: "Worker not found",
      });
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("homeowner_id", homeowner_id)
      .eq("worker_id", worker_id)
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Worker already in favorites",
      });
    }

    // Add to favorites
    const { data: favorite, error } = await supabase
      .from("favorites")
      .insert([
        {
          homeowner_id,
          worker_id,
          notes: notes || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding favorite:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to add favorite",
      });
    }

    // Notify worker
    await supabase.from("notifications").insert([
      {
        user_id: worker_id,
        type: "system",
        title: "Added to Favorites",
        message: "A homeowner has added you to their favorites list!",
        priority: "normal",
      },
    ]);

    res.status(201).json({
      success: true,
      data: favorite,
      message: "Worker added to favorites successfully",
    });
  } catch (error: any) {
    console.error("Error in POST /favorites:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Update favorite notes
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const { data: favorite, error } = await supabase
      .from("favorites")
      .update({ notes })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating favorite:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update favorite",
      });
    }

    res.json({
      success: true,
      data: favorite,
      message: "Favorite updated successfully",
    });
  } catch (error: any) {
    console.error("Error in PUT /favorites/:id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Remove a worker from favorites
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("favorites").delete().eq("id", id);

    if (error) {
      console.error("Error removing favorite:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to remove favorite",
      });
    }

    res.json({
      success: true,
      message: "Worker removed from favorites successfully",
    });
  } catch (error: any) {
    console.error("Error in DELETE /favorites/:id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Remove by homeowner_id and worker_id
router.delete("/:homeowner_id/:worker_id", async (req: Request, res: Response) => {
  try {
    const { homeowner_id, worker_id } = req.params;

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("homeowner_id", homeowner_id)
      .eq("worker_id", worker_id);

    if (error) {
      console.error("Error removing favorite:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to remove favorite",
      });
    }

    res.json({
      success: true,
      message: "Worker removed from favorites successfully",
    });
  } catch (error: any) {
    console.error("Error in DELETE /favorites/:homeowner_id/:worker_id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

export default router;
