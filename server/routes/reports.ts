import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import type { Database } from "../../shared/types";

const router = Router();

type ReportUpdate = Database['public']['Tables']['reports']['Update'];

// Get all reports
router.get("/", async (_req: Request, res: Response) => {
  try {
    const { data: reports, error } = await supabase
      .from("reports")
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      data: reports || []
    });
  } catch (error) {
    console.error("Get reports error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get reports"
    });
  }
});

// Get report by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: report, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!report) {
      return res.status(404).json({
        success: false,
        error: "Report not found"
      });
    }

    return res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Get report error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get report"
    });
  }
});

// Create report
router.post("/", async (req: Request, res: Response) => {
  try {
    const reportData = req.body;

    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        ...reportData,
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
      data: report,
      message: "Report created successfully"
    });
  } catch (error) {
    console.error("Create report error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create report"
    });
  }
});

// Update report
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatePayload: ReportUpdate = {
      title: updateData.title,
      description: updateData.description,
      type: updateData.type,
      status: updateData.status,
      updated_at: new Date().toISOString()
    };

    const { data: report, error } = await (supabase as any)
      .from("reports")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      data: report,
      message: "Report updated successfully"
    });
  } catch (error) {
    console.error("Update report error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update report"
    });
  }
});

// Delete report
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return res.json({
      success: true,
      message: "Report deleted successfully"
    });
  } catch (error) {
    console.error("Delete report error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete report"
    });
  }
});

export default router;