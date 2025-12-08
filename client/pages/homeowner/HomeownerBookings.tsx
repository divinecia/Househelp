import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getBookings, updateBooking } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit2,
} from "lucide-react";

interface Booking {
  id: string;
  worker_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  service_type: string;
  description: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  payment_status: "unpaid" | "paid" | "refunded";
  amount?: number;
  created_at?: string;
}

export default function HomeownerBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBookings();
      if (response.success && Array.isArray(response.data)) {
        setBookings(response.data);
      } else {
        toast.error("Failed to load bookings");
      }
    } catch (error) {
      toast.error("Error loading bookings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterBookings = useCallback((status: string) => {
    if (status === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter((b) => b.status === status));
    }
  }, [bookings]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    filterBookings(selectedStatus);
  }, [filterBookings, selectedStatus]);

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      const response = await updateBooking(selectedBooking.id, {
        status: "cancelled",
        cancelReason: cancelReason,
      });

      if (response.success) {
        toast.success("Booking cancelled successfully");
        setShowCancelModal(false);
        setCancelReason("");
        setSelectedBooking(null);
        fetchBookings();
      } else {
        toast.error(response.error || "Failed to cancel booking");
      }
    } catch (error) {
      toast.error("Error cancelling booking");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-green-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      case "confirmed":
        return "bg-blue-50 border-blue-200";
      case "in_progress":
        return "bg-green-50 border-green-200";
      case "completed":
        return "bg-green-100 border-green-300";
      case "cancelled":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-700";
      case "confirmed":
        return "text-blue-700";
      case "in_progress":
        return "text-green-700";
      case "completed":
        return "text-green-800";
      case "cancelled":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12 bg-gradient-to-b from-white via-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              My Bookings
            </h1>
            <p className="text-muted-foreground">
              Manage and track your service bookings
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => navigate("/homeowner/booking")}
              className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              New Booking
            </button>
            <button
              onClick={() => navigate("/homeowner/payments")}
              className="px-6 py-2 border border-gray-300 text-foreground font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Payments
            </button>
          </div>

          {/* Status Filter */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {[
              "all",
              "pending",
              "confirmed",
              "in_progress",
              "completed",
              "cancelled",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === status
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-foreground hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() +
                  status.slice(1).replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading bookings...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No bookings found</p>
              <button
                onClick={() => navigate("/homeowner/booking")}
                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90"
              >
                Create New Booking
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`border-2 rounded-lg p-6 ${getStatusColor(booking.status)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(booking.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {booking.service_type}
                        </h3>
                        <p
                          className={`text-sm font-medium ${statusBadgeColor(booking.status)}`}
                        >
                          {booking.status.toUpperCase().replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {booking.amount && (
                        <div className="text-2xl font-bold text-foreground">
                          {booking.amount.toLocaleString()} RWF
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {booking.payment_status === "unpaid"
                          ? "Unpaid"
                          : "Paid"}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="text-sm font-medium text-foreground">
                          {booking.start_time} - {booking.end_time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Worker ID
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {booking.worker_id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 pb-4 border-t border-current border-opacity-20">
                    <p className="text-sm text-foreground mt-4">
                      <span className="font-semibold">Description:</span>{" "}
                      {booking.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {booking.status === "completed" &&
                      booking.payment_status === "unpaid" && (
                        <button
                          onClick={() => navigate("/homeowner/payments")}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Pay Now
                        </button>
                      )}

                    {booking.status === "pending" && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowCancelModal(true);
                        }}
                        className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-4 py-2 border border-gray-300 text-foreground rounded-lg hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Cancel Booking
            </h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to cancel this booking?
            </p>

            <textarea
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Cancel
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-foreground rounded-lg hover:bg-gray-50"
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
