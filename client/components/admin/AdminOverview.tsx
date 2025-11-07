import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, DollarSign, Calendar, TrendingUp } from "lucide-react";

const mockData = [
  { month: "Jan", workers: 45, bookings: 120, revenue: 15000 },
  { month: "Feb", workers: 52, bookings: 135, revenue: 18000 },
  { month: "Mar", workers: 58, bookings: 155, revenue: 22000 },
  { month: "Apr", workers: 62, bookings: 175, revenue: 26000 },
  { month: "May", workers: 71, bookings: 195, revenue: 31000 },
  { month: "Jun", workers: 78, bookings: 210, revenue: 35000 },
];

export default function AdminOverview() {
  const kpis = [
    { label: "Total Workers", value: "78", icon: Users, trend: "+12%" },
    { label: "Active Homeowners", value: "156", icon: Users, trend: "+8%" },
    { label: "Total Revenue", value: "RWF 215,000", icon: DollarSign, trend: "+23%" },
    { label: "Active Bookings", value: "42", icon: Calendar, trend: "+15%" },
  ];

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
