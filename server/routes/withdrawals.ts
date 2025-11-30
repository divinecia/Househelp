import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get all withdrawal requests (admin)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, worker_id } = req.query;

    let query = supabase
      .from("withdrawal_requests")
      .select(`
        *,
        worker:workers(
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        processed_by_admin:admins(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (worker_id) {
      query = query.eq("worker_id", worker_id);
    }

    const { data: withdrawals, error } = await query;

    if (error) {
      console.error("Error fetching withdrawals:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch withdrawal requests",
      });
    }

    res.json({
      success: true,
      data: withdrawals,
      total: withdrawals?.length || 0,
    });
  } catch (error: any) {
    console.error("Error in GET /withdrawals:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Get withdrawal requests by worker
router.get("/worker/:worker_id", async (req: Request, res: Response) => {
  try {
    const { worker_id } = req.params;

    const { data: withdrawals, error } = await supabase
      .from("withdrawal_requests")
      .select(`
        *,
        processed_by_admin:admins(
          id,
          first_name,
          last_name
        )
      `)
      .eq("worker_id", worker_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching worker withdrawals:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch withdrawal requests",
      });
    }

    res.json({
      success: true,
      data: withdrawals,
      total: withdrawals?.length || 0,
    });
  } catch (error: any) {
    console.error("Error in GET /withdrawals/worker/:worker_id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Get single withdrawal request
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: withdrawal, error } = await supabase
      .from("withdrawal_requests")
      .select(`
        *,
        worker:workers(
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        processed_by_admin:admins(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching withdrawal:", error);
      return res.status(404).json({
        success: false,
        error: "Withdrawal request not found",
      });
    }

    res.json({
      success: true,
      data: withdrawal,
    });
  } catch (error: any) {
    console.error("Error in GET /withdrawals/:id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Get worker's available balance
router.get("/balance/:worker_id", async (req: Request, res: Response) => {
  try {
    const { worker_id } = req.params;

    // Calculate available balance from completed payments
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("worker_payout_amount, payout_status")
      .eq("payee_id", worker_id)
      .eq("status", "completed");

    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
      return res.status(500).json({
        success: false,
        error: "Failed to calculate balance",
      });
    }

    // Sum up unpaid worker payouts
    const availableBalance = payments
      ?.filter((p: any) => p.payout_status !== "completed")
      .reduce((sum: number, p: any) => sum + parseFloat(p.worker_payout_amount || "0"), 0) || 0;

    // Get pending withdrawals
    const { data: pendingWithdrawals, error: withdrawalsError } = await supabase
      .from("withdrawal_requests")
      .select("requested_amount")
      .eq("worker_id", worker_id)
      .in("status", ["pending", "approved", "processing"]);

    if (withdrawalsError) {
      console.error("Error fetching pending withdrawals:", withdrawalsError);
    }

    const pendingAmount = pendingWithdrawals
      ?.reduce((sum: number, w: any) => sum + parseFloat(w.requested_amount || "0"), 0) || 0;

    res.json({
      success: true,
      data: {
        available_balance: availableBalance,
        pending_withdrawals: pendingAmount,
        withdrawable_balance: Math.max(0, availableBalance - pendingAmount),
      },
    });
  } catch (error: any) {
    console.error("Error in GET /withdrawals/balance/:worker_id:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Create withdrawal request
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      worker_id,
      requested_amount,
      withdrawal_method,
      account_number,
      account_name,
      bank_name,
      bank_branch,
    } = req.body;

    // Validate required fields
    if (!worker_id || !requested_amount || !withdrawal_method || !account_number) {
      return res.status(400).json({
        success: false,
        error: "worker_id, requested_amount, withdrawal_method, and account_number are required",
      });
    }

    // Validate withdrawal method
    const validMethods = ["bank_transfer", "mobile_money"];
    if (!validMethods.includes(withdrawal_method)) {
      return res.status(400).json({
        success: false,
        error: `Invalid withdrawal_method. Must be one of: ${validMethods.join(", ")}`,
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

    // Calculate available balance
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("worker_payout_amount, payout_status")
      .eq("payee_id", worker_id)
      .eq("status", "completed");

    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
      return res.status(500).json({
        success: false,
        error: "Failed to calculate balance",
      });
    }

    const availableBalance = payments
      ?.filter((p: any) => p.payout_status !== "completed")
      .reduce((sum: number, p: any) => sum + parseFloat(p.worker_payout_amount || "0"), 0) || 0;

    // Check if requested amount is available
    if (parseFloat(requested_amount) > availableBalance) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Available: ${availableBalance}`,
      });
    }

    // Calculate withdrawal fee (e.g., 2% or fixed amount)
    const withdrawalFee = parseFloat(requested_amount) * 0.02; // 2% fee
    const netAmount = parseFloat(requested_amount) - withdrawalFee;

    // Create withdrawal request
    const { data: withdrawal, error } = await supabase
      .from("withdrawal_requests")
      .insert([
        {
          worker_id,
          requested_amount: parseFloat(requested_amount),
          available_balance: availableBalance,
          withdrawal_fee: withdrawalFee,
          net_amount: netAmount,
          withdrawal_method,
          account_number,
          account_name,
          bank_name,
          bank_branch,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating withdrawal:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create withdrawal request",
      });
    }

    // Notify worker
    await supabase.from("notifications").insert([
      {
        user_id: worker_id,
        type: "payment",
        title: "Withdrawal Request Submitted",
        message: `Your withdrawal request for ${requested_amount} RWF has been submitted`,
        related_id: withdrawal.id,
        related_type: "withdrawal",
        priority: "normal",
      },
    ]);

    // Notify admins
    const { data: admins } = await supabase.from("admins").select("id");

    if (admins && admins.length > 0) {
      const notifications = admins.map((admin: any) => ({
        user_id: admin.id,
        type: "payment",
        title: "New Withdrawal Request",
        message: `Worker has requested withdrawal of ${requested_amount} RWF`,
        related_id: withdrawal.id,
        related_type: "withdrawal",
        priority: "normal",
      }));

      await supabase.from("notifications").insert(notifications);
    }

    res.status(201).json({
      success: true,
      data: withdrawal,
      message: "Withdrawal request created successfully",
    });
  } catch (error: any) {
    console.error("Error in POST /withdrawals:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Approve withdrawal (admin)
router.put("/:id/approve", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { processed_by } = req.body;

    if (!processed_by) {
      return res.status(400).json({
        success: false,
        error: "processed_by (admin_id) is required",
      });
    }

    // Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawal_requests")
      .select("worker_id, requested_amount")
      .eq("id", id)
      .single();

    if (withdrawalError || !withdrawal) {
      return res.status(404).json({
        success: false,
        error: "Withdrawal request not found",
      });
    }

    // Update withdrawal status
    const { data: updatedWithdrawal, error } = await supabase
      .from("withdrawal_requests")
      .update({
        status: "approved",
        processed_by,
        processed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error approving withdrawal:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to approve withdrawal",
      });
    }

    // Notify worker
    await supabase.from("notifications").insert([
      {
        user_id: withdrawal.worker_id,
        type: "payment",
        title: "Withdrawal Approved",
        message: `Your withdrawal request has been approved and will be processed soon`,
        related_id: id,
        related_type: "withdrawal",
        priority: "high",
      },
    ]);

    res.json({
      success: true,
      data: updatedWithdrawal,
      message: "Withdrawal request approved",
    });
  } catch (error: any) {
    console.error("Error in PUT /withdrawals/:id/approve:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Process withdrawal (admin)
router.put("/:id/process", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { transaction_reference } = req.body;

    // Update withdrawal status
    const { data: withdrawal, error } = await supabase
      .from("withdrawal_requests")
      .update({
        status: "processing",
        transaction_reference,
      })
      .eq("id", id)
      .select("worker_id")
      .single();

    if (error) {
      console.error("Error processing withdrawal:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to process withdrawal",
      });
    }

    // Notify worker
    await supabase.from("notifications").insert([
      {
        user_id: withdrawal.worker_id,
        type: "payment",
        title: "Withdrawal Processing",
        message: "Your withdrawal is being processed",
        related_id: id,
        related_type: "withdrawal",
        priority: "normal",
      },
    ]);

    res.json({
      success: true,
      message: "Withdrawal marked as processing",
    });
  } catch (error: any) {
    console.error("Error in PUT /withdrawals/:id/process:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Complete withdrawal (admin)
router.put("/:id/complete", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawal_requests")
      .select("worker_id, requested_amount")
      .eq("id", id)
      .single();

    if (withdrawalError || !withdrawal) {
      return res.status(404).json({
        success: false,
        error: "Withdrawal request not found",
      });
    }

    // Update withdrawal status
    const { error } = await supabase
      .from("withdrawal_requests")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error completing withdrawal:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to complete withdrawal",
      });
    }

    // Update payment payout statuses
    // Mark worker payouts as completed
    await supabase
      .from("payments")
      .update({ payout_status: "completed", payout_date: new Date().toISOString() })
      .eq("payee_id", withdrawal.worker_id)
      .eq("payout_status", "pending")
      .eq("status", "completed");

    // Notify worker
    await supabase.from("notifications").insert([
      {
        user_id: withdrawal.worker_id,
        type: "payment",
        title: "Withdrawal Completed",
        message: `Your withdrawal of ${withdrawal.requested_amount} RWF has been completed`,
        related_id: id,
        related_type: "withdrawal",
        priority: "high",
      },
    ]);

    res.json({
      success: true,
      message: "Withdrawal completed successfully",
    });
  } catch (error: any) {
    console.error("Error in PUT /withdrawals/:id/complete:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Reject withdrawal (admin)
router.put("/:id/reject", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { processed_by, rejection_reason } = req.body;

    if (!processed_by || !rejection_reason) {
      return res.status(400).json({
        success: false,
        error: "processed_by (admin_id) and rejection_reason are required",
      });
    }

    // Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawal_requests")
      .select("worker_id")
      .eq("id", id)
      .single();

    if (withdrawalError || !withdrawal) {
      return res.status(404).json({
        success: false,
        error: "Withdrawal request not found",
      });
    }

    // Update withdrawal status
    const { error } = await supabase
      .from("withdrawal_requests")
      .update({
        status: "rejected",
        processed_by,
        processed_at: new Date().toISOString(),
        rejection_reason,
      })
      .eq("id", id);

    if (error) {
      console.error("Error rejecting withdrawal:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to reject withdrawal",
      });
    }

    // Notify worker
    await supabase.from("notifications").insert([
      {
        user_id: withdrawal.worker_id,
        type: "payment",
        title: "Withdrawal Rejected",
        message: `Your withdrawal request was rejected. Reason: ${rejection_reason}`,
        related_id: id,
        related_type: "withdrawal",
        priority: "high",
      },
    ]);

    res.json({
      success: true,
      message: "Withdrawal request rejected",
    });
  } catch (error: any) {
    console.error("Error in PUT /withdrawals/:id/reject:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Get withdrawal statistics (admin)
router.get("/stats/summary", async (req: Request, res: Response) => {
  try {
    // Get total withdrawals
    const { count: totalWithdrawals } = await supabase
      .from("withdrawal_requests")
      .select("*", { count: "exact", head: true });

    // Get withdrawals by status
    const { data: statusData } = await supabase
      .from("withdrawal_requests")
      .select("status, requested_amount")
      .order("status");

    const statusStats = statusData?.reduce((acc: any, curr: any) => {
      if (!acc[curr.status]) {
        acc[curr.status] = { count: 0, total_amount: 0 };
      }
      acc[curr.status].count += 1;
      acc[curr.status].total_amount += parseFloat(curr.requested_amount || "0");
      return acc;
    }, {});

    // Get total amount withdrawn
    const { data: completedWithdrawals } = await supabase
      .from("withdrawal_requests")
      .select("requested_amount")
      .eq("status", "completed");

    const totalWithdrawn = completedWithdrawals
      ?.reduce((sum: number, w: any) => sum + parseFloat(w.requested_amount || "0"), 0) || 0;

    res.json({
      success: true,
      data: {
        total_withdrawals: totalWithdrawals || 0,
        by_status: statusStats || {},
        total_withdrawn: totalWithdrawn,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /withdrawals/stats/summary:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

export default router;
