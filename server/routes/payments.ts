import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get payment by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = (req as unknown as { userProfile: Record<string, unknown> }).userProfile;
    const role = profile?.role;

    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    if (role !== "admin" && (payment as Record<string, unknown>).user_id !== profile.user_id) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    return res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get payment",
    });
  }
});

// Verify payment
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: "Transaction ID is required",
      });
    }

    // Mock payment verification
    return res.json({
      success: true,
      data: {
        transactionId,
        status: "verified",
        amount: 10000, // Mock amount in cents
        currency: "RWF",
      },
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to verify payment",
    });
  }
});

// Initialize Paypack payment
router.post("/paypack/initialize", async (req: Request, res: Response) => {
  try {
    const { amount, phoneNumber, bookingId } = req.body;

    if (!amount || !phoneNumber || !bookingId) {
      return res.status(400).json({
        success: false,
        error: "Amount, phone number, and booking ID are required",
      });
    }

    // Mock Paypack initialization
    const mockTransactionId = `PAYPACK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return res.json({
      success: true,
      data: {
        transactionId: mockTransactionId,
        status: "pending",
        amount,
        phoneNumber,
        bookingId,
        message: "Payment request sent to your phone",
      },
    });
  } catch (error) {
    console.error("Initialize Paypack payment error:", error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to initialize Paypack payment",
    });
  }
});

// Verify Paypack payment
router.post("/paypack/verify", async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: "Transaction ID is required",
      });
    }

    // Mock Paypack verification
    return res.json({
      success: true,
      data: {
        transactionId,
        status: "completed",
        amount: 10000, // Mock amount
        currency: "RWF",
        timestamp: new Date().toISOString(),
      },
      message: "Paypack payment verified successfully",
    });
  } catch (error) {
    console.error("Verify Paypack payment error:", error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to verify Paypack payment",
    });
  }
});

export default router;
