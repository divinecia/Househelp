import { useState, useEffect } from "react";
import {
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
} from "lucide-react";

interface QuickStat {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

interface Job {
  id: string;
  service: string;
  homeowner: string;
  date: string;
  time: string;
  location: string;
  status: "pending" | "in-progress" | "completed";
  amount: number;
}

export default function WorkerHome() {
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<Job[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockQuickStats: QuickStat[] = [
        {
          title: "Jobs Completed",
          value: "42",
          icon: <CheckCircle size={24} />,
          color: "bg-green-500",
        },
        {
          title: "This Month",
          value: "RWF 125,000",
          icon: <DollarSign size={24} />,
          color: "bg-blue-500",
        },
        {
          title: "Pending Jobs",
          value: "3",
          icon: <Clock size={24} />,
          color: "bg-yellow-500",
        },
        {
          title: "Rating",
          value: "4.8",
          icon: <AlertCircle size={24} />,
          color: "bg-purple-500",
        },
      ];

      const mockUpcomingJobs: Job[] = [
        {
          id: "1",
          service: "House Cleaning",
          homeowner: "John Doe",
          date: "2025-12-07",
          time: "09:00",
          location: "Kigali, Kimihurura",
          status: "pending",
          amount: 25000,
        },
        {
          id: "2",
          service: "Garden Maintenance",
          homeowner: "Jane Smith",
          date: "2025-12-08",
          time: "14:00",
          location: "Kigali, Remera",
          status: "pending",
          amount: 30000,
        },
      ];

      const mockRecentJobs: Job[] = [
        {
          id: "3",
          service: "Laundry Service",
          homeowner: "Marie Claire",
          date: "2025-12-05",
          time: "10:00",
          location: "Kigali, Nyarutarama",
          status: "completed",
          amount: 15000,
        },
        {
          id: "4",
          service: "House Cleaning",
          homeowner: "Peter Johnson",
          date: "2025-12-04",
          time: "08:00",
          location: "Kigali, Kacyiru",
          status: "completed",
          amount: 25000,
        },
      ];

      setQuickStats(mockQuickStats);
      setUpcomingJobs(mockUpcomingJobs);
      setRecentJobs(mockRecentJobs);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-full text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Jobs */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Jobs
          </h3>

          {upcomingJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No upcoming jobs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingJobs.map((job) => (
                <div key={job.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {job.service}
                      </h4>
                      <p className="text-sm text-gray-600">{job.homeowner}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Calendar size={14} className="mr-1" />
                    {job.date} at {job.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin size={14} className="mr-1" />
                    {job.location}
                  </div>
                  <div className="mt-2 font-medium text-gray-900">
                    RWF {job.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Jobs
          </h3>

          {recentJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No recent jobs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {job.service}
                      </h4>
                      <p className="text-sm text-gray-600">{job.homeowner}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Calendar size={14} className="mr-1" />
                    {job.date} at {job.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin size={14} className="mr-1" />
                    {job.location}
                  </div>
                  <div className="mt-2 font-medium text-gray-900">
                    RWF {job.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
