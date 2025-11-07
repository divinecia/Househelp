import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUser, logoutUser } from "@/lib/auth";
import type { HomeownerData } from "@/lib/auth";
import { Home, Briefcase, Calendar, User, MoreVertical, LogOut, Star } from "lucide-react";
import HomeownerHome from "@/components/homeowner/HomeownerHome";
import HomeownerJobs from "@/components/homeowner/HomeownerJobs";
import HomeownerBooking from "@/components/homeowner/HomeownerBooking";
import HomeownerProfile from "@/components/homeowner/HomeownerProfile";
import HomeownerMore from "@/components/homeowner/HomeownerMore";

type HomeownerSection = "home" | "jobs" | "booking" | "profile" | "more";

export default function HomeownerDashboard() {
  const navigate = useNavigate();
  const user = getUser("homeowner") as HomeownerData;
  const [activeSection, setActiveSection] = useState<HomeownerSection>("home");
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/homeowner/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logoutUser("homeowner");
    navigate("/");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <HomeownerHome />;
      case "jobs":
        return <HomeownerJobs />;
      case "booking":
        return <HomeownerBooking />;
      case "profile":
        return <HomeownerProfile />;
      case "more":
        return <HomeownerMore onLogout={handleLogout} />;
      default:
        return <HomeownerHome />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      <Header />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {/* Header Bar */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground capitalize">
              {activeSection === "home"
                ? "Dashboard"
                : activeSection === "jobs"
                ? "My Jobs"
                : activeSection === "booking"
                ? "Bookings"
                : activeSection === "profile"
                ? "My Profile"
                : "More"}
            </h1>
            <p className="text-muted-foreground mt-2">Welcome back, {user.fullName}!</p>
          </div>

          {/* Content */}
          {renderSection()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center h-20 max-w-6xl mx-auto">
          <button
            onClick={() => {
              setActiveSection("home");
              setShowMore(false);
            }}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeSection === "home"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home size={24} />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => {
              setActiveSection("jobs");
              setShowMore(false);
            }}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeSection === "jobs"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase size={24} />
            <span className="text-xs font-medium">Jobs</span>
          </button>

          <button
            onClick={() => {
              setActiveSection("booking");
              setShowMore(false);
            }}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeSection === "booking"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar size={24} />
            <span className="text-xs font-medium">Booking</span>
          </button>

          <button
            onClick={() => {
              setActiveSection("profile");
              setShowMore(false);
            }}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeSection === "profile"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User size={24} />
            <span className="text-xs font-medium">Profile</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMore(!showMore)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeSection === "more"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MoreVertical size={24} />
              <span className="text-xs font-medium">More</span>
            </button>

            {showMore && (
              <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setActiveSection("more");
                    setShowMore(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
                >
                  <Star size={16} />
                  Rate Worker
                </button>
                <button
                  onClick={() => {
                    setActiveSection("more");
                    setShowMore(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm font-medium"
                >
                  Report Issue
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <Footer />
    </div>
  );
}
