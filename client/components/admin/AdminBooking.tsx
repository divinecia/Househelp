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
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : bookings.length === 0 ? (
                <p className="text-muted-foreground">No bookings yet</p>
              ) : (
                bookings.map((booking) => {
                  const amount = parseFloat(booking.amount?.toString() || "0");
                  const fees = {
                    platform: amount * 0.01,
                    welfare: amount * 0.07,
                    insurance: amount * 0.05,
                    tax: amount * 0.02,
                    workerEarns:
                      amount -
                      (amount * 0.01 + amount * 0.07 + amount * 0.05 + amount * 0.02),
                  };
                  return (
                    <div
                      key={booking.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="font-semibold text-foreground mb-3">{booking.service_type}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p>
                          Total:{" "}
                          <span className="font-medium">
                            {amount.toLocaleString()} RWF
                          </span>
                        </p>
                        <p>
                          Platform Fee (1%):{" "}
                          <span className="font-medium text-red-600">
                            -{fees.platform.toLocaleString()}
                          </span>
                        </p>
                        <p>
                          Welfare (7%):{" "}
                          <span className="font-medium text-red-600">
                            -{fees.welfare.toLocaleString()}
                          </span>
                        </p>
                        <p>
                          Insurance (5%):{" "}
                          <span className="font-medium text-red-600">
                            -{fees.insurance.toLocaleString()}
                          </span>
                        </p>
                        <p>
                          Tax (2%):{" "}
                          <span className="font-medium text-red-600">
                            -{fees.tax.toLocaleString()}
                          </span>
                        </p>
                        <p>
                          Worker Earns:{" "}
                          <span className="font-medium text-green-600">
                            {fees.workerEarns.toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      case "jobs":
        return (
          <div className="space-y-6">
            <button
              onClick={() => setShowJobForm(!showJobForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} />
              Assign New Job
            </button>

            {showJobForm && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Assign Job to Worker
                </h3>
                <form
                  onSubmit={handleAddJob}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <select
                    value={jobFormData.homeownerName}
                    onChange={(e) =>
                      setJobFormData({
                        ...jobFormData,
                        homeownerName: e.target.value,
                      })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select Homeowner</option>
                    {homeowners.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.full_name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={jobFormData.workerName}
                    onChange={(e) =>
                      setJobFormData({ ...jobFormData, workerName: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select Worker</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.full_name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Service Type"
                    value={jobFormData.serviceType}
                    onChange={(e) =>
                      setJobFormData({
                        ...jobFormData,
                        serviceType: e.target.value,
                      })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />

                  <input
                    type="number"
                    placeholder="Amount (RWF)"
                    value={jobFormData.amount}
                    onChange={(e) =>
                      setJobFormData({ ...jobFormData, amount: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />

                  <input
                    type="date"
                    value={jobFormData.date}
                    onChange={(e) =>
                      setJobFormData({ ...jobFormData, date: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />

                  <button
                    type="submit"
                    className="md:col-span-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Assign Job
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="p-6 text-center text-muted-foreground">Loading...</div>
                ) : bookings.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No jobs assigned yet
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                          Homeowner
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                          Worker
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-foreground font-medium">
                            {booking.service_type}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {booking.homeowner_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {booking.worker_name}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                booking.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : booking.status === "in_progress"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Eye size={16} />
                            </button>
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

      case "services":
        return (
          <div className="space-y-6">
            <button
              onClick={() => setShowServiceForm(!showServiceForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} />
              Add New Service
            </button>

            {showServiceForm && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Add New Service
                </h3>
                <form
                  onSubmit={handleAddService}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <input
                    type="text"
                    placeholder="Service Name"
                    value={serviceFormData.name}
                    onChange={(e) =>
                      setServiceFormData({ ...serviceFormData, name: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Category"
                    value={serviceFormData.category}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        category: e.target.value,
                      })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />

                  <textarea
                    placeholder="Description"
                    value={serviceFormData.description}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        description: e.target.value,
                      })
                    }
                    className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                  />

                  <button
                    type="submit"
                    className="md:col-span-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Add Service
                  </button>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <p className="text-muted-foreground">Loading services...</p>
              ) : services.length === 0 ? (
                <p className="text-muted-foreground">No services yet</p>
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                  >
                    <h4 className="font-semibold text-foreground mb-2">
                      {service.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {service.category}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          service.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground">Loading...</div>
              ) : bookings.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No bookings yet
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                        Homeowner
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                        Worker
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          {booking.service_type}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {booking.homeowner_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {booking.worker_name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "in_progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          {parseFloat(booking.amount?.toString() || "0").toLocaleString()} RWF
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
