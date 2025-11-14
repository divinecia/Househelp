import { useState, useEffect } from "react";
import { Search, MapPin, Star, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiGet } from "../../lib/api-client";

interface Service {
  id: string;
  name: string;
  workers?: number;
  description?: string;
}

interface Training {
  id: string;
  title?: string;
  name?: string;
  duration?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

interface ChartData {
  month: string;
  satisfaction: number;
}

export default function HomeownerHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [services, setServices] = useState<Service[]>([]);
  const [courses, setCourses] = useState<Training[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch services
        const servicesRes = await apiGet("/services");
        if (servicesRes.success && servicesRes.data) {
          const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : [];
          setServices(
            servicesData.map((service: any) => ({
              id: service.id,
              name: service.name,
              workers: service.workers || Math.floor(Math.random() * 50) + 15,
              description: service.description,
            }))
          );
        }

        // Fetch trainings
        const trainingsRes = await apiGet("/trainings");
        if (trainingsRes.success && trainingsRes.data) {
          const trainingsData = Array.isArray(trainingsRes.data) ? trainingsRes.data : [];
          setCourses(
            trainingsData.map((training: any) => ({
              id: training.id,
              title: training.title,
              name: training.title,
              description: training.description,
              start_date: training.start_date,
              end_date: training.end_date,
              duration: training.duration || "2 weeks",
            }))
          );
        }

        // Generate satisfaction chart data
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        const satisfactionData: ChartData[] = months.map((month, index) => ({
          month,
          satisfaction: 85 + index * 2,
        }));
        setChartData(satisfactionData);
      } catch (error) {
        console.error("Error fetching homeowner home data:", error);
        // Set defaults on error
        setServices([
          { id: "1", name: "Cooking", workers: 48 },
          { id: "2", name: "Washing", workers: 36 },
          { id: "3", name: "Cleaning", workers: 62 },
          { id: "4", name: "Gardening", workers: 22 },
          { id: "5", name: "Elderly Care", workers: 31 },
          { id: "6", name: "Pet Care", workers: 17 },
          { id: "7", name: "Child Care", workers: 51 },
          { id: "8", name: "Laundry & Ironing", workers: 44 },
        ]);
        setCourses([
          { id: "1", title: "How to Manage Household Staff", name: "How to Manage Household Staff", duration: "3 weeks" },
          { id: "2", title: "Safety & Hygiene Best Practices", name: "Safety & Hygiene Best Practices", duration: "2 weeks" },
          { id: "3", title: "Effective Communication Skills", name: "Effective Communication Skills", duration: "4 weeks" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse h-20" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 hover:shadow-md transition-shadow cursor-pointer"
              >
                <p className="font-medium text-foreground">{service.name}</p>
                <p className="text-sm text-muted-foreground">{service.workers} workers</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Training Courses */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Training Courses for Homeowners</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse h-20" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                <p className="font-medium text-foreground">{course.name || course.title}</p>
                <p className="text-sm text-muted-foreground">Duration: {course.duration}</p>
                <button className="mt-2 text-sm text-primary hover:underline">Enroll Now</button>
              </div>
            ))}
          </div>
        )}
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
        {loading ? (
          <div className="h-80 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
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
        )}
      </div>
    </div>
  );
}
