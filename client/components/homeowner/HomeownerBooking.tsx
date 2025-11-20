import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Eye, Loader } from "lucide-react";
import { getUser } from "@/lib/auth";
import type { HomeownerData } from "@/lib/auth";
import {
  getBookings,
  createBooking,
  deleteBooking,
} from "@/lib/api-client";
import { toast } from "sonner";

interface Booking {
  id: string;
  service_type?: string;
  jobTitle?: string;
  booking_date?: string;
  scheduledDate?: string;
  scheduled_time?: string;
  scheduledTime?: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  amount?: number;
  budget?: number;
  worker_name?: string;
}

export default function HomeownerBooking() {
  const user = getUser("homeowner") as unknown as HomeownerData & { id?: string };
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    scheduledDate: "",
    scheduledTime: "",
    budget: "",
  });

  useEffect(() => {
    fetchBookings();
  }, [user?.id]);

  const fetchBookings = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await getBookings({ homeowner_id: user.id });
      if (response.success && response.data) {
          const formattedBookings = Array.isArray(response.data) 
            ? response.data.map((booking: any) => ({
                id: booking.id,
                service_type: booking.service_type || "Service",
                jobTitle: booking.service_type || "Service",
                booking_date: booking.booking_date,
                scheduledDate: booking.booking_date,
                scheduled_time: booking.scheduled_time,
                scheduledTime: booking.scheduled_time,
                status: booking.status || "pending",
                amount: booking.amount,
                budget: booking.amount ? parseFloat(booking.amount) : 0,
                worker_name: booking.worker_id || "Pending Assignment",
              }))
            : [];
          setBookings(formattedBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.jobTitle || !formData.scheduledDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user?.id) {
      toast.error("User not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createBooking({
        homeowner_id: user.id,
        service_type: formData.jobTitle,
        booking_date: formData.scheduledDate,
        scheduled_time: formData.scheduledTime || null,
        amount: parseInt(formData.budget) || 0,
        status: "pending",
      });

      if (response.success) {
        toast.success("Booking created successfully!");
        setFormData({
          jobTitle: "",
          scheduledDate: "",
          scheduledTime: "",
          budget: "",
        });
        setShowForm(false);
        await fetchBookings();
      } else {
        toast.error(response.error || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Error creating booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const response = await deleteBooking(id);
      if (response.success) {
        toast.success("Booking deleted successfully");
        setBookings(bookings.filter((b) => b.id !== id));
      } else {
        toast.error(response.error || "Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Error deleting booking");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Booking Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Plus size={18} />
        Add New Booking
      </button>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Create New Booking</h3>
          <form onSubmit={handleAddBooking} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Job Title"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <input
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Budget (RWF)"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="md:col-span-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader size={18} className="animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Booking"}
            </button>
          </form>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader size={20} className="animate-spin" />
              <span>Loading bookings...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No bookings yet</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Service</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Budget</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {booking.jobTitle || booking.service_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {booking.scheduledDate || booking.booking_date
                          ? new Date(
                              booking.scheduledDate || booking.booking_date || ""
                            ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {booking.scheduledTime || booking.scheduled_time || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : booking.status === "accepted"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {booking.budget ? booking.budget.toLocaleString() : 0} RWF
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
