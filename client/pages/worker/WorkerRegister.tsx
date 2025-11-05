import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { registerUser } from "@/lib/auth";
import type { WorkerData } from "@/lib/auth";

export default function WorkerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<WorkerData>>({
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password || formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    if (!formData.nationalId) newErrors.nationalId = "National ID is required";
    if (!formData.termsAccepted)
      newErrors.termsAccepted = "You must accept the terms and conditions";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        registerUser("worker", formData as WorkerData);
        navigate("/worker/login");
      } catch (error) {
        console.error("Registration failed:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16 bg-gradient-to-b from-white via-white to-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Worker Registration
            </h1>
            <p className="text-muted-foreground">
              Complete your profile to get started as a professional worker
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            {/* Personal Information */}
            <fieldset className="mb-8 pb-8 border-b border-gray-200">
              <legend className="text-lg font-semibold text-foreground mb-6">
                Personal Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
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

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-foreground mb-2">
                    Date of Birth (Must be 18+) *
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-destructive text-sm mt-1">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-foreground mb-2">
                    Gender
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
                </div>

                <div>
                  <label htmlFor="maritalStatus" className="block text-sm font-medium text-foreground mb-2">
                    Marital Status
                  </label>
                  <select
                    id="maritalStatus"
                    name="maritalStatus"
                    value={formData.maritalStatus || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Contact Information */}
            <fieldset className="mb-8 pb-8 border-b border-gray-200">
              <legend className="text-lg font-semibold text-foreground mb-6">
                Contact Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
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

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.phoneNumber && (
                    <p className="text-destructive text-sm mt-1">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
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

                <div>
                  <label htmlFor="nationalId" className="block text-sm font-medium text-foreground mb-2">
                    National ID *
                  </label>
                  <input
                    type="text"
                    id="nationalId"
                    name="nationalId"
                    value={formData.nationalId || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.nationalId && (
                    <p className="text-destructive text-sm mt-1">{errors.nationalId}</p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Professional Information */}
            <fieldset className="mb-8 pb-8 border-b border-gray-200">
              <legend className="text-lg font-semibold text-foreground mb-6">
                Professional Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="typeOfWork" className="block text-sm font-medium text-foreground mb-2">
                    Type of Work
                  </label>
                  <input
                    type="text"
                    id="typeOfWork"
                    name="typeOfWork"
                    value={formData.typeOfWork || ""}
                    onChange={handleChange}
                    placeholder="e.g., Cleaning, Cooking, Childcare"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="workExperience" className="block text-sm font-medium text-foreground mb-2">
                    Work Experience (Years)
                  </label>
                  <input
                    type="text"
                    id="workExperience"
                    name="workExperience"
                    value={formData.workExperience || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="expectedWages" className="block text-sm font-medium text-foreground mb-2">
                    Expected Wages (Per Hour/Day)
                  </label>
                  <input
                    type="text"
                    id="expectedWages"
                    name="expectedWages"
                    value={formData.expectedWages || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="workingHoursAndDays" className="block text-sm font-medium text-foreground mb-2">
                    Working Hours and Days
                  </label>
                  <input
                    type="text"
                    id="workingHoursAndDays"
                    name="workingHoursAndDays"
                    value={formData.workingHoursAndDays || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="educationQualification" className="block text-sm font-medium text-foreground mb-2">
                    Education Qualification
                  </label>
                  <input
                    type="text"
                    id="educationQualification"
                    name="educationQualification"
                    value={formData.educationQualification || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="trainingCertificate" className="block text-sm font-medium text-foreground mb-2">
                    Training Certificate
                  </label>
                  <input
                    type="text"
                    id="trainingCertificate"
                    name="trainingCertificate"
                    value={formData.trainingCertificate || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="languageProficiency" className="block text-sm font-medium text-foreground mb-2">
                    Language Proficiency
                  </label>
                  <input
                    type="text"
                    id="languageProficiency"
                    name="languageProficiency"
                    value={formData.languageProficiency || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="criminalRecord" className="block text-sm font-medium text-foreground mb-2">
                    Criminal Record
                  </label>
                  <select
                    id="criminalRecord"
                    name="criminalRecord"
                    value={formData.criminalRecord || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Health and Emergency */}
            <fieldset className="mb-8 pb-8 border-b border-gray-200">
              <legend className="text-lg font-semibold text-foreground mb-6">
                Health and Emergency
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="healthCondition" className="block text-sm font-medium text-foreground mb-2">
                    Health Condition / Insurance
                  </label>
                  <textarea
                    id="healthCondition"
                    name="healthCondition"
                    value={formData.healthCondition || ""}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyName" className="block text-sm font-medium text-foreground mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    id="emergencyName"
                    name="emergencyName"
                    value={formData.emergencyName || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-foreground mb-2">
                    Emergency Contact Number
                  </label>
                  <input
                    type="tel"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </fieldset>

            {/* Bank Information */}
            <fieldset className="mb-8 pb-8 border-b border-gray-200">
              <legend className="text-lg font-semibold text-foreground mb-6">
                Bank Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-foreground mb-2">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    id="bankAccountNumber"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="accountHolder" className="block text-sm font-medium text-foreground mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    id="accountHolder"
                    name="accountHolder"
                    value={formData.accountHolder || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </fieldset>

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
                <p className="text-destructive text-sm mt-2">{errors.termsAccepted}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Complete Registration
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
