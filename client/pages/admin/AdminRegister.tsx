import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { registerUser } from "@/lib/auth";
import type { AdminData } from "@/lib/auth";
import { getGenders } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<AdminData>>({
    fullName: "",
    email: "",
    password: "",
    contactNumber: "",
    gender: "",
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [genders, setGenders] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingGenders, setIsLoadingGenders] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadGenders = async () => {
      setIsLoadingGenders(true);
      try {
        const result = await getGenders();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setGenders(result.data);
        } else {
          console.error("Failed to load genders from database");
          toast.error("Failed to load gender options. Please refresh the page.");
        }
      } catch (error) {
        console.error("Failed to load genders:", error);
        toast.error("Failed to load gender options. Please refresh the page.");
      } finally {
        setIsLoadingGenders(false);
      }
    };
    loadGenders();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.currentTarget;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Personal Information
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password || formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    
    // Terms and Conditions
    if (!formData.termsAccepted)
      newErrors.termsAccepted = "You must accept the terms and conditions";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors above");
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSubmit: AdminData = {
        email: formData.email!,
        password: formData.password!,
        fullName: formData.fullName!,
        contactNumber: formData.contactNumber || '',
        gender: formData.gender || '',
        termsAccepted: formData.termsAccepted || false,
      };

      await registerUser("admin", dataToSubmit);

      toast.success("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/admin/login");
      }, 1500);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Registration failed";
      toast.error(errorMsg);
      console.error("Registration failed:", error);
    } finally {
      setIsSubmitting(false);
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

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm"
          >
            <div className="mb-6">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-foreground mb-2"
              >
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
                <p className="text-destructive text-sm mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="contactNumber"
                className="block text-sm font-medium text-foreground mb-2"
              >
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
                <p className="text-destructive text-sm mt-1">
                  {errors.contactNumber}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
                disabled={isLoadingGenders}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">
                  {isLoadingGenders ? "Loading..." : "Select Gender"}
                </option>
                {genders.map((gender) => (
                  <option key={gender.id} value={gender.name.toLowerCase()}>
                    {gender.name}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <p className="text-destructive text-sm mt-1">{errors.gender}</p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
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
                <p className="text-destructive text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="mb-8">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted || false}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  I agree to the terms and conditions *
                </span>
              </label>
              {errors.termsAccepted && (
                <p className="text-destructive text-sm mt-2">
                  {errors.termsAccepted}
                </p>
              )}
            </div>

            {/* Already have account link */}
            <div className="mb-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/admin/login")}
                  className="text-primary hover:text-primary/80 font-medium underline"
                >
                  Login here
                </button>
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || isLoadingGenders}
                className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 px-6 py-3 border border-gray-300 text-foreground font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}