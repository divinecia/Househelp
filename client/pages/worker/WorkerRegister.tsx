import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { registerUser } from "@/lib/auth";
import type { WorkerData } from "@/lib/auth";
import { validateRwandaID, parseRwandaID } from "@/lib/rwandaId";
import { registerUser as apiRegisterWorker } from "@/lib/api-client";
import { toast } from "sonner";
import { X } from "lucide-react";

export default function WorkerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<WorkerData>>({
    termsAccepted: false,
  });
  const [languages, setLanguages] = useState<Array<{ language: string; level: string }>>([]);
  const [newLanguage, setNewLanguage] = useState({ language: "", level: "" });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setFormData((prev) => ({
        ...prev,
        [fieldName]: fileName,
      }));
    }
  };

  const addLanguage = () => {
    if (newLanguage.language && newLanguage.level) {
      setLanguages([...languages, newLanguage]);
      setNewLanguage({ language: "", level: "" });
    }
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password || formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    if (!formData.nationalId) {
      newErrors.nationalId = "National ID is required";
    } else {
      if (!validateRwandaID(formData.nationalId)) {
        const parsed = parseRwandaID(formData.nationalId);
        if (parsed.errors.length > 0) {
          newErrors.nationalId = parsed.errors[0];
        } else {
          newErrors.nationalId = "National ID must be exactly 16 digits in Rwanda format";
        }
      }
    }
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

    try {
      const dataToSubmit = {
        email: formData.email!,
        password: formData.password!,
        fullName: formData.fullName!,
        role: "worker",
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        phoneNumber: formData.phoneNumber,
        nationalId: formData.nationalId,
        typeOfWork: formData.typeOfWork,
        workExperience: formData.workExperience,
        expectedWages: formData.expectedWages,
        workingHoursAndDays: formData.workingHoursAndDays,
        educationQualification: formData.educationQualification,
        educationCertificate: formData.educationCertificate,
        trainingCertificate: formData.trainingCertificate,
        criminalRecord: formData.criminalRecord,
        languageProficiency: languages.map(l => `${l.language} (${l.level})`).join(", "),
        insuranceCompany: formData.insuranceCompany,
        healthCondition: formData.healthCondition,
        emergencyName: formData.emergencyName,
        emergencyContact: formData.emergencyContact,
        bankAccountNumber: formData.bankAccountNumber,
        accountHolder: formData.accountHolder,
        termsAccepted: formData.termsAccepted,
      };

      // Call API to register
      const response = await apiRegisterWorker(dataToSubmit);

      if (!response.success) {
        toast.error(response.error || "Registration failed");
        return;
      }

      toast.success("Registration successful! Redirecting to login...");

      // Also save to localStorage as fallback
      registerUser("worker", formData as WorkerData);

      setTimeout(() => {
        navigate("/worker/login");
      }, 1000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Registration failed";
      toast.error(errorMsg);
      console.error("Registration failed:", error);
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
                    National ID (16 digits) *
                  </label>
                  <input
                    type="text"
                    id="nationalId"
                    name="nationalId"
                    value={formData.nationalId || ""}
                    onChange={handleChange}
                    placeholder="1234567890123456"
                    maxLength={16}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: 16 digits (Status + YoB + Gender + BirthOrder + Frequency + Security)
                  </p>
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
                    Work Experience: {formData.workExperience || 0} years
                  </label>
                  <input
                    type="range"
                    id="workExperience"
                    name="workExperience"
                    min="0"
                    max="10"
                    value={formData.workExperience || 0}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">0 to 10+ years</p>
                </div>

                <div>
                  <label htmlFor="expectedWages" className="block text-sm font-medium text-foreground mb-2">
                    Expected Wages
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="25000"
                      value={formData.expectedWages?.split(" ")[0] || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          expectedWages: e.target.value + " " + (formData.expectedWages?.split(" ")[1] || "per hour"),
                        }))
                      }
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <select
                      value={formData.expectedWages?.split(" ")[1] || "per hour"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          expectedWages: (formData.expectedWages?.split(" ")[0] || "") + " " + e.target.value,
                        }))
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="per hour">Per Hour</option>
                      <option value="per day">Per Day</option>
                      <option value="per month">Per Month</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="workingHoursAndDays" className="block text-sm font-medium text-foreground mb-2">
                    Working Hours and Days
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="time"
                        placeholder="Start time"
                        value={formData.workingHoursAndDays?.split("-")[0]?.trim() || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            workingHoursAndDays: e.target.value + " - " + (formData.workingHoursAndDays?.split("-")[1]?.trim() || ""),
                          }))
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="time"
                        placeholder="End time"
                        value={formData.workingHoursAndDays?.split("-")[1]?.trim() || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            workingHoursAndDays: (formData.workingHoursAndDays?.split("-")[0]?.trim() || "") + " - " + e.target.value,
                          }))
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                        <label key={day} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded" />
                          <span className="text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
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
                    placeholder="e.g., High School, Bachelor's Degree"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="educationDoc" className="block text-sm font-medium text-foreground mb-2">
                    Upload Education Certificate
                  </label>
                  <input
                    type="file"
                    id="educationDoc"
                    onChange={(e) => handleFileChange(e, "educationCertificate")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                  {formData.educationCertificate && (
                    <p className="text-xs text-primary mt-1">✓ {formData.educationCertificate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="trainingDoc" className="block text-sm font-medium text-foreground mb-2">
                    Upload Training Certificate
                  </label>
                  <input
                    type="file"
                    id="trainingDoc"
                    onChange={(e) => handleFileChange(e, "trainingCertificate")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                  {formData.trainingCertificate && (
                    <p className="text-xs text-primary mt-1">✓ {formData.trainingCertificate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="criminalDoc" className="block text-sm font-medium text-foreground mb-2">
                    Upload Criminal Record Check
                  </label>
                  <input
                    type="file"
                    id="criminalDoc"
                    onChange={(e) => handleFileChange(e, "criminalRecord")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                  {formData.criminalRecord && (
                    <p className="text-xs text-primary mt-1">✓ {formData.criminalRecord}</p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Language Proficiency */}
            <fieldset className="mb-8 pb-8 border-b border-gray-200">
              <legend className="text-lg font-semibold text-foreground mb-6">
                Language Proficiency
              </legend>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Language"
                    value={newLanguage.language}
                    onChange={(e) => setNewLanguage({ ...newLanguage, language: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <select
                    value={newLanguage.level}
                    onChange={(e) => setNewLanguage({ ...newLanguage, level: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Native">Native</option>
                  </select>
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {languages.map((lang, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20"
                    >
                      <span className="text-foreground">
                        {lang.language} - {lang.level}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </fieldset>

            {/* Health and Emergency */}
            <fieldset className="mb-8 pb-8 border-b border-gray-200">
              <legend className="text-lg font-semibold text-foreground mb-6">
                Health and Insurance
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="insuranceCompany" className="block text-sm font-medium text-foreground mb-2">
                    Insurance Company
                  </label>
                  <select
                    id="insuranceCompany"
                    name="insuranceCompany"
                    value={formData.insuranceCompany || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select Insurance Company</option>
                    <option value="RSSB">RSSB</option>
                    <option value="SORAS">SORAS</option>
                    <option value="RAMA">RAMA</option>
                    <option value="None">None</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="healthCondition" className="block text-sm font-medium text-foreground mb-2">
                    Health Conditions / Medical Notes
                  </label>
                  <textarea
                    id="healthCondition"
                    name="healthCondition"
                    value={formData.healthCondition || ""}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any medical conditions or allergies we should know about?"
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
