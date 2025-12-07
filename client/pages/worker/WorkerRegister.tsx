import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { registerUser } from "@/lib/auth";
import type { WorkerData } from "@/lib/auth";
import {
  getGenders,
  getMaritalStatuses,
  getWageUnits,
  getLanguageLevels,
  getInsuranceCompanies,
} from "@/lib/api-client";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import { validateRwandaID, parseRwandaID } from "@/lib/rwandaId";

export default function WorkerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<WorkerData>>({
    fullName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    address: "",
    phoneNumber: "",
    nationalId: "",
    experience: "",
    expectedWages: "",
    workingHoursAndDays: "",
    educationQualification: "",
    emergencyName: "",
    emergencyContact: "",
    bankAccountNumber: "",
    accountHolder: "",
    termsAccepted: false,
  });
  const [languages, setLanguages] = useState<
    Array<{ language: string; level: string }>
  >([]);
  const [newLanguage, setNewLanguage] = useState({ language: "", level: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gendersList, setGendersList] = useState<
    Array<{ id: string; name: string }>
  >([
    { id: '1', name: 'Male' },
    { id: '2', name: 'Female' },
    { id: '3', name: 'Other' }
  ]);
  const [maritalStatuses, setMaritalStatuses] = useState<
    Array<{ id: string; name: string }>
  >([
    { id: '1', name: 'Single' },
    { id: '2', name: 'Married' },
    { id: '3', name: 'Divorced' },
    { id: '4', name: 'Widowed' }
  ]);
  const [wageUnits, setWageUnits] = useState<
    Array<{ id: string; name: string }>
  >([
    { id: '1', name: 'per hour' },
    { id: '2', name: 'per day' },
    { id: '3', name: 'per week' },
    { id: '4', name: 'per month' }
  ]);
  const [languageLevels, setLanguageLevels] = useState<
    Array<{ id: string; name: string }>
  >([
    { id: '1', name: 'Beginner' },
    { id: '2', name: 'Intermediate' },
    { id: '3', name: 'Advanced' },
    { id: '4', name: 'Fluent' },
    { id: '5', name: 'Native' }
  ]);
  const [insuranceCompanies, setInsuranceCompanies] = useState<
    Array<{ id: string; name: string }>
  >([
    { id: '1', name: 'Radiant Insurance' },
    { id: '2', name: 'MInsurance' },
    { id: '3', name: 'MMI Insurance' },
    { id: '4', name: 'Other' }
  ]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: "File size must be less than 5MB",
        }));
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: "Only PDF, DOC, DOCX, JPG, and PNG files are allowed",
        }));
        return;
      }
      
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file.name,
      }));
      
      // Clear any previous errors for this field
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
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

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [genders, maritalStatus, wages, levels, insurance] =
          await Promise.all([
            getGenders(),
            getMaritalStatuses(),
            getWageUnits(),
            getLanguageLevels(),
            getInsuranceCompanies(),
          ]);
        if (genders.success && Array.isArray(genders.data) && genders.data.length > 0) {
          setGendersList(genders.data);
        } else {
          console.error("Failed to load genders from database");
          toast.error("Failed to load form options. Please refresh the page.");
        }
        if (maritalStatus.success && Array.isArray(maritalStatus.data) && maritalStatus.data.length > 0) {
          setMaritalStatuses(maritalStatus.data);
        } else {
          console.error("Failed to load marital statuses from database");
        }
        if (wages.success && Array.isArray(wages.data) && wages.data.length > 0) {
          setWageUnits(wages.data);
        } else {
          console.error("Failed to load wage units from database");
        }
        if (levels.success && Array.isArray(levels.data) && levels.data.length > 0) {
          setLanguageLevels(levels.data);
        } else {
          console.error("Failed to load language levels from database");
        }
        if (insurance.success && Array.isArray(insurance.data) && insurance.data.length > 0) {
          setInsuranceCompanies(insurance.data);
        } else {
          console.error("Failed to load insurance companies from database");
        }
      } catch (error) {
        console.error("Failed to load options:", error);
        toast.error("Failed to load form options. Please refresh the page.");
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Personal Information
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      // Validate age requirement (18+)
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (age < 18 || (age === 18 && monthDiff < 0)) {
        newErrors.dateOfBirth = "You must be at least 18 years old";
      }
    }
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password || formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.maritalStatus) newErrors.maritalStatus = "Marital status is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.nationalId) {
      newErrors.nationalId = "National ID is required";
    } else {
      if (!validateRwandaID(formData.nationalId)) {
        const parsed = parseRwandaID(formData.nationalId);
        if (parsed.errors.length > 0) {
          newErrors.nationalId = parsed.errors[0];
        } else {
          newErrors.nationalId =
            "National ID must be exactly 16 digits in Rwanda format";
        }
      }
    }
    
    // Work Information
    if (!formData.experience) newErrors.experience = "Experience is required";
    if (!formData.expectedWages) newErrors.expectedWages = "Expected wages are required";
    if (!formData.workingHoursAndDays) newErrors.workingHoursAndDays = "Working hours and days are required";
    
    // Emergency Contact
    if (!formData.emergencyName) newErrors.emergencyName = "Emergency contact name is required";
    if (!formData.emergencyContact) newErrors.emergencyContact = "Emergency contact number is required";
    
    // Bank Information
    if (!formData.bankAccountNumber) newErrors.bankAccountNumber = "Bank account number is required";
    if (!formData.accountHolder) newErrors.accountHolder = "Account holder name is required";
    
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
        languageProficiency: languages
          .map((l) => `${l.language} (${l.level})`)
          .join(", "),
        insuranceCompany: formData.insuranceCompany,
        healthCondition: formData.healthCondition,
        emergencyName: formData.emergencyName,
        emergencyContact: formData.emergencyContact,
        bankAccountNumber: formData.bankAccountNumber,
        accountHolder: formData.accountHolder,
        termsAccepted: formData.termsAccepted,
      };

      await registerUser("worker", dataToSubmit as WorkerData);

      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/worker/login");
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Worker Registration
            </h1>
            <p className="text-muted-foreground">
              Complete your profile to get started as a professional worker
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm"
          >
            {/* Personal Information */}
            <fieldset className="mb-8 pb-8 border-b border-gray-200">
              <legend className="text-lg font-semibold text-foreground mb-6">
                Personal Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
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

                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
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
                    <p className="text-destructive text-sm mt-1">
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleChange}
                    disabled={loadingOptions}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingOptions ? "Loading..." : "Select Gender"}
                    </option>
                    {gendersList.map((gender) => (
                      <option key={gender.id} value={gender.name.toLowerCase()}>
                        {gender.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="maritalStatus"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Marital Status
                  </label>
                  <select
                    id="maritalStatus"
                    name="maritalStatus"
                    value={formData.maritalStatus || ""}
                    onChange={handleChange}
                    disabled={loadingOptions}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingOptions ? "Loading..." : "Select Status"}
                    </option>
                    {maritalStatuses.map((status) => (
                      <option key={status.id} value={status.name.toLowerCase()}>
                        {status.name}
                      </option>
                    ))}
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
                    <p className="text-destructive text-sm mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
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
                    <p className="text-destructive text-sm mt-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
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

                <div>
                  <label
                    htmlFor="nationalId"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
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
                    Format: 16 digits (Status + YoB + Gender + BirthOrder +
                    Frequency + Security)
                  </p>
                  {errors.nationalId && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.nationalId}
                    </p>
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
                  <label
                    htmlFor="typeOfWork"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
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
                  <label
                    htmlFor="workExperience"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
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
                  <p className="text-xs text-muted-foreground mt-1">
                    0 to 10+ years
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="expectedWages"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
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
                          expectedWages:
                            e.target.value +
                            " " +
                            (formData.expectedWages?.split(" ")[1] ||
                              "per hour"),
                        }))
                      }
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <select
                      value={
                        formData.expectedWages?.split(" ")[1] || "per hour"
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          expectedWages:
                            (formData.expectedWages?.split(" ")[0] || "") +
                            " " +
                            e.target.value,
                        }))
                      }
                      disabled={loadingOptions}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">
                        {loadingOptions ? "Loading..." : "Select Unit"}
                      </option>
                      {wageUnits.map((unit) => (
                        <option key={unit.id} value={unit.name.toLowerCase()}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="workingHoursAndDays"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Working Hours and Days
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="time"
                        placeholder="Start time"
                        value={
                          formData.workingHoursAndDays?.split("-")[0]?.trim() ||
                          ""
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            workingHoursAndDays:
                              e.target.value +
                              " - " +
                              (formData.workingHoursAndDays
                                ?.split("-")[1]
                                ?.trim() || ""),
                          }))
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="time"
                        placeholder="End time"
                        value={
                          formData.workingHoursAndDays?.split("-")[1]?.trim() ||
                          ""
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            workingHoursAndDays:
                              (formData.workingHoursAndDays
                                ?.split("-")[0]
                                ?.trim() || "") +
                              " - " +
                              e.target.value,
                          }))
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (day) => (
                          <label
                            key={day}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-sm">{day}</span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="educationQualification"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
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
                  <label
                    htmlFor="educationDoc"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Upload Education Certificate
                  </label>
                  <input
                    type="file"
                    id="educationDoc"
                    onChange={(e) =>
                      handleFileChange(e, "educationCertificate")
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                  {formData.educationCertificate && (
                    <p className="text-xs text-primary mt-1">
                      ✓ {formData.educationCertificate}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="trainingDoc"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
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
                    <p className="text-xs text-primary mt-1">
                      ✓ {formData.trainingCertificate}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="criminalDoc"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
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
                    <p className="text-xs text-primary mt-1">
                      ✓ {formData.criminalRecord}
                    </p>
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
                    onChange={(e) =>
                      setNewLanguage({
                        ...newLanguage,
                        language: e.target.value,
                      })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <select
                    value={newLanguage.level}
                    onChange={(e) =>
                      setNewLanguage({ ...newLanguage, level: e.target.value })
                    }
                    disabled={loadingOptions}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingOptions ? "Loading..." : "Select Level"}
                    </option>
                    {languageLevels.map((level) => (
                      <option key={level.id} value={level.name}>
                        {level.name}
                      </option>
                    ))}
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
                  <label
                    htmlFor="insuranceCompany"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Insurance Company
                  </label>
                  <select
                    id="insuranceCompany"
                    name="insuranceCompany"
                    value={formData.insuranceCompany || ""}
                    onChange={handleChange}
                    disabled={loadingOptions}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingOptions
                        ? "Loading..."
                        : "Select Insurance Company"}
                    </option>
                    {insuranceCompanies.map((company) => (
                      <option key={company.id} value={company.name}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="healthCondition"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
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
                  <label
                    htmlFor="emergencyName"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
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
                  <label
                    htmlFor="emergencyContact"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
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
                  <label
                    htmlFor="bankAccountNumber"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
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
                  <label
                    htmlFor="accountHolder"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
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
                  onClick={() => navigate("/worker/login")}
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
                disabled={isSubmitting || loadingOptions}
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