import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { sendBookingConfirmation, sendWorkerAssignmentEmail } from "../services/email";
import { validateBookingData } from "../middleware/validation";

const router = Router();

// Get all bookings
router.get("/", async (req: Request, res: Response) => {
  try {
    const { homeownerID, homeowner_id, workerID, worker_id, status, limit = 50, offset = 0 } = req.query;
    let query = supabase.from("bookings").select("*");

    // Accept both camelCase and snake_case
    const homeownerId = homeownerID || homeowner_id;
    if (homeownerId) {
      query = query.eq("homeowner_id", homeownerId);
    }

    const workerId = workerID || worker_id;
    if (workerId) {
      query = query.eq("worker_id", workerId);
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

// Get single booking
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("bookings").select("*").eq("id", id).single();

    if (error) throw new Error(error.message);

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Create booking
router.post("/", validateBookingData, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("bookings").insert([req.body]).select().single();

    if (error) throw new Error(error.message);

    // Send confirmation email (we'll need to fetch email from user_profiles)
    // await sendBookingConfirmation(email, data.job_title, data.scheduled_date, data.id);

    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update booking
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("bookings")
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

// Assign worker to booking
router.put("/:id/assign-worker", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { worker_id } = req.body;

    const { data, error } = await supabase
      .from("bookings")
      .update({ worker_id, status: "accepted" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Send notification email to worker
    // await sendWorkerAssignmentEmail(worker_email, data.job_title, worker_name, data.scheduled_date);

    return res.json({ success: true, data, message: "Worker assigned successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Complete booking
router.put("/:id/complete", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "completed", rating, review, completed_date: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return res.json({ success: true, data, message: "Booking completed successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel booking
router.put("/:id/cancel", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return res.json({ success: true, data, message: "Booking cancelled successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Delete booking
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("bookings").delete().eq("id", id);

    if (error) throw new Error(error.message);

    return res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
