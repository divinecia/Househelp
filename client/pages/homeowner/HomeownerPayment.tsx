import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { verifyPayment } from "@/lib/api-client";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function HomeownerPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<{
    status: "idle" | "processing" | "success" | "failed";
    message?: string;
  }>({ status: "idle" });

  useEffect(() => {
    const transactionId = searchParams.get("transaction_id");
    if (!transactionId) return;

    const verifyAsync = async () => {
      try {
        setPaymentStatus({
          status: "processing",
          message: "Verifying payment...",
        });

        const response = await verifyPayment(transactionId);

        if (response.success) {
          setPaymentStatus({
            status: "success",
            message: "Payment verified successfully!",
          });
          toast.success("Payment processed successfully!");

          setTimeout(() => {
            navigate("/homeowner/bookings");
          }, 2000);
        } else {
          setPaymentStatus({
            status: "failed",
            message: response.error || "Payment verification failed",
          });
          toast.error("Payment verification failed");
        }
      } catch (error) {
        setPaymentStatus({
          status: "failed",
          message: "Error verifying payment",
        });
        toast.error("Error verifying payment");
      }
    };

    void verifyAsync();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              {paymentStatus.status === "processing" && (
                <>
                  <Loader className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
                  <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
                  <p className="text-gray-600">{paymentStatus.message}</p>
                </>
              )}
              {paymentStatus.status === "success" && (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2 text-green-600">
                    Payment Successful!
                  </h2>
                  <p className="text-gray-600 mb-4">{paymentStatus.message}</p>
                  <p className="text-sm text-gray-500">
                    Redirecting to bookings...
                  </p>
                </>
              )}
              {paymentStatus.status === "failed" && (
                <>
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2 text-red-600">
                    Payment Failed
                  </h2>
                  <p className="text-gray-600 mb-4">{paymentStatus.message}</p>
                  <button
                    onClick={() => navigate("/homeowner/bookings")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Go to Bookings
                  </button>
                </>
              )}
              {paymentStatus.status === "idle" && (
                <>
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No Transaction Found</h2>
                  <p className="text-gray-600 mb-4">
                    No payment transaction ID was provided.
                  </p>
                  <button
                    onClick={() => navigate("/homeowner/bookings")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Go to Bookings
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

