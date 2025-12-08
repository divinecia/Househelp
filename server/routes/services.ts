import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get all services
router.get("/", async (_req: Request, res: Response) => {
  try {
    const { data: services, error } = await supabase
      .from("services")
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      data: services || [],
    });
  } catch (error) {
    console.error("Get services error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get services",
    });
  }
});

// Get service by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: service, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    return res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Get service error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get service",
    });
  }
});

// Create service (admin only)
router.post("/", async (req: Request, res: Response) => {
  try {
    const role = (req as unknown as { userProfile: Record<string, unknown> }).userProfile?.role;
    if (role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const serviceData = req.body;

    const { data: service, error } = await supabase
      .from("services")
      .insert({
        ...serviceData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      data: service,
      message: "Service created successfully",
    });
  } catch (error) {
    console.error("Create service error:", error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create service",
    });
  }
});

// Update service
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const role = (req as unknown as { userProfile: Record<string, unknown> }).userProfile?.role;
    if (role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { id } = req.params;
    const updateData = req.body;

    const { data: service, error } = await supabase
      .from("services")
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
      data: service,
      message: "Service updated successfully",
    });
  } catch (error) {
    console.error("Update service error:", error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update service",
    });
  }
});

// Delete service
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const role = (req as unknown as { userProfile: Record<string, unknown> }).userProfile?.role;
    if (role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { id } = req.params;

    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete service",
    });
  }
});

export default router;
