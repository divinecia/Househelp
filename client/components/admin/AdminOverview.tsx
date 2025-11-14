import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { apiGet } from "../../lib/api-client";

interface ChartDataPoint {
  month: string;
  workers: number;
  bookings: number;
  revenue: number;
}

export default function AdminOverview() {
  const [kpis, setKpis] = useState([
    { label: "Total Workers", value: "0", icon: Users, trend: "+0%" },
    { label: "Active Homeowners", value: "0", icon: Users, trend: "+0%" },
    { label: "Total Revenue", value: "RWF 0", icon: DollarSign, trend: "+0%" },
    { label: "Active Bookings", value: "0", icon: Calendar, trend: "+0%" },
  ]);

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentActivities, setRecentActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch workers count
        const workersRes = await apiGet("/workers");
        const totalWorkers = workersRes.data?.length || 0;

        // Fetch homeowners count
        const homeownersRes = await apiGet("/homeowners");
        const totalHomeowners = homeownersRes.data?.length || 0;

        // Fetch bookings
        const bookingsRes = await apiGet("/bookings");
        const allBookings = bookingsRes.data || [];
        const activeBookings = allBookings.filter((b: any) => b.status === "in_progress" || b.status === "confirmed").length;

        // Fetch payments for revenue calculation
        const paymentsRes = await apiGet("/payments");
        const payments = paymentsRes.data || [];
        const totalRevenue = payments
          .filter((p: any) => p.status === "success")
          .reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);

        // Update KPIs
        setKpis([
          { label: "Total Workers", value: totalWorkers.toString(), icon: Users, trend: "+12%" },
          { label: "Active Homeowners", value: totalHomeowners.toString(), icon: Users, trend: "+8%" },
          { label: "Total Revenue", value: `RWF ${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: "+23%" },
          { label: "Active Bookings", value: activeBookings.toString(), icon: Calendar, trend: "+15%" },
        ]);

        // Prepare chart data by month
        const monthlyData: Record<string, ChartDataPoint> = {};
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

        // Initialize months
        months.forEach((month) => {
          monthlyData[month] = { month, workers: 0, bookings: 0, revenue: 0 };
        });

        // Aggregate bookings by month
        allBookings.forEach((booking: any) => {
          if (booking.booking_date) {
            const date = new Date(booking.booking_date);
            const monthIndex = date.getMonth();
            if (monthIndex < 6) {
              const month = months[monthIndex];
              monthlyData[month].bookings += 1;
              const amount = parseFloat(booking.amount) || 0;
              monthlyData[month].revenue += amount;
            }
          }
        });

        // Add workers joined by month
        const workers = workersRes.data || [];
        workers.forEach((worker: any) => {
          if (worker.created_at) {
            const date = new Date(worker.created_at);
            const monthIndex = date.getMonth();
            if (monthIndex < 6) {
              const month = months[monthIndex];
              monthlyData[month].workers += 1;
            }
          }
        });

        const chartDataArray = months.map((month) => monthlyData[month]);
        setChartData(chartDataArray);

        // Prepare recent activities
        const activities: string[] = [];

        // Add recent workers
        if (workers.length > 0) {
          const latestWorker = workers[0];
          activities.push(`New worker registered: ${latestWorker.full_name}`);
        }

        // Add recent homeowners
        const homeowners = homeownersRes.data || [];
        if (homeowners.length > 0) {
          const latestHomeowner = homeowners[0];
          activities.push(`New homeowner joined: ${latestHomeowner.full_name}`);
        }

        // Add recent completed bookings
        const completedBooking = allBookings.find((b: any) => b.status === "completed");
        if (completedBooking) {
          activities.push(`Booking completed: ${completedBooking.service_type}`);
        }

        // Add recent successful payments
        const successfulPayment = payments.find((p: any) => p.status === "success");
        if (successfulPayment) {
          activities.push(`Payment received: RWF ${parseFloat(successfulPayment.amount).toLocaleString()}`);
        }

        // Add trainings
        const trainingsRes = await apiGet("/trainings");
        const trainings = trainingsRes.data || [];
        if (trainings.length > 0) {
          activities.push(`New training course added: ${trainings[0].title}`);
        }

        setRecentActivities(activities.length > 0 ? activities : [
          "New worker registered: John Doe",
          "New homeowner joined: Jane Smith",
          "Booking completed: Cleaning service",
          "Payment received: RWF 25,000",
          "New training course added: Advanced Cleaning",
        ]);
      } catch (error) {
        console.error("Error fetching admin overview data:", error);
        // Fall back to default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">{kpi.label}</h3>
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <span className="text-sm font-medium text-green-600">{kpi.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#007bff" 
                name="Revenue (RWF)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings & Workers Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Growth Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="workers" fill="#007bff" name="Workers" />
              <Bar dataKey="bookings" fill="#28a745" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            "New worker registered: John Doe",
            "New homeowner joined: Jane Smith",
            "Booking completed: Cleaning service",
            "Payment received: RWF 25,000",
            "New training course added: Advanced Cleaning",
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <p className="text-sm text-foreground">{activity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
