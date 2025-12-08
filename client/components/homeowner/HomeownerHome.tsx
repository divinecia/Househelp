import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Clock,
  DollarSign,
  Users,
  Star,
  MapPin,
  Calendar,
  Briefcase,
} from "lucide-react";

interface QuickStat {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

interface RecentJob {
  id: string;
  service: string;
  worker: string;
  date: string;
  status: "completed" | "in-progress" | "scheduled";
  amount: number;
  rating?: number;
}

interface UpcomingBooking {
  id: string;
  service: string;
  worker: string;
  date: string;
  time: string;
  location: string;
}

export default function HomeownerHome() {
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // TODO: Replace with actual API calls
      // Mock data for quick stats
      const mockQuickStats: QuickStat[] = [
        {
          title: "Total Jobs",
          value: "24",
          icon: <Clock size={24} />,
          color: "bg-blue-500",
        },
        {
          title: "Total Spent",
          value: "RWF 485,000",
          icon: <DollarSign size={24} />,
          color: "bg-green-500",
        },
        {
          title: "Active Workers",
          value: "6",
          icon: <Users size={24} />,
          color: "bg-purple-500",
        },
        {
          title: "Avg Rating",
          value: "4.8",
          icon: <Star size={24} />,
          color: "bg-yellow-500",
        },
      ];

      // Mock data for recent jobs
      const mockRecentJobs: RecentJob[] = [
        {
          id: "1",
          service: "House Cleaning",
          worker: "Alice Mukamana",
          date: "2024-01-14",
          status: "completed",
          amount: 25000,
          rating: 5,
        },
        {
          id: "2",
          service: "Laundry Service",
          worker: "Jean Baptiste",
          date: "2024-01-13",
          status: "completed",
          amount: 15000,
          rating: 4,
        },
        {
          id: "3",
          service: "Garden Maintenance",
          worker: "Marie Claire",
          date: "2024-01-12",
          status: "completed",
          amount: 30000,
          rating: 5,
        },
      ];

      // Mock data for upcoming bookings
      const mockUpcomingBookings: UpcomingBooking[] = [
        {
          id: "1",
          service: "Deep Cleaning",
          worker: "Alice Mukamana",
          date: "2024-01-16",
          time: "09:00",
          location: "Kigali, Kimihurura",
        },
        {
          id: "2",
          service: "Carpet Cleaning",
          worker: "Jean Baptiste",
          date: "2024-01-17",
          time: "14:00",
          location: "Kigali, Remera",
        },
      ];

      setQuickStats(mockQuickStats);
      setRecentJobs(mockRecentJobs);
      setUpcomingBookings(mockUpcomingBookings);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: RecentJob["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "scheduled":
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Link
          to="/homeowner/booking"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Book New Service
        </Link>
        <Link
          to="/homeowner/jobs"
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          View All Jobs
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Bookings
            </h3>
            <Link
              to="/homeowner/booking"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              View All
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No upcoming bookings</p>
              <Link
                to="/homeowner/booking"
                className="text-blue-600 hover:text-blue-500 mt-2 inline-block"
              >
                Book your first service
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {booking.service}
                    </h4>
                    <p className="text-sm text-gray-600">{booking.worker}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin size={14} className="mr-1" />
                      {booking.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{booking.date}</p>
                    <p className="text-sm text-gray-600">{booking.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
            <Link
              to="/homeowner/jobs"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              View All
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No recent jobs</p>
              <Link
                to="/homeowner/booking"
                className="text-blue-600 hover:text-blue-500 mt-2 inline-block"
              >
                Book your first service
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{job.service}</h4>
                    <p className="text-sm text-gray-600">{job.worker}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}
                      >
                        {job.status}
                      </span>
                      {job.rating && (
                        <div className="flex items-center">
                          <Star
                            size={14}
                            className="text-yellow-400 fill-current"
                          />
                          <span className="text-sm text-gray-600 ml-1">
                            {job.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      RWF {job.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">{job.date}</p>
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
