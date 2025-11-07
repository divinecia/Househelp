import { useState } from "react";
import { Eye } from "lucide-react";

interface Booking {
  id: string;
  jobTitle: string;
  homeowner: string;
  worker: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  budget: number;
  scheduledDate: string;
}

export default function AdminBooking() {
  const [activeTab, setActiveTab] = useState<"all" | "payment" | "jobs" | "services">("all");
  const [bookings] = useState<Booking[]>([
    {
      id: "1",
      jobTitle: "House Cleaning",
      homeowner: "Alice Johnson",
      worker: "John Doe",
      status: "in_progress",
      budget: 50000,
      scheduledDate: "2024-01-28",
    },
    {
      id: "2",
      jobTitle: "Cooking Services",
      homeowner: "Bob Wilson",
      worker: "Jane Smith",
      status: "completed",
      budget: 75000,
      scheduledDate: "2024-01-25",
    },
  ]);

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
