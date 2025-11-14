import axios from "axios";

const PAYPACK_API_URL = "https://api.paypack.rw/api/v1";
const PAYPACK_APP_ID = process.env.PAYPACK_APPLICATION_ID || "";
const PAYPACK_APP_SECRET = process.env.PAYPACK_APPLICATION_SECRET || "";

export interface PayPackPaymentRequest {
  amount: number;
  currency?: string;
  phone: string;
  description?: string;
  reference?: string;
  callback?: string;
}

export interface PayPackPaymentResponse {
  success: boolean;
  transaction_id?: string;
  payment_link?: string;
  reference?: string;
  message?: string;
  error?: string;
}

export interface PayPackVerificationResponse {
  success: boolean;
  transaction_id: string;
  status: string;
  amount: number;
  phone: string;
  reference?: string;
  message?: string;
  error?: string;
}

export const initializePayPackPayment = async (
  data: PayPackPaymentRequest,
): Promise<PayPackPaymentResponse> => {
  if (!PAYPACK_APP_ID || !PAYPACK_APP_SECRET) {
    return {
      success: false,
      error: "PayPack credentials not configured",
    };
  }

  try {
    const response = await axios.post(
      `${PAYPACK_API_URL}/transactions/initiate`,
      {
        amount: data.amount,
        currency: data.currency || "RWF",
        phone_number: data.phone,
        description: data.description || "HouseHelp Payment",
        client_reference: data.reference || `HH_${Date.now()}`,
        callback_url: data.callback || process.env.PAYPACK_CALLBACK_URL,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYPACK_APP_ID}:${PAYPACK_APP_SECRET}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.success) {
      return {
        success: true,
        transaction_id: response.data.transaction_id,
        payment_link: response.data.payment_link,
        reference: response.data.client_reference,
        message: "Payment initiated successfully",
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Failed to initiate payment",
      };
    }
  } catch (error: any) {
    console.error("PayPack initialization error:", error.message);
    return {
      success: false,
      error: error.message || "PayPack API error",
    };
  }
};

export const verifyPayPackPayment = async (
  transactionId: string,
): Promise<PayPackVerificationResponse> => {
  if (!PAYPACK_APP_ID || !PAYPACK_APP_SECRET) {
    return {
      success: false,
      transaction_id: transactionId,
      status: "error",
      amount: 0,
      phone: "",
      error: "PayPack credentials not configured",
    };
  }

  try {
    const response = await axios.get(
      `${PAYPACK_API_URL}/transactions/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${PAYPACK_APP_ID}:${PAYPACK_APP_SECRET}`,
        },
      },
    );

    if (response.data.success) {
      return {
        success: true,
        transaction_id: response.data.transaction_id,
        status: response.data.status,
        amount: response.data.amount,
        phone: response.data.phone_number,
        reference: response.data.client_reference,
        message: "Payment verified successfully",
      };
    } else {
      return {
        success: false,
        transaction_id: transactionId,
        status: "failed",
        amount: 0,
        phone: "",
        error: response.data.message || "Payment verification failed",
      };
    }
  } catch (error: any) {
    console.error("PayPack verification error:", error.message);
    return {
      success: false,
      transaction_id: transactionId,
      status: "error",
      amount: 0,
      phone: "",
      error: error.message || "PayPack API error",
    };
  }
};
