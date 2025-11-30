import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get worker availability
router.get("/worker/:worker_id", async (req: Request, res: Response) => {
  try {
    const { worker_id } = req.params;
    const { start_date, end_date, availability_type } = req.query;

    let query = supabase
      .from("worker_availability")
      .select("*")
      .eq("worker_id", worker_id)
      .order("available_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (start_date) {
      query = query.gte("available_date", start_date);
    }

    if (end_date) {
      query = query.lte("available_date", end_date);
    }

    if (availability_type) {
      query = query.eq("availability_type", availability_type);
    }

    const { data: availability, error } = await query;

    if (error) {
      console.error("Error fetching availability:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch availability",
      });
    }

    res.json({
      success: true,
      data: availability,
      total: availability?.length || 0,
    });
  } catch (error: any) {
    console.error("Error in GET /availability/worker/:worker_id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Get single availability slot
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: availability, error } = await supabase
      .from("worker_availability")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching availability:", error);
      return res.status(404).json({
        success: false,
        error: "Availability slot not found",
      });
    }

    res.json({
      success: true,
      data: availability,
    });
  } catch (error: any) {
    console.error("Error in GET /availability/:id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Check availability for a specific date/time
router.post("/check", async (req: Request, res: Response) => {
  try {
    const { worker_id, available_date, start_time, end_time } = req.body;

    if (!worker_id || !available_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        error: "worker_id, available_date, start_time, and end_time are required",
      });
    }

    // Check if there's any overlapping availability
    const { data: conflicts, error } = await supabase
      .from("worker_availability")
      .select("*")
      .eq("worker_id", worker_id)
      .eq("available_date", available_date)
      .or(`and(start_time.lte.${start_time},end_time.gt.${start_time}),and(start_time.lt.${end_time},end_time.gte.${end_time}),and(start_time.gte.${start_time},end_time.lte.${end_time})`);

    if (error) {
      console.error("Error checking availability:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to check availability",
      });
    }

    // Check for booked or unavailable slots
    const isUnavailable = conflicts?.some(
      (slot: any) => slot.availability_type === "booked" || slot.availability_type === "unavailable"
    );

    res.json({
      success: true,
      data: {
        is_available: !isUnavailable,
        conflicts: conflicts || [],
      },
    });
  } catch (error: any) {
    console.error("Error in POST /availability/check:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Create availability slot
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      worker_id,
      available_date,
      start_time,
      end_time,
      availability_type,
      is_recurring,
      recurrence_pattern,
      recurrence_end_date,
      notes,
    } = req.body;

    // Validate required fields
    if (!worker_id || !available_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        error: "worker_id, available_date, start_time, and end_time are required",
      });
    }

    // Validate availability_type
    const validTypes = ["available", "unavailable", "booked"];
    if (availability_type && !validTypes.includes(availability_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid availability_type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Validate time format (HH:MM:SS)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return res.status(400).json({
        success: false,
        error: "Invalid time format. Use HH:MM:SS format",
      });
    }

    // Ensure end_time is after start_time
    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        error: "end_time must be after start_time",
      });
    }

    // Check if worker exists
    const { data: worker, error: workerError } = await supabase
      .from("workers")
      .select("id")
      .eq("id", worker_id)
      .single();

    if (workerError || !worker) {
      return res.status(404).json({
        success: false,
        error: "Worker not found",
      });
    }

    // Create availability slot
    const { data: availability, error } = await supabase
      .from("worker_availability")
      .insert([
        {
          worker_id,
          available_date,
          start_time,
          end_time,
          availability_type: availability_type || "available",
          is_recurring: is_recurring || false,
          recurrence_pattern,
          recurrence_end_date,
          notes,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating availability:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create availability",
      });
    }

    res.status(201).json({
      success: true,
      data: availability,
      message: "Availability slot created successfully",
    });
  } catch (error: any) {
    console.error("Error in POST /availability:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Update availability slot
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      available_date,
      start_time,
      end_time,
      availability_type,
      is_recurring,
      recurrence_pattern,
      recurrence_end_date,
      notes,
    } = req.body;

    const updateData: any = {};

    if (available_date) {
      updateData.available_date = available_date;
    }

    if (start_time) {
      updateData.start_time = start_time;
    }

    if (end_time) {
      updateData.end_time = end_time;
    }

    if (availability_type) {
      const validTypes = ["available", "unavailable", "booked"];
      if (!validTypes.includes(availability_type)) {
        return res.status(400).json({
          success: false,
          error: `Invalid availability_type. Must be one of: ${validTypes.join(", ")}`,
        });
      }
      updateData.availability_type = availability_type;
    }

    if (is_recurring !== undefined) {
      updateData.is_recurring = is_recurring;
    }

    if (recurrence_pattern) {
      updateData.recurrence_pattern = recurrence_pattern;
    }

    if (recurrence_end_date) {
      updateData.recurrence_end_date = recurrence_end_date;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data: availability, error } = await supabase
      .from("worker_availability")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating availability:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update availability",
      });
    }

    res.json({
      success: true,
      data: availability,
      message: "Availability slot updated successfully",
    });
  } catch (error: any) {
    console.error("Error in PUT /availability/:id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Delete availability slot
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("worker_availability").delete().eq("id", id);

    if (error) {
      console.error("Error deleting availability:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete availability",
      });
    }

    res.json({
      success: true,
      message: "Availability slot deleted successfully",
    });
  } catch (error: any) {
    console.error("Error in DELETE /availability/:id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Bulk create availability slots (useful for setting weekly schedules)
router.post("/bulk", async (req: Request, res: Response) => {
  try {
    const { worker_id, slots } = req.body;

    if (!worker_id || !slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        error: "worker_id and slots array are required",
      });
    }

    // Validate each slot
    const validatedSlots = slots.map((slot: any) => ({
      worker_id,
      available_date: slot.available_date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      availability_type: slot.availability_type || "available",
      is_recurring: slot.is_recurring || false,
      recurrence_pattern: slot.recurrence_pattern,
      recurrence_end_date: slot.recurrence_end_date,
      notes: slot.notes,
    }));

    const { data: availability, error } = await supabase
      .from("worker_availability")
      .insert(validatedSlots)
      .select();

    if (error) {
      console.error("Error creating bulk availability:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create availability slots",
      });
    }

    res.status(201).json({
      success: true,
      data: availability,
      message: `${availability?.length || 0} availability slots created successfully`,
    });
  } catch (error: any) {
    console.error("Error in POST /availability/bulk:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

export default router;
