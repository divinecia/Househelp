import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// ============================================================================
// GET ALL NOTIFICATIONS FOR A USER
// ============================================================================
router.get("/:user_id", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { is_read, type, priority, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_deleted", false);

    if (is_read !== undefined) {
      query = query.eq("is_read", is_read === "true");
    }

    if (type) {
      query = query.eq("type", type);
    }

    if (priority) {
      query = query.eq("priority", priority);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .range(
        parseInt(offset as string),
        parseInt(offset as string) + parseInt(limit as string) - 1
      );

    if (error) throw new Error(error.message);

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// CREATE NOTIFICATION
// ============================================================================
router.post("/", async (req: Request, res: Response) => {
  try {
    const notificationData = req.body;

    if (!notificationData.user_id || !notificationData.type || !notificationData.title || !notificationData.message) {
      return res.status(400).json({
        success: false,
        error: "user_id, type, title, and message are required",
      });
    }

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert([notificationData])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return res.status(201).json({ success: true, data: notification });
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// MARK NOTIFICATION AS READ
// ============================================================================
router.put("/:id/read", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: notification, error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return res.json({ success: true, data: notification });
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================================
router.put("/user/:user_id/read-all", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", user_id)
      .eq("is_read", false);

    if (error) throw new Error(error.message);

    return res.json({ success: true, message: "All notifications marked as read" });
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// DELETE NOTIFICATION (soft delete)
// ============================================================================
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("notifications")
      .update({ is_deleted: true })
      .eq("id", id);

    if (error) throw new Error(error.message);

    return res.json({ success: true, message: "Notification deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// DELETE ALL NOTIFICATIONS FOR A USER
// ============================================================================
router.delete("/user/:user_id/all", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const { error } = await supabase
      .from("notifications")
      .update({ is_deleted: true })
      .eq("user_id", user_id);

    if (error) throw new Error(error.message);

    return res.json({ success: true, message: "All notifications deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting all notifications:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET UNREAD NOTIFICATION COUNT
// ============================================================================
router.get("/user/:user_id/unread-count", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", user_id)
      .eq("is_read", false)
      .eq("is_deleted", false);

    if (error) throw new Error(error.message);

    return res.json({ success: true, count: data.length });
  } catch (error: any) {
    console.error("Error fetching unread count:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET NOTIFICATION PREFERENCES
// ============================================================================
router.get("/preferences/:user_id", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error && error.code === "PGRST116") {
      // Not found - create default preferences
      const { data: newPrefs, error: insertError } = await supabase
        .from("notification_preferences")
        .insert([{ user_id }])
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      return res.json({ success: true, data: newPrefs });
    }

    if (error) throw new Error(error.message);

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching notification preferences:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// UPDATE NOTIFICATION PREFERENCES
// ============================================================================
router.put("/preferences/:user_id", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const preferences = req.body;

    // Check if preferences exist
    const { data: existing } = await supabase
      .from("notification_preferences")
      .select("id")
      .eq("user_id", user_id)
      .single();

    let data, error;

    if (existing) {
      // Update existing
      const result = await supabase
        .from("notification_preferences")
        .update(preferences)
        .eq("user_id", user_id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Create new
      const result = await supabase
        .from("notification_preferences")
        .insert([{ user_id, ...preferences }])
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw new Error(error.message);

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error updating notification preferences:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
