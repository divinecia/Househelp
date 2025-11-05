import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUser, logoutUser } from "@/lib/auth";
import type { AdminData } from "@/lib/auth";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getUser("admin") as AdminData;

  useEffect(() => {
    if (!user) {
      navigate("/admin/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logoutUser("admin");
    navigate("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16 bg-gradient-to-b from-white via-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Welcome, {user.fullName}!
              </h1>
              <p className="text-muted-foreground">
                Admin Dashboard
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 md:mt-0 px-6 py-2 bg-destructive text-white font-semibold rounded-lg hover:bg-destructive/90 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Admin Profile */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="text-foreground font-medium">{user.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-foreground font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="text-foreground font-medium">{user.contactNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="text-foreground font-medium capitalize">{user.gender}</p>
              </div>
            </div>
          </div>

          {/* Platform Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2">Total Users</p>
              <p className="text-3xl font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground mt-2">Registered users</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2">Active Workers</p>
              <p className="text-3xl font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground mt-2">Currently active</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2">Active Jobs</p>
              <p className="text-3xl font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground mt-2">Pending assignments</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2">Platform Revenue</p>
              <p className="text-3xl font-bold text-primary">$0</p>
              <p className="text-xs text-muted-foreground mt-2">This month</p>
            </div>
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Management */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                User Management
              </h2>
              <p className="text-muted-foreground mb-6">
                Manage all platform users including workers, homeowners, and other admins.
              </p>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors">
                  View All Users
                </button>
                <button className="w-full px-4 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors">
                  Manage Workers
                </button>
                <button className="w-full px-4 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors">
                  Manage Homeowners
                </button>
              </div>
            </div>

            {/* Job Management */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Job Management
              </h2>
              <p className="text-muted-foreground mb-6">
                Monitor and manage all job postings and assignments on the platform.
              </p>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors">
                  View All Jobs
                </button>
                <button className="w-full px-4 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors">
                  Pending Assignments
                </button>
                <button className="w-full px-4 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors">
                  Completed Jobs
                </button>
              </div>
            </div>

            {/* Content Management */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Content Management
              </h2>
              <p className="text-muted-foreground mb-6">
                Update platform content, help articles, and FAQs.
              </p>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors">
                  Manage Pages
                </button>
                <button className="w-full px-4 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors">
                  Manage FAQ
                </button>
                <button className="w-full px-4 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors">
                  System Settings
                </button>
              </div>
            </div>

            {/* Reports & Analytics */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Reports & Analytics
              </h2>
              <p className="text-muted-foreground mb-6">
                View comprehensive reports and analytics about platform performance.
              </p>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors">
                  View Analytics
                </button>
                <button className="w-full px-4 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors">
                  Generate Reports
                </button>
                <button className="w-full px-4 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors">
                  User Feedback
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20 p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Quick Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Platform Status</p>
                <p className="text-lg font-semibold text-green-600">Operational</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Last System Check</p>
                <p className="text-lg font-semibold text-foreground">Just now</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Pending Actions</p>
                <p className="text-lg font-semibold text-primary">0</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
