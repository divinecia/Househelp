import { useState, useEffect } from "react";
import { Eye, Plus } from "lucide-react";
import { getBookings, getWorkers, getHomeowners, apiPost } from "@/lib/api-client";
import { toast } from "sonner";

interface Booking {
  id: string;
  service_type: string;
  homeowner_id: string;
  worker_id: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  amount: number;
  booking_date: string;
  homeowner_name?: string;
  worker_name?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "active" | "inactive";
}

export default function AdminBooking() {
  const [activeTab, setActiveTab] = useState<"all" | "payment" | "jobs" | "services">("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [homeowners, setHomeowners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    workerName: "",
    homeownerName: "",
    serviceType: "",
    amount: "",
    date: "",
  });
  const [serviceFormData, setServiceFormData] = useState({
    name: "",
    description: "",
    category: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, workersRes, homeownersRes] = await Promise.all([
        getBookings(),
        getWorkers(),
        getHomeowners(),
      ]);

      if (bookingsRes.success && bookingsRes.data) {
        const enrichedBookings = bookingsRes.data.map((booking: any) => {
          const worker = workersRes.data?.find((w: any) => w.id === booking.worker_id);
          const homeowner = homeownersRes.data?.find(
            (h: any) => h.id === booking.homeowner_id
          );
          return {
            ...booking,
            worker_name: worker?.full_name || "Unknown",
            homeowner_name: homeowner?.full_name || "Unknown",
          };
        });
        setBookings(enrichedBookings);
      }

      if (workersRes.success && workersRes.data) {
        setWorkers(workersRes.data);
      }

      if (homeownersRes.success && homeownersRes.data) {
        setHomeowners(homeownersRes.data);
      }
    } catch (error) {
      toast.error("Error fetching data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobFormData.workerName || !jobFormData.homeownerName || !jobFormData.serviceType) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const result = await apiPost("/bookings", {
        worker_id: jobFormData.workerName,
        homeowner_id: jobFormData.homeownerName,
        service_type: jobFormData.serviceType,
        amount: parseFloat(jobFormData.amount),
        booking_date: jobFormData.date,
        status: "pending",
      });

      if (result.success) {
        toast.success("Job assigned successfully");
        setJobFormData({
          workerName: "",
          homeownerName: "",
          serviceType: "",
          amount: "",
          date: "",
        });
        setShowJobForm(false);
        await fetchData();
      } else {
        toast.error(result.error || "Failed to add job");
      }
    } catch (error) {
      toast.error("Error adding job");
      console.error(error);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.name || !serviceFormData.category) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const result = await apiPost("/services", {
        name: serviceFormData.name,
        description: serviceFormData.description,
        category: serviceFormData.category,
        status: "active",
      });

      if (result.success) {
        toast.success("Service added successfully");
        setServiceFormData({ name: "", description: "", category: "" });
        setShowServiceForm(false);
        await fetchData();
      } else {
        toast.error(result.error || "Failed to add service");
      }
    } catch (error) {
      toast.error("Error adding service");
      console.error(error);
    }
  }

  const tabs = ["all", "payment", "jobs", "services"] as const;

  const renderContent = () => {
    switch (activeTab) {
      case "payment":
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Payment Breakdown</h3>
            <div className="space-y-3">
              {bookings.map((booking) => {
                const fees = {
                  platform: booking.budget * 0.01,
                  welfare: booking.budget * 0.07,
                  insurance: booking.budget * 0.05,
                  tax: booking.budget * 0.02,
                  workerEarns: booking.budget - (booking.budget * 0.01 + booking.budget * 0.07 + booking.budget * 0.05 + booking.budget * 0.02),
                };
                return (
                  <div key={booking.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-semibold text-foreground mb-3">{booking.jobTitle}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>Total: <span className="font-medium">{booking.budget.toLocaleString()} RWF</span></p>
                      <p>Platform Fee (1%): <span className="font-medium text-red-600">-{fees.platform.toLocaleString()} RWF</span></p>
                      <p>Welfare (7%): <span className="font-medium text-red-600">-{fees.welfare.toLocaleString()} RWF</span></p>
                      <p>Insurance (5%): <span className="font-medium text-red-600">-{fees.insurance.toLocaleString()} RWF</span></p>
                      <p>Tax (2%): <span className="font-medium text-red-600">-{fees.tax.toLocaleString()} RWF</span></p>
                      <p>Worker Earns: <span className="font-medium text-green-600">{fees.workerEarns.toLocaleString()} RWF</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "jobs":
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Job Assignment</h3>
            <p className="text-muted-foreground">Assign workers to jobs and manage matching</p>
          </div>
        );
      case "services":
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Services Management</h3>
            <p className="text-muted-foreground">Manage available services</p>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Job Title</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Homeowner</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Worker</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Budget</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{booking.jobTitle}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{booking.homeowner}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{booking.worker}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === "completed" ? "bg-green-100 text-green-700" :
                          booking.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{booking.budget.toLocaleString()} RWF</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{booking.scheduledDate}</td>
                      <td className="px-6 py-4 text-sm">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
