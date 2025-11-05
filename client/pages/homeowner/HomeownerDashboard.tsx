import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUser, logoutUser } from "@/lib/auth";
import type { HomeownerData } from "@/lib/auth";

export default function HomeownerDashboard() {
  const navigate = useNavigate();
  const user = getUser("homeowner") as HomeownerData;

  useEffect(() => {
    if (!user) {
      navigate("/homeowner/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logoutUser("homeowner");
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
                Homeowner Dashboard
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 md:mt-0 px-6 py-2 bg-destructive text-white font-semibold rounded-lg hover:bg-destructive/90 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Profile Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Profile Information
              </h2>
              <div className="space-y-4">
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
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="text-foreground font-medium">{user.age || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Home Address</p>
                  <p className="text-foreground font-medium">{user.homeAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type of Residence</p>
                  <p className="text-foreground font-medium capitalize">{user.typeOfResidence || "Not specified"}</p>
                </div>
              </div>
            </div>

            {/* Home Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Home Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Number of Family Members</p>
                  <p className="text-foreground font-medium">{user.numberOfFamilyMembers || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Home Composition</p>
                  <div className="text-foreground font-medium">
                    {user.homeComposition && (
                      <ul className="list-disc list-inside">
                        {user.homeComposition.adults && <li>Adults</li>}
                        {user.homeComposition.children && <li>Children</li>}
                        {user.homeComposition.elderly && <li>Elderly</li>}
                        {user.homeComposition.pets && <li>Pets</li>}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Worker Requirements */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Worker Requirements
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Worker Type</p>
                  <p className="text-foreground font-medium capitalize">{user.workerInfo || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Number of Workers Needed</p>
                  <p className="text-foreground font-medium">{user.numberOfWorkersNeeded || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preferred Gender</p>
                  <p className="text-foreground font-medium capitalize">{user.preferredGender || "No preference"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Language Preference</p>
                  <p className="text-foreground font-medium">{user.languagePreference || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wages Offered</p>
                  <p className="text-foreground font-medium">{user.wagesOffered || "Not specified"}</p>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Additional Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date Required</p>
                  <p className="text-foreground font-medium">{user.startDateRequired || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reason for Hiring</p>
                  <p className="text-foreground font-medium">{user.reasonForHiring || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Criminal Record Check</p>
                  <p className="text-foreground font-medium capitalize">{user.criminalRecord || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Mode</p>
                  <p className="text-foreground font-medium capitalize">{user.paymentMode || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20 p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                Post a Job
              </button>
              <button className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                Browse Workers
              </button>
              <button className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                View Applications
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
