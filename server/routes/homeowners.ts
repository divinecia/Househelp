import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get all homeowners (admin only). Homeowner sees only their record.
router.get("/", async (req: Request, res: Response) => {
  try {
    const profile = (req as unknown as { userProfile: { role: string; user_id: string } }).userProfile;
    const role = profile?.role;

    if (role === "homeowner") {
      const { data, error } = await supabase
        .from("homeowners")
        .select("*")
        .eq("user_id", profile.user_id)
        .single();

      if (error) throw new Error(error.message);

      return res.json({ success: true, data: data ? [data] : [] });
    }

    if (role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { data: homeowners, error } = await supabase
      .from("homeowners")
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      data: homeowners || [],
    });
  } catch (error) {
    console.error("Get homeowners error:", error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get homeowners",
    });
  }
});

// Get homeowner by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = (req as unknown as { userProfile: Record<string, unknown> }).userProfile;
    const role = profile?.role;

    const { data: homeowner, error } = await supabase
      .from("homeowners")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!homeowner) {
      return res.status(404).json({
        success: false,
        error: "Homeowner not found",
      });
    }

    if (role === "homeowner" && (homeowner as { user_id: string }).user_id !== profile.user_id) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    if (role !== "admin" && role !== "homeowner") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    return res.json({
      success: true,
      data: homeowner,
    });
  } catch (error) {
    console.error("Get homeowner error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get homeowner",
    });
  }
});

// Update homeowner
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const profile = (req as unknown as { userProfile: Record<string, unknown> }).userProfile;
    const role = profile?.role;

    if (role === "homeowner") {
      const { data: record } = await supabase
        .from("homeowners")
        .select("user_id")
        .eq("id", id)
        .single();
      if (!record || (record as Record<string, unknown>).user_id !== profile.user_id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }
    } else if (role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { data: homeowner, error } = await supabase
      .from("homeowners")
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
      data: homeowner,
      message: "Homeowner updated successfully",
    });
  } catch (error) {
    console.error("Update homeowner error:", error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update homeowner",
    });
  }
});

// Delete homeowner
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = (req as unknown as { userProfile: Record<string, unknown> }).userProfile;
    const role = profile?.role;

    if (role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { error } = await supabase.from("homeowners").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      message: "Homeowner deleted successfully",
    });
  } catch (error) {
    console.error("Delete homeowner error:", error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete homeowner",
    });
  }
});

export default router;
