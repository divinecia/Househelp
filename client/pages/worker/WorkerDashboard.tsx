import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUser, logoutUser } from "@/lib/auth";
import type { WorkerData } from "@/lib/auth";

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const user = getUser("worker") as WorkerData;

  useEffect(() => {
    if (!user) {
      navigate("/worker/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logoutUser("worker");
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
                Worker Dashboard
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
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="text-foreground font-medium">{user.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="text-foreground font-medium capitalize">{user.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marital Status</p>
                  <p className="text-foreground font-medium capitalize">{user.maritalStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">National ID</p>
                  <p className="text-foreground font-medium">{user.nationalId}</p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Professional Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type of Work</p>
                  <p className="text-foreground font-medium">{user.typeOfWork || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Work Experience</p>
                  <p className="text-foreground font-medium">{user.workExperience || "Not specified"} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Wages</p>
                  <p className="text-foreground font-medium">{user.expectedWages || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Working Hours and Days</p>
                  <p className="text-foreground font-medium">{user.workingHoursAndDays || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Education Qualification</p>
                  <p className="text-foreground font-medium">{user.educationQualification || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Language Proficiency</p>
                  <p className="text-foreground font-medium">{user.languageProficiency || "Not specified"}</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Additional Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Training Certificate</p>
                  <p className="text-foreground font-medium">{user.trainingCertificate || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Criminal Record</p>
                  <p className="text-foreground font-medium capitalize">{user.criminalRecord || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Health Condition</p>
                  <p className="text-foreground font-medium">{user.healthCondition || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Emergency Contact</p>
                  <p className="text-foreground font-medium">{user.emergencyName || "Not specified"}</p>
                </div>
              </div>
            </div>

            {/* Bank Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Bank Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bank Account Number</p>
                  <p className="text-foreground font-medium">••••••••{user.bankAccountNumber?.slice(-4)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Holder</p>
                  <p className="text-foreground font-medium">{user.accountHolder || "Not specified"}</p>
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
                Browse Jobs
              </button>
              <button className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                View Earnings
              </button>
              <button className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
