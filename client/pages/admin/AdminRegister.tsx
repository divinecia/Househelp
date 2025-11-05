import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { registerUser } from "@/lib/auth";
import type { AdminData } from "@/lib/auth";

export default function AdminRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<AdminData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.contactNumber) newErrors.contactNumber = "Contact number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password || formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        registerUser("admin", formData as AdminData);
        navigate("/admin/login");
      } catch (error) {
        console.error("Registration failed:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16 bg-gradient-to-b from-white via-white to-gray-50">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Admin Registration
            </h1>
            <p className="text-muted-foreground">
              Create your admin account to manage the platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="mb-6">
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.fullName && (
                <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="contactNumber" className="block text-sm font-medium text-foreground mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.contactNumber && (
                <p className="text-destructive text-sm mt-1">{errors.contactNumber}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="gender" className="block text-sm font-medium text-foreground mb-2">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-destructive text-sm mt-1">{errors.gender}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="mb-8">
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors mb-4"
            >
              Create Admin Account
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/login")}
              className="w-full px-6 py-3 border border-gray-300 text-foreground font-semibold rounded-lg hover:bg-gray-50 transition-colors mb-4"
            >
              Already have an account?
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full px-6 py-3 text-primary font-semibold hover:underline"
            >
              Back to Home
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
