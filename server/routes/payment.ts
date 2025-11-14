import { Router, Request, Response } from "express";
import axios from "axios";
import { supabase } from "../lib/supabase";
import { validatePaymentData } from "../middleware/validation";
import { initializePayPackPayment, verifyPayPackPayment } from "../services/paypack";
import { sendAdminReportEmail } from "../services/email";

const router = Router();

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || "";
const FLUTTERWAVE_API_BASE = "https://api.flutterwave.com/v3";

interface PaymentVerificationRequest {
  transactionId: string;
}

interface FlutterwaveVerificationResponse {
  status: string;
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    status: string;
    amount: number;
    currency: string;
    payment_type: string;
    created_at: string;
    customer: {
      email: string;
      name: string;
      phone_number: string;
    };
    meta?: Record<string, any>;
  };
}

/**
 * Create a payment record
 */
router.post("/", validatePaymentData, async (req: Request, res: Response) => {
  try {
    const {
      booking_id,
      amount,
      payment_method,
      transaction_ref,
      description,
      status,
    } = req.body;

    // Insert payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .insert([
        {
          booking_id,
          amount,
          payment_method,
          transaction_ref: transaction_ref || null,
          status: status || "pending",
          description: description || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (paymentError) {
      return res.status(400).json({
        success: false,
        error: "Failed to create payment: " + paymentError.message,
      });
    }

    // Update booking payment status if needed
    if (booking_id) {
      await supabase
        .from("bookings")
        .update({ payment_status: status || "pending" })
        .eq("id", booking_id);
    }

    return res.status(201).json({
      success: true,
      data: paymentData,
      message: "Payment created successfully",
    });
  } catch (error: any) {
    console.error("Payment creation error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create payment",
    });
  }
});

/**
 * Verify payment with Flutterwave
 */
router.post("/verify", async (req: Request, res: Response) => {
  try {
    if (!FLUTTERWAVE_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error:
          "Flutterwave configuration missing. FLUTTERWAVE_SECRET_KEY is not set.",
      });
    }

    const { transactionId } = req.body as PaymentVerificationRequest;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: "Transaction ID is required",
      });
    }

    const response = await axios.get<FlutterwaveVerificationResponse>(
      `${FLUTTERWAVE_API_BASE}/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        },
      },
    );

    if (response.data.status === "success") {
      return res.json({
        success: true,
        data: response.data.data,
        message: "Payment verified successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        error: response.data.message || "Payment verification failed",
      });
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Payment verification failed",
    });
  }
});

router.post("/webhook", async (req: Request, res: Response) => {
  try {
    if (!FLUTTERWAVE_SECRET_KEY) {
      console.warn(
        "Flutterwave webhook received but FLUTTERWAVE_SECRET_KEY is not configured",
      );
      return res.status(500).json({
        success: false,
        error: "Flutterwave configuration missing",
      });
    }

    const payload = req.body;

    const hash = req.headers["verificationhash"] as string;

    if (!hash) {
      return res.status(400).json({
        success: false,
        error: "Verification hash missing",
      });
    }

    const crypto = require("crypto");
    const secretKey = FLUTTERWAVE_SECRET_KEY;

    const computedHash = crypto
      .createHmac("sha256", secretKey)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (hash !== computedHash) {
      return res.status(400).json({
        success: false,
        error: "Verification failed",
      });
    }

    const event = payload.event;

    if (event === "charge.completed" && payload.data.status === "successful") {
      return res.status(200).json({
        success: true,
        message: "Payment processed",
        data: payload.data,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Webhook processing failed",
    });
  }
});

/**
 * Initialize PayPack payment
 */
router.post("/paypack/initialize", async (req: Request, res: Response) => {
  try {
    const { amount, phone, description, reference } = req.body;

    if (!amount || !phone) {
      return res.status(400).json({
        success: false,
        error: "Amount and phone are required",
      });
    }

    const paypackResponse = await initializePayPackPayment({
      amount,
      phone,
      description,
      reference,
    });

    if (paypackResponse.success) {
      return res.json({
        success: true,
        data: {
          transaction_id: paypackResponse.transaction_id,
          payment_link: paypackResponse.payment_link,
          reference: paypackResponse.reference,
        },
        message: paypackResponse.message,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: paypackResponse.error,
      });
    }
  } catch (error: any) {
    console.error("PayPack initialization error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "PayPack initialization failed",
    });
  }
});

/**
 * Verify PayPack payment
 */
router.post("/paypack/verify", async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: "Transaction ID is required",
      });
    }

    const verifyResponse = await verifyPayPackPayment(transactionId);

    if (verifyResponse.success && verifyResponse.status === "completed") {
      return res.json({
        success: true,
        data: verifyResponse,
        message: "Payment verified successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        error: verifyResponse.error || "Payment verification failed",
      });
    }
  } catch (error: any) {
    console.error("PayPack verification error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "PayPack verification failed",
    });
  }
});

router.get("/status/:transactionId", async (req: Request, res: Response) => {
  try {
    if (!FLUTTERWAVE_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error:
          "Flutterwave configuration missing. FLUTTERWAVE_SECRET_KEY is not set.",
      });
    }

    const { transactionId } = req.params;

    const response = await axios.get(
      `${FLUTTERWAVE_API_BASE}/transactions/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        },
      },
    );

    return res.json({
      success: true,
      data: response.data.data,
    });
  } catch (error: any) {
    console.error("Status check error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to get payment status",
    });
  }
});

export default router;
