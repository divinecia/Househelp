import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get all applications (with filters)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { booking_id, worker_id, status } = req.query;

    let query = supabase
      .from("applications")
      .select(`
        *,
        booking:bookings(
          id,
          booking_date,
          start_time,
          end_time,
          service_address,
          status,
          total_amount,
          homeowner:homeowners(
            id,
            first_name,
            last_name,
            email
          ),
          service:services(
            id,
            name,
            category
          )
        ),
        worker:workers(
          id,
          first_name,
          last_name,
          email,
          phone,
          rating,
          hourly_rate
        )
      `)
      .order("created_at", { ascending: false });

    if (booking_id) {
      query = query.eq("booking_id", booking_id);
    }

    if (worker_id) {
      query = query.eq("worker_id", worker_id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error("Error fetching applications:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch applications",
      });
    }

    res.json({
      success: true,
      data: applications,
      total: applications?.length || 0,
    });
  } catch (error: any) {
    console.error("Error in GET /applications:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Get applications for a specific booking
router.get("/booking/:booking_id", async (req: Request, res: Response) => {
  try {
    const { booking_id } = req.params;

    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        *,
        worker:workers(
          id,
          first_name,
          last_name,
          email,
          phone,
          rating,
          hourly_rate,
          total_reviews,
          skills,
          experience_years
        )
      `)
      .eq("booking_id", booking_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching booking applications:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch applications",
      });
    }

    res.json({
      success: true,
      data: applications,
      total: applications?.length || 0,
    });
  } catch (error: any) {
    console.error("Error in GET /applications/booking/:booking_id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Get applications by worker
router.get("/worker/:worker_id", async (req: Request, res: Response) => {
  try {
    const { worker_id } = req.params;

    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        *,
        booking:bookings(
          id,
          booking_date,
          start_time,
          end_time,
          service_address,
          status,
          total_amount,
          homeowner:homeowners(
            id,
            first_name,
            last_name,
            email
          ),
          service:services(
            id,
            name,
            category
          )
        )
      `)
      .eq("worker_id", worker_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching worker applications:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch applications",
      });
    }

    res.json({
      success: true,
      data: applications,
      total: applications?.length || 0,
    });
  } catch (error: any) {
    console.error("Error in GET /applications/worker/:worker_id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Get single application
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: application, error } = await supabase
      .from("applications")
      .select(`
        *,
        booking:bookings(
          id,
          booking_date,
          start_time,
          end_time,
          service_address,
          status,
          total_amount,
          homeowner:homeowners(
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          service:services(
            id,
            name,
            category
          )
        ),
        worker:workers(
          id,
          first_name,
          last_name,
          email,
          phone,
          rating,
          hourly_rate,
          skills,
          experience_years
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching application:", error);
      return res.status(404).json({
        success: false,
        error: "Application not found",
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error: any) {
    console.error("Error in GET /applications/:id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Create new application
router.post("/", async (req: Request, res: Response) => {
  try {
    const { booking_id, worker_id, cover_letter, proposed_rate, availability_notes } = req.body;

    // Validate required fields
    if (!booking_id || !worker_id) {
      return res.status(400).json({
        success: false,
        error: "booking_id and worker_id are required",
      });
    }

    // Check if booking exists and is still open for applications
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, status, worker_id")
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Check if booking is in a state that accepts applications
    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot apply to booking with status: ${booking.status}`,
      });
    }

    // Check if worker has already applied
    const { data: existingApplication } = await supabase
      .from("applications")
      .select("id")
      .eq("booking_id", booking_id)
      .eq("worker_id", worker_id)
      .single();

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: "You have already applied to this booking",
      });
    }

    // Create application
    const { data: application, error } = await supabase
      .from("applications")
      .insert([
        {
          booking_id,
          worker_id,
          cover_letter,
          proposed_rate,
          availability_notes,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating application:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create application",
      });
    }

    // Get worker and homeowner details for notification
    const { data: worker } = await supabase
      .from("workers")
      .select("first_name, last_name")
      .eq("id", worker_id)
      .single();

    const { data: bookingDetails } = await supabase
      .from("bookings")
      .select("homeowner_id")
      .eq("id", booking_id)
      .single();

    // Create notification for homeowner
    if (bookingDetails?.homeowner_id) {
      await supabase.from("notifications").insert([
        {
          user_id: bookingDetails.homeowner_id,
          type: "booking",
          title: "New Application Received",
          message: `${worker?.first_name} ${worker?.last_name} has applied to your booking`,
          related_id: booking_id,
          related_type: "booking",
          priority: "normal",
        },
      ]);
    }

    res.status(201).json({
      success: true,
      data: application,
      message: "Application submitted successfully",
    });
  } catch (error: any) {
    console.error("Error in POST /applications:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Accept application (homeowner)
router.put("/:id/accept", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get application details
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("*, booking:bookings(id, status, homeowner_id)")
      .eq("id", id)
      .single();

    if (appError || !application) {
      return res.status(404).json({
        success: false,
        error: "Application not found",
      });
    }

    // Check if booking is still available
    if (!["pending", "confirmed"].includes(application.booking.status)) {
      return res.status(400).json({
        success: false,
        error: "Booking is no longer available for applications",
      });
    }

    // Update application status
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        status: "accepted",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error accepting application:", updateError);
      return res.status(500).json({
        success: false,
        error: "Failed to accept application",
      });
    }

    // Assign worker to booking
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({
        worker_id: application.worker_id,
        status: "assigned",
      })
      .eq("id", application.booking_id);

    if (bookingError) {
      console.error("Error assigning worker to booking:", bookingError);
    }

    // Reject all other applications for this booking
    await supabase
      .from("applications")
      .update({
        status: "rejected",
        rejection_reason: "Another worker was selected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("booking_id", application.booking_id)
      .neq("id", id);

    // Notify worker
    await supabase.from("notifications").insert([
      {
        user_id: application.worker_id,
        type: "booking",
        title: "Application Accepted",
        message: "Your application has been accepted! Check your bookings.",
        related_id: application.booking_id,
        related_type: "booking",
        priority: "high",
      },
    ]);

    res.json({
      success: true,
      message: "Application accepted and worker assigned",
    });
  } catch (error: any) {
    console.error("Error in PUT /applications/:id/accept:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Reject application (homeowner)
router.put("/:id/reject", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    // Get application details
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("worker_id, booking_id")
      .eq("id", id)
      .single();

    if (appError || !application) {
      return res.status(404).json({
        success: false,
        error: "Application not found",
      });
    }

    // Update application status
    const { error } = await supabase
      .from("applications")
      .update({
        status: "rejected",
        rejection_reason: rejection_reason || "Not selected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error rejecting application:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to reject application",
      });
    }

    // Notify worker
    await supabase.from("notifications").insert([
      {
        user_id: application.worker_id,
        type: "booking",
        title: "Application Status Update",
        message: "Your application was not selected for this booking",
        related_id: application.booking_id,
        related_type: "booking",
        priority: "normal",
      },
    ]);

    res.json({
      success: true,
      message: "Application rejected",
    });
  } catch (error: any) {
    console.error("Error in PUT /applications/:id/reject:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Withdraw application (worker)
router.put("/:id/withdraw", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("applications")
      .update({
        status: "withdrawn",
      })
      .eq("id", id);

    if (error) {
      console.error("Error withdrawing application:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to withdraw application",
      });
    }

    res.json({
      success: true,
      message: "Application withdrawn successfully",
    });
  } catch (error: any) {
    console.error("Error in PUT /applications/:id/withdraw:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Delete application
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if application can be deleted (only pending applications)
    const { data: application, error: checkError } = await supabase
      .from("applications")
      .select("status")
      .eq("id", id)
      .single();

    if (checkError || !application) {
      return res.status(404).json({
        success: false,
        error: "Application not found",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Only pending applications can be deleted",
      });
    }

    const { error } = await supabase.from("applications").delete().eq("id", id);

    if (error) {
      console.error("Error deleting application:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete application",
      });
    }

    res.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error: any) {
    console.error("Error in DELETE /applications/:id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

export default router;
