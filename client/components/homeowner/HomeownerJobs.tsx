import { useState } from "react";
import { Eye, User } from "lucide-react";

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

  const [jobs] = useState<Job[]>([
    {
      id: "1",
      title: "House Cleaning",
      worker: "John Doe",
      status: "pending",
      budget: 50000,
    },
    {
      id: "2",
      title: "Cooking Services",
      worker: "Sarah Johnson",
      status: "completed",
      budget: 75000,
      completedDate: "2024-01-27",
      rating: 5,
      review: "Excellent work! Very professional and thorough.",
    },
    {
      id: "3",
      title: "Garden Maintenance",
      worker: "Mike Smith",
      status: "completed",
      budget: 40000,
      completedDate: "2024-01-20",
      rating: 4,
      review: "Good job, very satisfied with the results.",
    },
  ]);

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
