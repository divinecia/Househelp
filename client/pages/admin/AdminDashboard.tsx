import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUser, logoutUser } from "@/lib/auth";
import { getUserRole } from "@/lib/jwt-auth";
import type { AdminData } from "@/lib/auth";
import {
  BarChart3,
  Users,
  Home,
  BookOpen,
  Calendar,
  FileText,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminWorkers from "@/components/admin/AdminWorkers";
import AdminHomeowners from "@/components/admin/AdminHomeowners";
import AdminTraining from "@/components/admin/AdminTraining";
import AdminBooking from "@/components/admin/AdminBooking";
import AdminReports from "@/components/admin/AdminReports";

type AdminSection = "overview" | "workers" | "homeowners" | "training" | "booking" | "reports";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getUser("admin") as AdminData;
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/admin/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logoutUser("admin");
    navigate("/");
  };

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "workers", label: "Workers", icon: Users },
    { id: "homeowners", label: "Homeowners", icon: Home },
    { id: "training", label: "Training", icon: BookOpen },
    { id: "booking", label: "Booking", icon: Calendar },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <AdminOverview />;
      case "workers":
        return <AdminWorkers />;
      case "homeowners":
        return <AdminHomeowners />;
      case "training":
        return <AdminTraining />;
      case "booking":
        return <AdminBooking />;
      case "reports":
        return <AdminReports />;
      default:
        return <AdminOverview />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-gray-200 transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-20"
          } overflow-y-auto`}
        >
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as AdminSection)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-destructive hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">
            {/* Header Bar */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground capitalize">
                {activeSection === "overview" ? "Dashboard" : activeSection}
              </h1>
              <p className="text-muted-foreground mt-2">
                Welcome, {user.fullName}! Manage your platform here.
              </p>
            </div>

            {/* Content */}
            {renderSection()}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
