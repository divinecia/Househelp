import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get all trainings
router.get("/", async (_req: Request, res: Response) => {
  try {
    const { data: trainings, error } = await supabase
      .from("trainings")
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      data: trainings || []
    });
  } catch (error) {
    console.error("Get trainings error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get trainings"
    });
  }
});

// Get training by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: training, error } = await supabase
      .from("trainings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!training) {
      return res.status(404).json({
        success: false,
        error: "Training not found"
      });
    }

    return res.json({
      success: true,
      data: training
    });
  } catch (error) {
    console.error("Get training error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get training"
    });
  }
});

// Create training (admin only)
router.post("/", async (req: Request, res: Response) => {
  try {
    const role = (req as any).userProfile?.role;
    if (role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const trainingData = req.body;

    const { data: training, error } = await (supabase as any)
      .from("trainings")
      .insert({
        ...trainingData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      data: training,
      message: "Training created successfully"
    });
  } catch (error) {
    console.error("Create training error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create training"
    });
  }
});

// Update training
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const role = (req as any).userProfile?.role;
    if (role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { id } = req.params;
    const updateData = req.body;

    const { data: training, error } = await (supabase as any)
      .from("trainings")
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      data: training,
      message: "Training updated successfully"
    });
  } catch (error) {
    console.error("Update training error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update training"
    });
  }
});

// Delete training
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const role = (req as any).userProfile?.role;
    if (role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { id } = req.params;

    const { error } = await supabase
      .from("trainings")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      message: "Training deleted successfully"
    });
  } catch (error) {
    console.error("Delete training error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete training"
    });
  }
});

export default router;