import { supabase } from "./supabase";
import {
  initializeFlutterwavePayment,
  verifyFlutterwavePayment,
  PaymentPayload,
} from "./flutterwave";
import { broadcastPaymentNotification } from "./notifications";

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "cancelled";
  transaction_ref: string;
  payment_method: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const createPayment = async (
  userId: string,
  amount: number,
  currency: string,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<Payment> => {
  try {
    const transactionRef = `TXN-${userId}-${Date.now()}`;

    const insertData = {
      user_id: userId,
      amount,
      currency,
      status: "pending",
      transaction_ref: transactionRef,
      payment_method: "flutterwave",
      description,
      metadata: metadata || {},
    };

    const { data: payment, error } = await supabase
      .from("payments")
      .insert([insertData] as never)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return payment;
  } catch (error) {
    console.error("Error creating payment record:", error);
    throw error;
  }
};

export const processFlutterwavePayment = async (
  userId: string,
  amount: number,
  email: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  description: string,
  metadata?: Record<string, unknown>,
) => {
  try {
    const payment = await createPayment(
      userId,
      amount,
      "RWF",
      description,
      metadata,
    );

    const paymentPayload: PaymentPayload = {
      amount,
      currency: "RWF",
      email,
      phone_number: phoneNumber,
      first_name: firstName,
      last_name: lastName,
      tx_ref: payment.transaction_ref,
      description,
      redirect_url: `${window.location.origin}/payment/callback`,
      meta: {
        userId,
        paymentId: payment.id,
        ...metadata,
      },
    };

    const flutterwaveResponse =
      await initializeFlutterwavePayment(paymentPayload);

    if (flutterwaveResponse.status === "success") {
      return {
        success: true,
        payment,
        paymentLink: flutterwaveResponse.data?.link,
      };
    }

    throw new Error(
      flutterwaveResponse.message || "Payment initialization failed",
    );
  } catch (error) {
    console.error("Error processing Flutterwave payment:", error);
    throw error;
  }
};

export const verifyPayment = async (
  transactionId: string,
): Promise<Payment> => {
  try {
    const flutterwaveVerification =
      await verifyFlutterwavePayment(transactionId);

    if (!flutterwaveVerification.data) {
      throw new Error("Transaction verification failed");
    }

    const txRef = flutterwaveVerification.data.tx_ref;

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("transaction_ref", txRef)
      .single() as { data: Payment; error: unknown };

    if (paymentError) {
      throw new Error("Payment record not found");
    }

    const isSuccessful = flutterwaveVerification.data.status === "successful";
    const newStatus = isSuccessful ? "success" : "failed";

    const { data: updatedPayment, error: updateError } = await supabase
      .from("payments")
      .update({ status: newStatus } as never)
      .eq("id", payment.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (isSuccessful) {
      await broadcastPaymentNotification(
        payment.user_id,
        payment.amount,
        payment.currency,
        "success",
        txRef,
      );
    } else {
      await broadcastPaymentNotification(
        payment.user_id,
        payment.amount,
        payment.currency,
        "failed",
        txRef,
      );
    }

    return updatedPayment;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};

export const getPaymentHistory = async (
  userId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<Payment[]> => {
  try {
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(error.message);
    }

    return payments || [];
  } catch (error) {
    console.error("Error fetching payment history:", error);
    throw error;
  }
};

export const getPaymentStats = async (userId: string) => {
  try {
    const { data: payments, error } = await supabase
      .from("payments")
      .select("amount, status")
      .eq("user_id", userId)
      .eq("status", "success") as { data: Payment[]; error: unknown };

    if (error) {
      throw new Error(error instanceof Error ? error.message : "Query error");
    }

    const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const transactionCount = payments?.length || 0;

    return {
      totalPaid,
      transactionCount,
      averageTransaction:
        transactionCount > 0 ? totalPaid / transactionCount : 0,
    };
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    return {
      totalPaid: 0,
      transactionCount: 0,
      averageTransaction: 0,
    };
  }
};

export const cancelPayment = async (paymentId: string): Promise<Payment> => {
  try {
    const { data: payment, error } = await supabase
      .from("payments")
      .update({ status: "cancelled" } as never)
      .eq("id", paymentId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return payment;
  } catch (error) {
    console.error("Error cancelling payment:", error);
    throw error;
  }
};
