import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get all workers (admin only). Workers can fetch their own record.
router.get("/", async (req: Request, res: Response) => {
  try {
    const profile = (req as unknown as { userProfile: { role: string; user_id: string } }).userProfile;
    const role = profile?.role;

    if (role === "worker") {
      const { data, error } = await supabase
        .from("workers")
        .select("*")
        .eq("user_id", profile.user_id)
        .single();

      if (error) throw new Error(error.message);

      return res.json({ success: true, data: data ? [data] : [] });
    }

    if (role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { data: workers, error } = await supabase.from("workers").select("*");

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      data: workers || [],
    });
  } catch (error) {
    console.error("Get workers error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get workers",
    });
  }
});

// Get worker by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = (req as unknown as { userProfile: Record<string, unknown> }).userProfile;
    const role = profile?.role;

    const { data: worker, error } = await supabase
      .from("workers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!worker) {
      return res.status(404).json({
        success: false,
        error: "Worker not found",
      });
    }

    if (role === "worker" && (worker as { user_id: string }).user_id !== profile.user_id) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    if (role !== "admin" && role !== "worker") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    return res.json({
      success: true,
      data: worker,
    });
  } catch (error) {
    console.error("Get worker error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get worker",
    });
  }
});

// Update worker
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const profile = (req as unknown as { userProfile: Record<string, unknown> }).userProfile;
    const role = profile?.role;

    if (role === "worker") {
      const { data: record } = await supabase
        .from("workers")
        .select("user_id")
        .eq("id", id)
        .single();
      if (!record || (record as Record<string, unknown>).user_id !== profile.user_id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }
    } else if (role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { data: worker, error } = await supabase
      .from("workers")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      data: worker,
      message: "Worker updated successfully",
    });
  } catch (error) {
    console.error("Update worker error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update worker",
    });
  }
});

// Delete worker
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = (req as unknown as { userProfile: Record<string, unknown> }).userProfile;
    const role = profile?.role;

    if (role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { error } = await supabase.from("workers").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      message: "Worker deleted successfully",
    });
  } catch (error) {
    console.error("Delete worker error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete worker",
    });
  }
});

export default router;
