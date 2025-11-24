import { useState, useEffect } from "react";
import { Eye, User, Loader } from "lucide-react";
import { getUser } from "@/lib/auth";
import type { HomeownerData } from "@/lib/auth";
import { getBookings, getWorkers } from "@/lib/api-client";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  worker: string;
  status: "pending" | "completed" | "cancelled";
  budget: number;
  completedDate?: string;
  rating?: number;
  review?: string;
}

export default function HomeownerJobs() {
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "history">("pending");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const user = getUser("homeowner") as unknown as HomeownerData & { id?: string };
        
        if (!user?.id) {
          toast.error("User not found");
          return;
        }

        const response = await getBookings({ homeowner_id: user.id });
        
        if (response.success && response.data) {
          // Transform booking data to job format
          const transformedJobs: Job[] = response.data.map((booking: any) => ({
            id: booking.id,
            title: booking.service_type || booking.jobTitle || "Service",
            worker: booking.worker_name || booking.worker?.full_name || "Pending Assignment",
            status: booking.status || "pending",
            budget: parseFloat(booking.amount) || parseFloat(booking.budget) || 0,
            completedDate: booking.completed_date || booking.completedAt,
            rating: booking.rating,
            review: booking.review,
          }));
          
          setJobs(transformedJobs);
        } else {
          toast.error("Failed to load jobs");
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Error loading jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const tabs = ["pending", "completed", "history"] as const;

  const filteredJobs = jobs.filter((j) => {
    if (activeTab === "pending") return j.status === "pending";
    if (activeTab === "completed") return j.status === "completed";
    return true;
  });

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
            {tab} Jobs
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No {activeTab} jobs</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <User size={16} />
                    <span>{job.worker}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    job.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : job.status === "pending"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>

              <div className="py-4 border-t border-b border-gray-200">
                <p className="text-sm text-muted-foreground mb-1">Budget</p>
                <p className="font-bold text-foreground text-lg">{job.budget.toLocaleString()} RWF</p>
              </div>

              {job.completedDate && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Completed: {job.completedDate}</p>
                  {job.rating && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < job.rating! ? "text-yellow-400" : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {job.review && <p className="text-sm text-foreground italic">"{job.review}"</p>}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <Eye size={16} />
                  View Details
                </button>
                {job.status === "pending" && (
                  <button className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}