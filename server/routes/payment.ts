import { Router, Request, Response } from "express";
import axios from "axios";
import { supabase } from "../lib/supabase";
import { validatePaymentData } from "../middleware/validation";
import { initializePayPackPayment, verifyPayPackPayment } from "../services/paypack";
import { sendEmail } from "../services/email";

const router = Router();

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || "";
const FLUTTERWAVE_API_BASE = "https://api.flutterwave.com/v3";
const PLATFORM_FEE_PERCENTAGE = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || "10");

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

// ============================================================================
// CREATE PAYMENT RECORD
// ============================================================================
router.post("/", validatePaymentData, async (req: Request, res: Response) => {
  try {
    const {
      booking_id,
      payer_id,
      payee_id,
      amount,
      payment_method,
      payment_gateway,
      transaction_reference,
    } = req.body;

    // Calculate platform fee and worker payout
    const platformFee = (parseFloat(amount) * PLATFORM_FEE_PERCENTAGE) / 100;
    const workerPayoutAmount = parseFloat(amount) - platformFee;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Insert payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .insert([
        {
          booking_id,
          payer_id,
          payee_id,
          amount: parseFloat(amount),
          currency: "RWF",
          payment_method: payment_method || "mobile_money",
          payment_gateway: payment_gateway || null,
          transaction_reference: transaction_reference || null,
          status: "pending",
          platform_fee: platformFee,
          worker_payout_amount: workerPayoutAmount,
          payout_status: "pending",
          invoice_number: invoiceNumber,
        },
      ])
      .select(`
        *,
        booking:bookings(id, booking_date, service:services(name)),
        payer:homeowners(id, full_name, email),
        payee:workers(id, full_name, email)
      `)
      .single();

    if (paymentError) {
      return res.status(400).json({
        success: false,
        error: "Failed to create payment: " + paymentError.message,
      });
    }

    // Update booking payment status
    if (booking_id) {
      await supabase
        .from("bookings")
        .update({ payment_status: "pending" })
        .eq("id", booking_id);
    }

    // Send notification to payer
    await supabase.from("notifications").insert([
      {
        user_id: payer_id,
        type: "payment",
        title: "Payment Initiated",
        message: `Your payment of ${amount} RWF has been initiated`,
        related_id: paymentData.id,
        related_type: "payment",
        priority: "normal",
      },
    ]);

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

// ============================================================================
// GET ALL PAYMENTS
// ============================================================================
router.get("/", async (req: Request, res: Response) => {
  try {
    const { payer_id, payee_id, booking_id, status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from("payments")
      .select(`
        *,
        booking:bookings(id, booking_date, service:services(name)),
        payer:homeowners(id, full_name, email),
        payee:workers(id, full_name, email)
      `);

    if (payer_id) query = query.eq("payer_id", payer_id);
    if (payee_id) query = query.eq("payee_id", payee_id);
    if (booking_id) query = query.eq("booking_id", booking_id);
    if (status) query = query.eq("status", status);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(
        parseInt(offset as string),
        parseInt(offset as string) + parseInt(limit as string) - 1
      );

    if (error) throw new Error(error.message);

    return res.json({ success: true, data, total: count });
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET SINGLE PAYMENT
// ============================================================================
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        booking:bookings(
          id,
          booking_date,
          service:services(name),
          homeowner:homeowners(full_name, email),
          worker:workers(full_name, email)
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    if (!data) return res.status(404).json({ success: false, error: "Payment not found" });

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching payment:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// VERIFY PAYMENT WITH FLUTTERWAVE
// ============================================================================
router.post("/verify", async (req: Request, res: Response) => {
  try {
    if (!FLUTTERWAVE_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error: "Flutterwave configuration missing. FLUTTERWAVE_SECRET_KEY is not set.",
      });
    }

    const { transactionId, payment_id } = req.body as PaymentVerificationRequest & { payment_id?: string };

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
      }
    );

    if (response.data.status === "success" && response.data.data) {
      // Update payment record if payment_id provided
      if (payment_id) {
        const { data: payment, error: updateError } = await supabase
          .from("payments")
          .update({
            status: "completed",
            gateway_transaction_id: response.data.data.id.toString(),
            gateway_response: response.data.data,
            paid_at: new Date().toISOString(),
          })
          .eq("id", payment_id)
          .select(`
            *,
            booking:bookings(id, homeowner_id, worker_id),
            payer:homeowners(full_name, email),
            payee:workers(full_name, email)
          `)
          .single();

        if (updateError) {
          console.error("Error updating payment:", updateError);
        } else if (payment) {
          // Update booking payment status
          await supabase
            .from("bookings")
            .update({ payment_status: "paid" })
            .eq("id", payment.booking_id);

          // Send notifications
          await supabase.from("notifications").insert([
            {
              user_id: payment.booking.homeowner_id,
              type: "payment",
              title: "Payment Successful",
              message: "Your payment has been processed successfully",
              related_id: payment.id,
              related_type: "payment",
              priority: "normal",
            },
            {
              user_id: payment.booking.worker_id,
              type: "payment",
              title: "Payment Received",
              message: `Payment of ${payment.amount} RWF has been received for your service`,
              related_id: payment.id,
              related_type: "payment",
              priority: "normal",
            },
          ]);

          // Send email notifications
          try {
            await sendEmail(
              payment.payer.email,
              "Payment Successful",
              `Your payment of ${payment.amount} RWF has been processed successfully. Invoice: ${payment.invoice_number}`
            );
            await sendEmail(
              payment.payee.email,
              "Payment Received",
              `You have received a payment of ${payment.worker_payout_amount} RWF (after ${PLATFORM_FEE_PERCENTAGE}% platform fee)`
            );
          } catch (emailError) {
            console.error("Error sending payment emails:", emailError);
          }
        }
      }

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

// ============================================================================
// FLUTTERWAVE WEBHOOK
// ============================================================================
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    if (!FLUTTERWAVE_SECRET_KEY) {
      console.warn("Flutterwave webhook received but FLUTTERWAVE_SECRET_KEY is not configured");
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
    const computedHash = crypto
      .createHmac("sha256", FLUTTERWAVE_SECRET_KEY)
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
      // Find and update payment by transaction reference
      const txRef = payload.data.tx_ref;
      if (txRef) {
        await supabase
          .from("payments")
          .update({
            status: "completed",
            gateway_transaction_id: payload.data.id.toString(),
            gateway_response: payload.data,
            paid_at: new Date().toISOString(),
          })
          .eq("transaction_reference", txRef);
      }

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

// ============================================================================
// INITIALIZE PAYPACK PAYMENT
// ============================================================================
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

// ============================================================================
// VERIFY PAYPACK PAYMENT
// ============================================================================
router.post("/paypack/verify", async (req: Request, res: Response) => {
  try {
    const { transactionId, payment_id } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: "Transaction ID is required",
      });
    }

    const verifyResponse = await verifyPayPackPayment(transactionId);

    if (verifyResponse.success && verifyResponse.status === "completed") {
      // Update payment record if payment_id provided
      if (payment_id) {
        await supabase
          .from("payments")
          .update({
            status: "completed",
            gateway_transaction_id: transactionId,
            paid_at: new Date().toISOString(),
          })
          .eq("id", payment_id);
      }

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

// ============================================================================
// GET PAYMENT STATUS
// ============================================================================
router.get("/status/:transactionId", async (req: Request, res: Response) => {
  try {
    if (!FLUTTERWAVE_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error: "Flutterwave configuration missing. FLUTTERWAVE_SECRET_KEY is not set.",
      });
    }

    const { transactionId } = req.params;

    const response = await axios.get(
      `${FLUTTERWAVE_API_BASE}/transactions/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        },
      }
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

// ============================================================================
// REQUEST REFUND
// ============================================================================
router.post("/:id/refund", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, refund_amount } = req.body;

    // Get payment
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment not found" });
    }

    if (payment.status !== "completed") {
      return res.status(400).json({
        success: false,
        error: "Can only refund completed payments",
      });
    }

    const refundAmt = refund_amount || payment.amount;

    // Update payment status
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "refunded",
        refunded_at: new Date().toISOString(),
        failure_reason: reason,
      })
      .eq("id", id);

    if (updateError) throw new Error(updateError.message);

    // Update booking payment status
    await supabase
      .from("bookings")
      .update({ payment_status: "refunded" })
      .eq("id", payment.booking_id);

    // Send notifications
    await supabase.from("notifications").insert([
      {
        user_id: payment.payer_id,
        type: "payment",
        title: "Refund Processed",
        message: `A refund of ${refundAmt} RWF has been processed`,
        related_id: id,
        related_type: "payment",
        priority: "high",
      },
    ]);

    return res.json({
      success: true,
      message: "Refund processed successfully",
    });
  } catch (error: any) {
    console.error("Error processing refund:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET PAYMENT STATISTICS
// ============================================================================
router.get("/stats/summary", async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, payee_id } = req.query;

    let query = supabase.from("payments").select("amount, status, platform_fee, created_at");

    if (start_date) query = query.gte("created_at", start_date);
    if (end_date) query = query.lte("created_at", end_date);
    if (payee_id) query = query.eq("payee_id", payee_id);

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    const stats = {
      total_payments: data.length,
      total_revenue: 0,
      completed_revenue: 0,
      pending_revenue: 0,
      platform_fees_collected: 0,
      by_status: {} as Record<string, number>,
    };

    data.forEach((payment) => {
      stats.total_revenue += parseFloat(payment.amount);
      stats.by_status[payment.status] = (stats.by_status[payment.status] || 0) + 1;

      if (payment.status === "completed") {
        stats.completed_revenue += parseFloat(payment.amount);
        stats.platform_fees_collected += parseFloat(payment.platform_fee || "0");
      } else if (payment.status === "pending") {
        stats.pending_revenue += parseFloat(payment.amount);
      }
    });

    return res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error("Error fetching payment statistics:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
