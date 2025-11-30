import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get all disputes (with filters)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { booking_id, raised_by, status, priority, category } = req.query;

    let query = supabase
      .from("disputes")
      .select(`
        *,
        booking:bookings(
          id,
          booking_date,
          service_address,
          status,
          total_amount,
          homeowner:homeowners(
            id,
            first_name,
            last_name,
            email
          ),
          worker:workers(
            id,
            first_name,
            last_name,
            email
          ),
          service:services(
            id,
            name
          )
        ),
        payment:payments(
          id,
          amount,
          status,
          transaction_id
        ),
        raised_by_user:user_profiles!disputes_raised_by_fkey(
          id,
          email
        ),
        against_user:user_profiles!disputes_against_user_id_fkey(
          id,
          email
        ),
        assigned_admin:admins(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (booking_id) {
      query = query.eq("booking_id", booking_id);
    }

    if (raised_by) {
      query = query.eq("raised_by", raised_by);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (priority) {
      query = query.eq("priority", priority);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data: disputes, error } = await query;

    if (error) {
      console.error("Error fetching disputes:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch disputes",
      });
    }

    res.json({
      success: true,
      data: disputes,
      total: disputes?.length || 0,
    });
  } catch (error: any) {
    console.error("Error in GET /disputes:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Get single dispute
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: dispute, error } = await supabase
      .from("disputes")
      .select(`
        *,
        booking:bookings(
          id,
          booking_date,
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
          worker:workers(
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
        payment:payments(
          id,
          amount,
          status,
          transaction_id,
          payment_method
        ),
        raised_by_user:user_profiles!disputes_raised_by_fkey(
          id,
          email
        ),
        against_user:user_profiles!disputes_against_user_id_fkey(
          id,
          email
        ),
        assigned_admin:admins(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching dispute:", error);
      return res.status(404).json({
        success: false,
        error: "Dispute not found",
      });
    }

    res.json({
      success: true,
      data: dispute,
    });
  } catch (error: any) {
    console.error("Error in GET /disputes/:id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Create new dispute
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      booking_id,
      payment_id,
      raised_by,
      against_user_id,
      category,
      title,
      description,
      evidence_urls,
      priority,
    } = req.body;

    // Validate required fields
    if (!booking_id || !raised_by || !against_user_id || !category || !title || !description) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Validate category
    const validCategories = [
      "payment",
      "service_quality",
      "no_show",
      "cancellation",
      "safety",
      "other",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
      });
    }

    // Check if booking exists
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id")
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Create dispute
    const { data: dispute, error } = await supabase
      .from("disputes")
      .insert([
        {
          booking_id,
          payment_id,
          raised_by,
          against_user_id,
          category,
          title,
          description,
          evidence_urls: evidence_urls || [],
          status: "open",
          priority: priority || "normal",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating dispute:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create dispute",
      });
    }

    // Update booking status to disputed
    await supabase
      .from("bookings")
      .update({ status: "disputed" })
      .eq("id", booking_id);

    // Notify the other party
    await supabase.from("notifications").insert([
      {
        user_id: against_user_id,
        type: "system",
        title: "Dispute Raised",
        message: `A dispute has been raised regarding booking #${booking_id.slice(0, 8)}`,
        related_id: dispute.id,
        related_type: "dispute",
        priority: "high",
      },
    ]);

    // Log activity
    await supabase.rpc("log_activity", {
      p_user_id: raised_by,
      p_action: "create",
      p_entity_type: "dispute",
      p_entity_id: dispute.id,
      p_description: `Dispute created for booking ${booking_id}`,
    });

    res.status(201).json({
      success: true,
      data: dispute,
      message: "Dispute created successfully",
    });
  } catch (error: any) {
    console.error("Error in POST /disputes:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Update dispute
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority, resolution_notes } = req.body;

    const updateData: any = {};

    if (status) {
      const validStatuses = ["open", "investigating", "resolved", "closed", "escalated"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }
      updateData.status = status;
    }

    if (priority) {
      const validPriorities = ["low", "normal", "high", "critical"];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          error: `Invalid priority. Must be one of: ${validPriorities.join(", ")}`,
        });
      }
      updateData.priority = priority;
    }

    if (resolution_notes) {
      updateData.resolution_notes = resolution_notes;
    }

    const { data: dispute, error } = await supabase
      .from("disputes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating dispute:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update dispute",
      });
    }

    res.json({
      success: true,
      data: dispute,
      message: "Dispute updated successfully",
    });
  } catch (error: any) {
    console.error("Error in PUT /disputes/:id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Assign dispute to admin
router.put("/:id/assign", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { admin_id } = req.body;

    if (!admin_id) {
      return res.status(400).json({
        success: false,
        error: "admin_id is required",
      });
    }

    // Verify admin exists
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .eq("id", admin_id)
      .single();

    if (adminError || !admin) {
      return res.status(404).json({
        success: false,
        error: "Admin not found",
      });
    }

    const { data: dispute, error } = await supabase
      .from("disputes")
      .update({
        assigned_to: admin_id,
        assigned_at: new Date().toISOString(),
        status: "investigating",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error assigning dispute:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to assign dispute",
      });
    }

    // Notify admin
    await supabase.from("notifications").insert([
      {
        user_id: admin_id,
        type: "system",
        title: "Dispute Assigned",
        message: "A dispute has been assigned to you",
        related_id: id,
        related_type: "dispute",
        priority: "high",
      },
    ]);

    res.json({
      success: true,
      data: dispute,
      message: "Dispute assigned successfully",
    });
  } catch (error: any) {
    console.error("Error in PUT /disputes/:id/assign:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Resolve dispute
router.put("/:id/resolve", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution_action, resolution_notes, refund_amount } = req.body;

    if (!resolution_action) {
      return res.status(400).json({
        success: false,
        error: "resolution_action is required",
      });
    }

    const validActions = [
      "refund_full",
      "refund_partial",
      "no_action",
      "warning",
      "suspension",
    ];
    if (!validActions.includes(resolution_action)) {
      return res.status(400).json({
        success: false,
        error: `Invalid resolution_action. Must be one of: ${validActions.join(", ")}`,
      });
    }

    // Get dispute details
    const { data: dispute, error: disputeError } = await supabase
      .from("disputes")
      .select("*, booking:bookings(id, homeowner_id, worker_id), payment:payments(id)")
      .eq("id", id)
      .single();

    if (disputeError || !dispute) {
      return res.status(404).json({
        success: false,
        error: "Dispute not found",
      });
    }

    // Update dispute
    const { data: updatedDispute, error } = await supabase
      .from("disputes")
      .update({
        status: "resolved",
        resolution_action,
        resolution_notes,
        refund_amount,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error resolving dispute:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to resolve dispute",
      });
    }

    // Handle refund actions
    if (resolution_action === "refund_full" || resolution_action === "refund_partial") {
      if (dispute.payment_id) {
        await supabase
          .from("payments")
          .update({
            status: "refunded",
            refunded_at: new Date().toISOString(),
          })
          .eq("id", dispute.payment_id);
      }
    }

    // Notify both parties
    const notificationMessage = `Dispute resolved: ${resolution_action.replace("_", " ")}`;
    await supabase.from("notifications").insert([
      {
        user_id: dispute.raised_by,
        type: "system",
        title: "Dispute Resolved",
        message: notificationMessage,
        related_id: id,
        related_type: "dispute",
        priority: "high",
      },
      {
        user_id: dispute.against_user_id,
        type: "system",
        title: "Dispute Resolved",
        message: notificationMessage,
        related_id: id,
        related_type: "dispute",
        priority: "high",
      },
    ]);

    res.json({
      success: true,
      data: updatedDispute,
      message: "Dispute resolved successfully",
    });
  } catch (error: any) {
    console.error("Error in PUT /disputes/:id/resolve:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Get dispute statistics
router.get("/stats/summary", async (req: Request, res: Response) => {
  try {
    // Get total disputes
    const { count: totalDisputes } = await supabase
      .from("disputes")
      .select("*", { count: "exact", head: true });

    // Get disputes by status
    const { data: statusData } = await supabase
      .from("disputes")
      .select("status")
      .order("status");

    const statusCounts = statusData?.reduce((acc: any, curr: any) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    // Get disputes by category
    const { data: categoryData } = await supabase
      .from("disputes")
      .select("category")
      .order("category");

    const categoryCounts = categoryData?.reduce((acc: any, curr: any) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {});

    // Get disputes by priority
    const { data: priorityData } = await supabase
      .from("disputes")
      .select("priority")
      .order("priority");

    const priorityCounts = priorityData?.reduce((acc: any, curr: any) => {
      acc[curr.priority] = (acc[curr.priority] || 0) + 1;
      return acc;
    }, {});

    // Get average resolution time (for resolved disputes)
    const { data: resolvedDisputes } = await supabase
      .from("disputes")
      .select("created_at, resolved_at")
      .eq("status", "resolved")
      .not("resolved_at", "is", null);

    let avgResolutionHours = 0;
    if (resolvedDisputes && resolvedDisputes.length > 0) {
      const totalHours = resolvedDisputes.reduce((acc, dispute) => {
        const created = new Date(dispute.created_at).getTime();
        const resolved = new Date(dispute.resolved_at).getTime();
        return acc + (resolved - created) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = totalHours / resolvedDisputes.length;
    }

    res.json({
      success: true,
      data: {
        total_disputes: totalDisputes || 0,
        by_status: statusCounts || {},
        by_category: categoryCounts || {},
        by_priority: priorityCounts || {},
        avg_resolution_hours: Math.round(avgResolutionHours * 100) / 100,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /disputes/stats/summary:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

export default router;
