import { useEffect, useState } from "react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { apiGet } from "../../lib/api-client";

interface Job {
  id: string;
  title?: string;
  service_type?: string;
  homeowner?: string;
  homeowner_id?: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  scheduledDate?: string;
  booking_date?: string;
  budget?: number;
  amount?: number;
  payment_status?: string;
}

export default function WorkerHome() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeownersMap, setHomeownersMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch bookings (jobs)
        const bookingsRes = await apiGet("/bookings");
        const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];

        // Fetch homeowners to map IDs to names
        const homeownersRes = await apiGet("/homeowners");
        const homeowners = Array.isArray(homeownersRes.data) ? homeownersRes.data : [];

        const homeownerMap: Record<string, string> = {};
        homeowners.forEach((homeowner: any) => {
          homeownerMap[homeowner.id] = homeowner.full_name || "Unknown";
        });
        setHomeownersMap(homeownerMap);

        // Map bookings to jobs format
        const jobsList: Job[] = bookings.map((booking: any) => ({
          id: booking.id,
          title: booking.service_type || "Service",
          service_type: booking.service_type,
          homeowner: homeownerMap[booking.homeowner_id] || "Unknown",
          homeowner_id: booking.homeowner_id,
          status: mapBookingStatus(booking.status),
          scheduledDate: booking.booking_date,
          booking_date: booking.booking_date,
          budget: booking.amount ? parseFloat(booking.amount) : 0,
          amount: booking.amount,
          payment_status: booking.payment_status,
        }));

        setJobs(jobsList);
      } catch (error) {
        console.error("Error fetching worker home data:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const mapBookingStatus = (status: string): Job["status"] => {
    const statusMap: Record<string, Job["status"]> = {
      pending: "pending",
      confirmed: "confirmed",
      in_progress: "in_progress",
      completed: "completed",
      cancelled: "cancelled",
    };
    return statusMap[status] || "pending";
  };

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-orange-100 text-orange-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "payment_pending":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: Job["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5" />;
      case "in_progress":
        return <Clock className="w-5 h-5" />;
      case "payment_pending":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Assigned Jobs</p>
          <p className="text-2xl font-bold text-foreground">3</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl font-bold text-orange-600">1</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Pending Payments</p>
          <p className="text-2xl font-bold text-red-600">125,000 RWF</p>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">My Jobs</h2>
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                <p className="text-sm text-muted-foreground">For: {job.homeowner}</p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                {getStatusIcon(job.status)}
                <span className="capitalize">{job.status.replace("_", " ")}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-t border-b border-gray-200">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Scheduled Date</p>
                <p className="font-medium text-foreground">{job.scheduledDate}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Budget</p>
                <p className="font-medium text-foreground">{job.budget.toLocaleString()} RWF</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Earnings</p>
                <p className="font-medium text-green-600">{(job.budget * 0.85).toLocaleString()} RWF</p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                View Details
              </button>
              {job.status === "payment_pending" && (
                <button className="flex-1 px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium">
                  Request Payment
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
