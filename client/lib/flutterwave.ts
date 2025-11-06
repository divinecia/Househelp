import axios from "axios";

const FLUTTERWAVE_API_BASE = "https://api.flutterwave.com/v3";
const PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
const SECRET_KEY = import.meta.env.VITE_FLUTTERWAVE_SECRET_KEY;

export interface PaymentPayload {
  amount: number;
  currency: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  description: string;
  redirect_url?: string;
  meta?: Record<string, any>;
}

export interface PaymentResponse {
  status: string;
  message: string;
  data?: {
    id: number;
    status: string;
    link: string;
  };
}

export const initializeFlutterwavePayment = async (
  payload: PaymentPayload
): Promise<PaymentResponse> => {
  try {
    const response = await axios.post(
      `${FLUTTERWAVE_API_BASE}/payments`,
      {
        ...payload,
        public_key: PUBLIC_KEY,
      },
      {
        headers: {
          Authorization: `Bearer ${SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Flutterwave initialization error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Payment initialization failed"
    );
  }
};

export const verifyFlutterwavePayment = async (transactionId: string) => {
  try {
    const response = await axios.get(
      `${FLUTTERWAVE_API_BASE}/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Flutterwave verification error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Payment verification failed"
    );
  }
};

export const getFlutterwavePaymentLink = async (payload: PaymentPayload): Promise<string> => {
  try {
    const response = await axios.post(
      `${FLUTTERWAVE_API_BASE}/payments`,
      {
        ...payload,
        public_key: PUBLIC_KEY,
      },
      {
        headers: {
          Authorization: `Bearer ${SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status === "success") {
      return response.data.data.link;
    }

    throw new Error(response.data.message || "Failed to get payment link");
  } catch (error: any) {
    console.error("Flutterwave payment link error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to create payment link"
    );
  }
};

export const createInvoice = async (
  customer_name: string,
  customer_email: string,
  amount: number,
  currency: string = "RWF",
  description: string = "Service Payment"
) => {
  try {
    const response = await axios.post(
      `${FLUTTERWAVE_API_BASE}/invoices`,
      {
        sender: {
          name: "HouseHelp",
          email: "payments@househelp.rw",
        },
        items: [
          {
            name: description,
            description,
            amount,
            quantity: 1,
          },
        ],
        customer: {
          name: customer_name,
          email: customer_email,
        },
        currency,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
      {
        headers: {
          Authorization: `Bearer ${SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Flutterwave invoice creation error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Invoice creation failed"
    );
  }
};

export const getPaymentStatus = async (transactionId: string) => {
  try {
    const response = await axios.get(
      `${FLUTTERWAVE_API_BASE}/transactions/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${SECRET_KEY}`,
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error("Flutterwave status check error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to get payment status"
    );
  }
};
