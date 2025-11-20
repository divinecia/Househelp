import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  getBookings,
  createPayment,
  verifyPayment,
  getPaymentMethods,
  getCurrentUser,
} from "@/lib/api-client";
import { initializeFlutterwavePayment } from "@/lib/flutterwave";
import { toast } from "sonner";
import { CreditCard, CheckCircle, AlertCircle, Loader } from "lucide-react";

interface Booking {
  id: string;
  worker_id: string;
  booking_date: string;
  status: string;
  amount?: number;
  payment_status?: string;
  description?: string;
}

interface PaymentData {
  bookingId: string;
  amount: number;
  paymentMethod: "flutterwave" | "bank_transfer" | "cash";
  description: string;
}

interface CurrentUser {
  id: string;
  email: string;
  phoneNumber?: string;
  contactNumber?: string;
}

export default function HomeownerPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    bookingId: "",
    amount: 0,
    paymentMethod: "flutterwave",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentStatus, setPaymentStatus] = useState<{
    status: "idle" | "processing" | "success" | "failed";
    message?: string;
  }>({ status: "idle" });

  useEffect(() => {
    fetchBookings();
    loadPaymentMethods();
    fetchCurrentUser();

    // Check for payment callback
    const transactionId = searchParams.get("transaction_id");
    if (transactionId) {
      verifyPaymentCallback(transactionId);
    }
  }, [searchParams]);

  const fetchCurrentUser = async () => {
    try {
      const result = await getCurrentUser();
      if (result.success && result.data) {
        setCurrentUser(result.data as CurrentUser);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const loadPaymentMethods = async () => {
    setIsLoadingMethods(true);
    try {
      const result = await getPaymentMethods();
      if (result.success && Array.isArray(result.data)) {
        setPaymentMethods(result.data);
      }
    } catch (error) {
      console.error("Failed to load payment methods:", error);
    } finally {
      setIsLoadingMethods(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await getBookings({
        status: "completed",
        payment_status: "unpaid",
      });
      if (response.success && Array.isArray(response.data)) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const verifyPaymentCallback = async (transactionId: string) => {
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

        // Refresh bookings
        setTimeout(() => {
          fetchBookings();
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

  const validatePayment = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!paymentData.bookingId) newErrors.bookingId = "Please select a booking";
    if (!paymentData.amount || paymentData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!paymentData.paymentMethod)
      newErrors.paymentMethod = "Please select payment method";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleFlutterwavePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePayment()) {
      toast.error("Please fix the errors below");
      return;
    }

    try {
      setLoading(true);
      setPaymentStatus({
        status: "processing",
        message: "Initializing payment...",
      });

      if (!currentUser?.email) {
        setPaymentStatus({
          status: "failed",
          message: "Unable to retrieve your email address",
        });
        toast.error("Unable to retrieve your email address");
        setLoading(false);
        return;
      }

      // Initialize Flutterwave payment
      const phoneNumber = currentUser.phoneNumber || currentUser.contactNumber || "";
      const tx_ref = `HouseHelp-${Date.now()}`;
      const userFullName = currentUser.email.split('@')[0] || "User";
      const flutterwaveResponse = await initializeFlutterwavePayment({
        amount: paymentData.amount,
        email: currentUser.email,
        phone_number: phoneNumber,
        currency: "RWF",
        first_name: userFullName,
        last_name: "", // Flutterwave requires this field but can be empty
        tx_ref: tx_ref,
        description: paymentData.description || "HouseHelp Payment",
        redirect_url: `${window.location.origin}/homeowner/payment?transaction_id=${tx_ref}`,
        meta: {
          title: "HouseHelp Payment",
          logo: "https://example.com/logo.png",
        },
      });

      if (
        flutterwaveResponse.status === "success" &&
        flutterwaveResponse.data?.link
      ) {
        // First create payment record in database
        const transactionRef = tx_ref;
        const paymentRecord = await createPayment({
          bookingId: paymentData.bookingId,
          amount: paymentData.amount,
          paymentMethod: "flutterwave",
          transactionRef: transactionRef,
          description: paymentData.description,
          status: "pending",
        });

        if (paymentRecord.success) {
          // Redirect to Flutterwave
          window.location.href = flutterwaveResponse.data.link;
        } else {
          setPaymentStatus({
            status: "failed",
            message: "Failed to create payment record",
          });
          toast.error("Failed to create payment record");
        }
      } else {
        setPaymentStatus({
          status: "failed",
          message: "Failed to initialize payment",
        });
        toast.error("Failed to initialize payment");
      }
    } catch (error) {
      setPaymentStatus({
        status: "failed",
        message: error instanceof Error ? error.message : "Payment error",
      });
      toast.error("Payment error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOtherPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePayment()) {
      toast.error("Please fix the errors below");
      return;
    }

    try {
      setLoading(true);

      const response = await createPayment({
        bookingId: paymentData.bookingId,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        description: paymentData.description,
        status: paymentData.paymentMethod === "cash" ? "pending" : "pending",
      });

      if (response.success) {
        setPaymentStatus({
          status: "success",
          message: `${paymentData.paymentMethod === "cash" ? "Payment recorded" : "Payment initiated"} successfully!`,
        });
        toast.success("Payment processed!");

        setTimeout(() => {
          fetchBookings();
          setSelectedBooking(null);
          setPaymentData({
            bookingId: "",
            amount: 0,
            paymentMethod: "flutterwave",
            description: "",
          });
        }, 1500);
      } else {
        toast.error(response.error || "Payment failed");
      }
    } catch (error) {
      toast.error("Error processing payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12 bg-gradient-to-b from-white via-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Make Payment
            </h1>
            <p className="text-muted-foreground">Pay for completed services</p>
          </div>

          {paymentStatus.status !== "idle" && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                paymentStatus.status === "success"
                  ? "bg-green-50 border border-green-200"
                  : paymentStatus.status === "failed"
                    ? "bg-red-50 border border-red-200"
                    : "bg-blue-50 border border-blue-200"
              }`}
            >
              {paymentStatus.status === "processing" ? (
                <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
              ) : paymentStatus.status === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-semibold ${
                    paymentStatus.status === "success"
                      ? "text-green-900"
                      : paymentStatus.status === "failed"
                        ? "text-red-900"
                        : "text-blue-900"
                  }`}
                >
                  {paymentStatus.message}
                </p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Unpaid Bookings List */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Unpaid Services
                </h2>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {bookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No unpaid services
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div
                        key={booking.id}
                        onClick={() => {
                          setSelectedBooking(booking);
                          setPaymentData((prev) => ({
                            ...prev,
                            bookingId: booking.id,
                            amount: booking.amount || 0,
                            description: booking.description || "",
                          }));
                        }}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedBooking?.id === booking.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary/50"
                        }`}
                      >
                        <div className="font-semibold text-foreground text-sm">
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {booking.description}
                        </div>
                        {booking.amount && (
                          <div className="text-sm font-semibold text-primary mt-2">
                            {booking.amount.toLocaleString()} RWF
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
                {selectedBooking ? (
                  <>
                    <h2 className="text-2xl font-bold text-foreground mb-6">
                      Payment Details
                    </h2>

                    {paymentData.paymentMethod === "flutterwave" ? (
                      <form
                        onSubmit={handleFlutterwavePayment}
                        className="space-y-6"
                      >
                        {/* Amount */}
                        <div>
                          <label
                            htmlFor="amount"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Amount (RWF) *
                          </label>
                          <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={paymentData.amount}
                            onChange={handlePaymentChange}
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          {errors.amount && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.amount}
                            </p>
                          )}
                        </div>

                        {/* Payment Method */}
                        <div>
                          <label
                            htmlFor="paymentMethod"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Payment Method *
                          </label>
                          <select
                            id="paymentMethod"
                            name="paymentMethod"
                            value={paymentData.paymentMethod}
                            onChange={handlePaymentChange}
                            disabled={isLoadingMethods}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                          >
                            <option value="">
                              {isLoadingMethods
                                ? "Loading..."
                                : "Select Payment Method"}
                            </option>
                            {paymentMethods.length > 0 ? (
                              paymentMethods.map((method) => (
                                <option
                                  key={method.id}
                                  value={method.name
                                    .toLowerCase()
                                    .replace(/\s+/g, "_")}
                                >
                                  {method.name}
                                </option>
                              ))
                            ) : (
                              <>
                                <option value="flutterwave">
                                  Flutterwave (Card/Mobile Money)
                                </option>
                                <option value="bank_transfer">
                                  Bank Transfer
                                </option>
                                <option value="cash">Cash Payment</option>
                              </>
                            )}
                          </select>
                        </div>

                        {/* Description */}
                        <div>
                          <label
                            htmlFor="description"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            value={paymentData.description}
                            onChange={handlePaymentChange}
                            rows={3}
                            placeholder="Add any notes or references..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>

                        {/* Info Box */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">
                            You will be redirected to Flutterwave to complete
                            the payment securely.
                          </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                          >
                            <CreditCard className="w-4 h-4" />
                            {loading ? "Processing..." : "Pay with Flutterwave"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(null)}
                            className="flex-1 px-6 py-3 border border-gray-300 text-foreground font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleOtherPayment} className="space-y-6">
                        {/* Amount */}
                        <div>
                          <label
                            htmlFor="amount"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Amount (RWF) *
                          </label>
                          <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={paymentData.amount}
                            onChange={handlePaymentChange}
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          {errors.amount && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.amount}
                            </p>
                          )}
                        </div>

                        {/* Payment Method */}
                        <div>
                          <label
                            htmlFor="paymentMethod"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Payment Method *
                          </label>
                          <select
                            id="paymentMethod"
                            name="paymentMethod"
                            value={paymentData.paymentMethod}
                            onChange={handlePaymentChange}
                            disabled={isLoadingMethods}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                          >
                            <option value="">
                              {isLoadingMethods
                                ? "Loading..."
                                : "Select Payment Method"}
                            </option>
                            {paymentMethods.length > 0 ? (
                              paymentMethods.map((method) => (
                                <option
                                  key={method.id}
                                  value={method.name
                                    .toLowerCase()
                                    .replace(/\s+/g, "_")}
                                >
                                  {method.name}
                                </option>
                              ))
                            ) : (
                              <>
                                <option value="flutterwave">
                                  Flutterwave (Card/Mobile Money)
                                </option>
                                <option value="bank_transfer">
                                  Bank Transfer
                                </option>
                                <option value="cash">Cash Payment</option>
                              </>
                            )}
                          </select>
                        </div>

                        {/* Description */}
                        <div>
                          <label
                            htmlFor="description"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            value={paymentData.description}
                            onChange={handlePaymentChange}
                            rows={3}
                            placeholder="Add any notes or references..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>

                        {/* Info Box */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">
                            {paymentData.paymentMethod === "cash"
                              ? "Payment will be recorded as cash payment. Please coordinate with the worker."
                              : "Please proceed with bank transfer to the provided details."}
                          </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                          >
                            {loading ? "Processing..." : "Record Payment"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(null)}
                            className="flex-1 px-6 py-3 border border-gray-300 text-foreground font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select an unpaid service to proceed with payment
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
