import { useState } from "react";
import { Search, MapPin, Star, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockChartData = [
  { month: "Jan", satisfaction: 85 },
  { month: "Feb", satisfaction: 88 },
  { month: "Mar", satisfaction: 92 },
  { month: "Apr", satisfaction: 95 },
  { month: "May", satisfaction: 96 },
  { month: "Jun", satisfaction: 98 },
];

const services = [
  { name: "Cooking", workers: 48 },
  { name: "Washing", workers: 36 },
  { name: "Cleaning", workers: 62 },
  { name: "Gardening", workers: 22 },
  { name: "Elderly Care", workers: 31 },
  { name: "Pet Care", workers: 17 },
  { name: "Child Care", workers: 51 },
  { name: "Laundry & Ironing", workers: 44 },
];

const courses = [
  { name: "How to Manage Household Staff", duration: "3 weeks" },
  { name: "Safety & Hygiene Best Practices", duration: "2 weeks" },
  { name: "Effective Communication Skills", duration: "4 weeks" },
];

export default function HomeownerHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("all");

  return (
    <div className="space-y-8">
      {/* Advanced Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Find Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search by skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Nearby (km)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Rate (RWF)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Our Services */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Our Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((service) => (
            <div
              key={service.name}
              className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 hover:shadow-md transition-shadow cursor-pointer"
            >
              <p className="font-medium text-foreground">{service.name}</p>
              <p className="text-sm text-muted-foreground">{service.workers} workers</p>
            </div>
          ))}
        </div>
      </div>

      {/* Training Courses */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Training Courses for Homeowners</h2>
        <div className="space-y-3">
          {courses.map((course, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors">
              <p className="font-medium text-foreground">{course.name}</p>
              <p className="text-sm text-muted-foreground">Duration: {course.duration}</p>
              <button className="mt-2 text-sm text-primary hover:underline">Enroll Now</button>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" />
            Why We're the Best
          </h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Vetted and verified workers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Transparent pricing with clear fee breakdown</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>24/7 customer support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Secure payment processing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Quality guarantee with ratings and reviews</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Our Mission & Vision</h3>
          <div className="space-y-4 text-sm text-foreground">
            <div>
              <p className="font-medium text-primary mb-1">Mission</p>
              <p>To connect trusted household professionals with families who deserve quality service and peace of mind.</p>
            </div>
            <div>
              <p className="font-medium text-primary mb-1">Vision</p>
              <p>To transform household management through technology, building a community where both service providers and homeowners thrive together.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Satisfaction Trend */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Customer Satisfaction Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="satisfaction"
              stroke="#007bff"
              strokeWidth={2}
              dot={{ fill: "#007bff", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
