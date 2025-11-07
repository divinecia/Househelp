import { useState } from "react";
import { Plus, Trash2, Edit2, Eye } from "lucide-react";

interface Booking {
  id: string;
  jobTitle: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "pending" | "accepted" | "completed";
  budget: number;
}

export default function HomeownerBooking() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "1",
      jobTitle: "House Cleaning",
      scheduledDate: "2024-01-28",
      scheduledTime: "10:00",
      status: "pending",
      budget: 50000,
    },
    {
      id: "2",
      jobTitle: "Cooking Services",
      scheduledDate: "2024-01-29",
      scheduledTime: "14:00",
      status: "accepted",
      budget: 75000,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    scheduledDate: "",
    scheduledTime: "",
    budget: "",
  });

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.jobTitle && formData.scheduledDate) {
      const newBooking: Booking = {
        id: Date.now().toString(),
        jobTitle: formData.jobTitle,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        status: "pending",
        budget: parseInt(formData.budget) || 0,
      };
      setBookings([...bookings, newBooking]);
      setFormData({ jobTitle: "", scheduledDate: "", scheduledTime: "", budget: "" });
      setShowForm(false);
    }
  };

  const handleDeleteBooking = (id: string) => {
    setBookings(bookings.filter((b) => b.id !== id));
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
              className="md:col-span-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Booking
            </button>
          </form>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Job Title</th>
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
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{booking.jobTitle}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{booking.scheduledDate}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{booking.scheduledTime}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "accepted"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    {booking.budget.toLocaleString()} RWF
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit">
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
        </div>
      </div>
    </div>
  );
}
