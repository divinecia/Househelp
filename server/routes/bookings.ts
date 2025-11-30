import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { sendBookingConfirmation, sendWorkerAssignmentEmail, sendEmail } from "../services/email";
import { validateBookingData } from "../middleware/validation";
import { verifyToken, requireRole } from "../middleware/auth";

const router = Router();

// ============================================================================
// GET ALL BOOKINGS - With advanced filtering
// ============================================================================
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      homeownerID,
      homeowner_id,
      workerID,
      worker_id,
      status,
      payment_status,
      service_id,
      booking_date,
      start_date,
      end_date,
      is_recurring,
      limit = 50,
      offset = 0,
    } = req.query;

    let query = supabase
      .from("bookings")
      .select(`
        *,
        homeowner:homeowners(id, full_name, email, contact_number, address, city),
        worker:workers(id, full_name, email, contact_number, rating, skills),
        service:services(id, name, description)
      `);

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

    if (payment_status) {
      query = query.eq("payment_status", payment_status);
    }

    if (service_id) {
      query = query.eq("service_id", service_id);
    }

    if (booking_date) {
      query = query.eq("booking_date", booking_date);
    }

    if (start_date) {
      query = query.gte("booking_date", start_date);
    }

    if (end_date) {
      query = query.lte("booking_date", end_date);
    }

    if (is_recurring !== undefined) {
      query = query.eq("is_recurring", is_recurring === "true");
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(
        parseInt(offset as string),
        parseInt(offset as string) + parseInt(limit as string) - 1
      );

    if (error) throw new Error(error.message);

    return res.json({ success: true, data, total: count });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET SINGLE BOOKING - With full details
// ============================================================================
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        homeowner:homeowners(id, full_name, email, contact_number, address, city, rating),
        worker:workers(id, full_name, email, contact_number, rating, skills, hourly_rate),
        service:services(id, name, description),
        payments:payments(id, amount, status, payment_method, created_at),
        applications:applications(id, worker_id, status, proposed_rate, created_at)
      `)
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    if (!data) return res.status(404).json({ success: false, error: "Booking not found" });

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching booking:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// CREATE BOOKING - With notification and activity log
// ============================================================================
router.post("/", validateBookingData, async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;

    // Calculate duration if not provided
    if (!bookingData.duration_hours && bookingData.start_time && bookingData.end_time) {
      const start = new Date(`1970-01-01T${bookingData.start_time}`);
      const end = new Date(`1970-01-01T${bookingData.end_time}`);
      bookingData.duration_hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }

    // Insert booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select(`
        *,
        homeowner:homeowners(id, full_name, email),
        service:services(id, name, description)
      `)
      .single();

    if (bookingError) throw new Error(bookingError.message);

    // Create notification for homeowner
    const { error: notifError } = await supabase.from("notifications").insert([
      {
        user_id: booking.homeowner_id,
        type: "booking",
        title: "Booking Created",
        message: `Your booking for ${booking.service.name} on ${booking.booking_date} has been created successfully.`,
        related_id: booking.id,
        related_type: "booking",
        priority: "normal",
      },
    ]);

    if (notifError) console.error("Error creating notification:", notifError);

    // Send confirmation email
    try {
      await sendBookingConfirmation(
        booking.homeowner.email,
        booking.service.name,
        booking.booking_date,
        booking.id
      );
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    // Log activity
    try {
      await supabase.rpc("log_activity", {
        p_user_id: booking.homeowner_id,
        p_action: "create",
        p_entity_type: "booking",
        p_entity_id: booking.id,
        p_description: `Created booking for ${booking.service.name}`,
        p_changes: { booking_data: bookingData },
      });
    } catch (logError) {
      console.error("Error logging activity:", logError);
    }

    return res.status(201).json({ success: true, data: booking });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// UPDATE BOOKING - With validation
// ============================================================================
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get existing booking
    const { data: existingBooking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    if (!existingBooking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["assigned", "cancelled"],
      assigned: ["in_progress", "cancelled"],
      in_progress: ["completed", "cancelled"],
      completed: ["disputed"],
      cancelled: [],
      disputed: ["resolved"],
    };

    if (
      updates.status &&
      updates.status !== existingBooking.status &&
      !validTransitions[existingBooking.status]?.includes(updates.status)
    ) {
      return res.status(400).json({
        success: false,
        error: `Invalid status transition from ${existingBooking.status} to ${updates.status}`,
      });
    }

    // Update timestamp fields based on status
    if (updates.status) {
      if (updates.status === "confirmed") updates.confirmed_at = new Date().toISOString();
      if (updates.status === "in_progress") updates.started_at = new Date().toISOString();
      if (updates.status === "completed") updates.completed_at = new Date().toISOString();
      if (updates.status === "cancelled") updates.cancelled_at = new Date().toISOString();
    }

    // Perform update
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        homeowner:homeowners(id, full_name, email),
        worker:workers(id, full_name, email),
        service:services(id, name)
      `)
      .single();

    if (updateError) throw new Error(updateError.message);

    // Send notifications based on status change
    if (updates.status && updates.status !== existingBooking.status) {
      // Notify homeowner
      await supabase.from("notifications").insert([
        {
          user_id: updatedBooking.homeowner_id,
          type: "booking",
          title: "Booking Status Updated",
          message: `Your booking status has been updated to ${updates.status}`,
          related_id: updatedBooking.id,
          related_type: "booking",
          priority: "normal",
        },
      ]);

      // Notify worker if assigned
      if (updatedBooking.worker_id) {
        await supabase.from("notifications").insert([
          {
            user_id: updatedBooking.worker_id,
            type: "booking",
            title: "Booking Status Updated",
            message: `Booking status has been updated to ${updates.status}`,
            related_id: updatedBooking.id,
            related_type: "booking",
            priority: "normal",
          },
        ]);
      }
    }

    return res.json({ success: true, data: updatedBooking });
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ASSIGN WORKER TO BOOKING
// ============================================================================
router.put("/:id/assign-worker", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { worker_id } = req.body;

    if (!worker_id) {
      return res.status(400).json({ success: false, error: "worker_id is required" });
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (bookingError) throw new Error(bookingError.message);
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    // Check worker exists and is available
    const { data: worker, error: workerError } = await supabase
      .from("workers")
      .select("*")
      .eq("id", worker_id)
      .single();

    if (workerError || !worker) {
      return res.status(404).json({ success: false, error: "Worker not found" });
    }

    if (worker.availability_status !== "available") {
      return res.status(400).json({
        success: false,
        error: "Worker is not available",
      });
    }

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        worker_id,
        status: "assigned",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        *,
        homeowner:homeowners(id, full_name, email),
        worker:workers(id, full_name, email),
        service:services(id, name)
      `)
      .single();

    if (updateError) throw new Error(updateError.message);

    // Send notification to worker
    await supabase.from("notifications").insert([
      {
        user_id: worker_id,
        type: "booking",
        title: "New Job Assignment",
        message: `You have been assigned to a new booking for ${updatedBooking.service.name}`,
        related_id: id,
        related_type: "booking",
        priority: "high",
      },
    ]);

    // Send notification to homeowner
    await supabase.from("notifications").insert([
      {
        user_id: booking.homeowner_id,
        type: "booking",
        title: "Worker Assigned",
        message: `${worker.full_name} has been assigned to your booking`,
        related_id: id,
        related_type: "booking",
        priority: "normal",
      },
    ]);

    // Send email notification to worker
    try {
      await sendWorkerAssignmentEmail(
        worker.email,
        updatedBooking.service.name,
        worker.full_name,
        booking.booking_date
      );
    } catch (emailError) {
      console.error("Error sending worker assignment email:", emailError);
    }

    return res.json({
      success: true,
      data: updatedBooking,
      message: "Worker assigned successfully",
    });
  } catch (error: any) {
    console.error("Error assigning worker:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// START BOOKING
// ============================================================================
router.put("/:id/start", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("bookings")
      .update({
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Notify homeowner
    await supabase.from("notifications").insert([
      {
        user_id: data.homeowner_id,
        type: "booking",
        title: "Booking Started",
        message: "Your booking has been started",
        related_id: id,
        related_type: "booking",
        priority: "normal",
      },
    ]);

    return res.json({
      success: true,
      data,
      message: "Booking started successfully",
    });
  } catch (error: any) {
    console.error("Error starting booking:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// COMPLETE BOOKING
// ============================================================================
router.put("/:id/complete", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get booking details
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    // Update booking status
    const { data: completedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        *,
        homeowner:homeowners(email),
        worker:workers(email, full_name)
      `)
      .single();

    if (updateError) throw new Error(updateError.message);

    // Notify both parties
    await supabase.from("notifications").insert([
      {
        user_id: booking.homeowner_id,
        type: "booking",
        title: "Booking Completed",
        message: "Your booking has been completed. Please leave a review!",
        related_id: id,
        related_type: "booking",
        priority: "normal",
      },
      {
        user_id: booking.worker_id,
        type: "booking",
        title: "Booking Completed",
        message: "You have completed a booking. Payment will be processed shortly.",
        related_id: id,
        related_type: "booking",
        priority: "normal",
      },
    ]);

    // Send email notifications
    try {
      await sendEmail(
        completedBooking.homeowner.email,
        "Booking Completed",
        `Your booking has been completed. Please take a moment to review ${completedBooking.worker.full_name}.`
      );
    } catch (emailError) {
      console.error("Error sending completion email:", emailError);
    }

    return res.json({
      success: true,
      data: completedBooking,
      message: "Booking completed successfully",
    });
  } catch (error: any) {
    console.error("Error completing booking:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// CANCEL BOOKING
// ============================================================================
router.put("/:id/cancel", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cancellation_reason, cancelled_by } = req.body;

    // Get booking details
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*, homeowner:homeowners(email), worker:workers(email, full_name)")
      .eq("id", id)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    // Check if booking can be cancelled
    if (["completed", "cancelled"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel a ${booking.status} booking`,
      });
    }

    // Update booking
    const { data: cancelledBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_reason,
        cancelled_by,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    // Notify both parties
    const notifications = [
      {
        user_id: booking.homeowner_id,
        type: "booking",
        title: "Booking Cancelled",
        message: `Booking has been cancelled. Reason: ${cancellation_reason || "No reason provided"}`,
        related_id: id,
        related_type: "booking",
        priority: "high",
      },
    ];

    if (booking.worker_id) {
      notifications.push({
        user_id: booking.worker_id,
        type: "booking",
        title: "Booking Cancelled",
        message: `A booking has been cancelled. Reason: ${cancellation_reason || "No reason provided"}`,
        related_id: id,
        related_type: "booking",
        priority: "high",
      });
    }

    await supabase.from("notifications").insert(notifications);

    return res.json({
      success: true,
      data: cancelledBooking,
      message: "Booking cancelled successfully",
    });
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// DELETE BOOKING
// ============================================================================
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if booking exists and can be deleted
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("status")
      .eq("id", id)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    // Only allow deletion of pending or cancelled bookings
    if (!["pending", "cancelled"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: "Only pending or cancelled bookings can be deleted",
      });
    }

    const { error } = await supabase.from("bookings").delete().eq("id", id);

    if (error) throw new Error(error.message);

    return res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET BOOKING STATISTICS
// ============================================================================
router.get("/stats/summary", async (req: Request, res: Response) => {
  try {
    const { homeowner_id, worker_id, start_date, end_date } = req.query;

    let query = supabase.from("bookings").select("status, payment_status, total_amount");

    if (homeowner_id) query = query.eq("homeowner_id", homeowner_id);
    if (worker_id) query = query.eq("worker_id", worker_id);
    if (start_date) query = query.gte("booking_date", start_date);
    if (end_date) query = query.lte("booking_date", end_date);

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    // Calculate statistics
    const stats = {
      total_bookings: data.length,
      by_status: {} as Record<string, number>,
      by_payment_status: {} as Record<string, number>,
      total_revenue: 0,
      average_booking_value: 0,
    };

    data.forEach((booking) => {
      // Count by status
      stats.by_status[booking.status] = (stats.by_status[booking.status] || 0) + 1;

      // Count by payment status
      stats.by_payment_status[booking.payment_status] =
        (stats.by_payment_status[booking.payment_status] || 0) + 1;

      // Sum revenue
      if (booking.total_amount) {
        stats.total_revenue += parseFloat(booking.total_amount);
      }
    });

    stats.average_booking_value = stats.total_bookings > 0 ? stats.total_revenue / stats.total_bookings : 0;

    return res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error("Error fetching booking statistics:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
