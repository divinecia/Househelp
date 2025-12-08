import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { registerUser } from "@/lib/auth";
import type { HomeownerData } from "@/lib/auth";
import {
  getResidenceTypes,
  getPaymentMethods,
  getWorkerInfoOptions,
  getGenders,
  getCriminalRecordOptions,
  getSmokingDrinkingOptions,
} from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function HomeownerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<HomeownerData>>({
    fullName: "",
    email: "",
    password: "",
    contactNumber: "",
    homeAddress: "",
    typeOfResidence: "",
    numberOfFamilyMembers: "",
    workerInfo: "",
    numberOfWorkersNeeded: "",
    specificDuties: "",
    workingHoursAndSchedule: "",
    wagesOffered: "",
    reasonForHiring: "",
    criminalRecord: "",
    paymentMode: "",
    startDateRequired: "",
    homeComposition: {
      adults: false,
      children: false,
      elderly: false,
      pets: false,
    },
    termsAccepted: false,
  });
  const [homeCompositionDetails, setHomeCompositionDetails] = useState<
    Array<{ type: string; count: number; age: string }>
  >([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [residenceTypes, setResidenceTypes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [workerInfos, setWorkerInfos] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [gendersList, setGendersList] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [criminalRecordOptions, setCriminalRecordOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [paymentModes, setPaymentModes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [smokingDrinkingOptions, setSmokingDrinkingOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for form submission management

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.currentTarget;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      if (name.startsWith("homeComposition.")) {
        const key = name.split(".")[1] as keyof typeof formData.homeComposition;
        setFormData((prev) => ({
          ...prev,
          homeComposition: {
            ...prev.homeComposition!,
            [key]: checked,
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [
          residences,
          paymentMethodsResult,
          workerInfoOpts,
          genders,
          criminalRecords,
          smokingDrinking,
        ] = await Promise.all([
          getResidenceTypes(),
          getPaymentMethods(),
          getWorkerInfoOptions(),
          getGenders(),
          getCriminalRecordOptions(),
          getSmokingDrinkingOptions(),
        ]);

        if (
          residences.success &&
          Array.isArray(residences.data) &&
          residences.data.length > 0
        ) {
          setResidenceTypes(residences.data);
        } else {
          console.error("Failed to load residence types from database");
        }

        if (
          paymentMethodsResult.success &&
          Array.isArray(paymentMethodsResult.data) &&
          paymentMethodsResult.data.length > 0
        ) {
          setPaymentModes(paymentMethodsResult.data);
        } else {
          console.error("Failed to load payment methods from database");
        }

        if (
          workerInfoOpts.success &&
          Array.isArray(workerInfoOpts.data) &&
          workerInfoOpts.data.length > 0
        ) {
          setWorkerInfos(workerInfoOpts.data);
        } else {
          console.error("Failed to load worker info options from database");
        }

        if (
          genders.success &&
          Array.isArray(genders.data) &&
          genders.data.length > 0
        ) {
          setGendersList(genders.data);
        } else {
          console.error("Failed to load genders from database");
          toast.error("Failed to load form options. Please refresh the page.");
        }

        if (
          criminalRecords.success &&
          Array.isArray(criminalRecords.data) &&
          criminalRecords.data.length > 0
        ) {
          setCriminalRecordOptions(criminalRecords.data);
        } else {
          console.error("Failed to load criminal record options from database");
        }

        if (
          smokingDrinking.success &&
          Array.isArray(smokingDrinking.data) &&
          smokingDrinking.data.length > 0
        ) {
          setSmokingDrinkingOptions(smokingDrinking.data);
        } else {
          console.error(
            "Failed to load smoking/drinking options from database",
          );
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
    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password || formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.homeAddress)
      newErrors.homeAddress = "Home address is required";
    if (!formData.typeOfResidence)
      newErrors.typeOfResidence = "Residence type is required";
    if (
      !formData.numberOfFamilyMembers ||
      Number(formData.numberOfFamilyMembers) < 1
    )
      newErrors.numberOfFamilyMembers = "Number of family members is required";

    // Worker Requirements
    if (!formData.workerInfo) newErrors.workerInfo = "Worker type is required";
    if (
      !formData.numberOfWorkersNeeded ||
      Number(formData.numberOfWorkersNeeded) < 1
    )
      newErrors.numberOfWorkersNeeded = "Number of workers needed is required";
    if (!formData.specificDuties)
      newErrors.specificDuties = "Specific duties are required";
    if (!formData.workingHoursAndSchedule)
      newErrors.workingHoursAndSchedule =
        "Working hours and schedule are required";
    if (selectedDays.length === 0)
      newErrors.selectedDays = "At least one working day must be selected";
    if (!formData.wagesOffered)
      newErrors.wagesOffered = "Wages offered are required";
    if (!formData.startDateRequired)
      newErrors.startDateRequired = "Start date is required";
    if (!formData.reasonForHiring)
      newErrors.reasonForHiring = "Reason for hiring is required";
    if (!formData.criminalRecord)
      newErrors.criminalRecord = "Criminal record preference is required";
    if (!formData.paymentMode)
      newErrors.paymentMode = "Payment mode is required";

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
        role: "homeowner" as const,
        age: formData.age,
        contactNumber: formData.contactNumber || "",
        homeAddress: formData.homeAddress || "",
        city: formData.city || "",
        state: formData.state || "",
        postalCode: formData.postalCode || "",
        typeOfResidence: formData.typeOfResidence,
        numberOfFamilyMembers: formData.numberOfFamilyMembers,
        homeComposition: formData.homeComposition,
        homeCompositionDetails: homeCompositionDetails
          .map(
            (d) =>
              `${d.count} ${d.type}(s) - ${d.age ? d.age + " years old" : "age not specified"}`,
          )
          .join(", "),
        nationalId: formData.nationalId,
        workerInfo: formData.workerInfo,
        specificDuties: formData.specificDuties,
        workingHoursAndSchedule: formData.workingHoursAndSchedule,
        numberOfWorkersNeeded: formData.numberOfWorkersNeeded,
        preferredGender: formData.preferredGender,
        languagePreference: formData.languagePreference,
        wagesOffered: formData.wagesOffered,
        reasonForHiring: formData.reasonForHiring,
        specialRequirements: formData.specialRequirements,
        startDateRequired: formData.startDateRequired,
        criminalRecord: formData.criminalRecord,
        paymentMode: formData.paymentMode,
        bankDetails: formData.bankDetails,
        religious: formData.religious,
        smokingDrinkingRestrictions: formData.smokingDrinkingRestrictions,
        specificSkillsNeeded: formData.specificSkillsNeeded,
        selectedDays: selectedDays.join(", "),
        termsAccepted: formData.termsAccepted || false,
      };

      await registerUser("homeowner", dataToSubmit);

      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/homeowner/login");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      toast.error(errorMessage);
      console.error("Registration failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16 bg-gradient-to-b from-white via-white to-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Homeowner Registration
            </h1>
            <p className="text-muted-foreground">
              Complete your profile to find the perfect household workers
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
                    htmlFor="age"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="homeAddress"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Home Address *
                  </label>
                  <input
                    type="text"
                    id="homeAddress"
                    name="homeAddress"
                    value={formData.homeAddress || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.homeAddress && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.homeAddress}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="typeOfResidence"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Type of Residence
                  </label>
                  <select
                    id="typeOfResidence"
                    name="typeOfResidence"
                    value={formData.typeOfResidence || ""}
                    onChange={handleChange}
                    disabled={loadingOptions}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingOptions ? "Loading..." : "Select Type"}
                    </option>
                    {residenceTypes.map((type) => (
                      <option key={type.id} value={type.name.toLowerCase()}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="numberOfFamilyMembers"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Number of Family Members
                  </label>
                  <input
                    type="number"
                    id="numberOfFamilyMembers"
                    name="numberOfFamilyMembers"
                    value={formData.numberOfFamilyMembers || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
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
                    National ID (16 digits, Optional)
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
                </div>
              </div>
            </fieldset>

            {/* Home Composition */}
            <fieldset className="mb-8 pb-8 border-b border-gray-200">
              <legend className="text-lg font-semibold text-foreground mb-6">
                Home Composition
              </legend>
              <div className="space-y-4">
                <div className="space-y-3">
                  {["Adults", "Children", "Elderly", "Pets"].map((type) => (
                    <div key={type} className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer w-24">
                        <input
                          type="checkbox"
                          checked={homeCompositionDetails.some(
                            (d) => d.type === type,
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setHomeCompositionDetails([
                                ...homeCompositionDetails,
                                { type, count: 1, age: "" },
                              ]);
                            } else {
                              setHomeCompositionDetails(
                                homeCompositionDetails.filter(
                                  (d) => d.type !== type,
                                ),
                              );
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-foreground">{type}</span>
                      </label>
                      {homeCompositionDetails.find((d) => d.type === type) && (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            placeholder="Count"
                            value={
                              homeCompositionDetails.find(
                                (d) => d.type === type,
                              )?.count || 1
                            }
                            onChange={(e) => {
                              setHomeCompositionDetails(
                                homeCompositionDetails.map((d) =>
                                  d.type === type
                                    ? { ...d, count: parseInt(e.target.value) }
                                    : d,
                                ),
                              );
                            }}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          {type !== "Pets" && (
                            <input
                              type="number"
                              min="0"
                              placeholder="Age"
                              value={
                                homeCompositionDetails.find(
                                  (d) => d.type === type,
                                )?.age || ""
                              }
                              onChange={(e) => {
                                setHomeCompositionDetails(
                                  homeCompositionDetails.map((d) =>
                                    d.type === type
                                      ? { ...d, age: e.target.value }
                                      : d,
                                  ),
                                );
                              }}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </fieldset>

            {/* Worker Requirements */}
            <fieldset className="mb-8 pb-8 border-b border-gray-200">
              <legend className="text-lg font-semibold text-foreground mb-6">
                Worker Requirements
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="workerInfo"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Worker Info (Full-time/Part-time/Live-in)
                  </label>
                  <select
                    id="workerInfo"
                    name="workerInfo"
                    value={formData.workerInfo || ""}
                    onChange={handleChange}
                    disabled={loadingOptions}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingOptions ? "Loading..." : "Select Option"}
                    </option>
                    {workerInfos.map((info) => (
                      <option
                        key={info.id}
                        value={info.name.toLowerCase().replace(/\s+/g, "-")}
                      >
                        {info.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="numberOfWorkersNeeded"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Number of Workers Needed
                  </label>
                  <input
                    type="number"
                    id="numberOfWorkersNeeded"
                    name="numberOfWorkersNeeded"
                    value={formData.numberOfWorkersNeeded || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="specificDuties"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Specific Duties
                  </label>
                  <textarea
                    id="specificDuties"
                    name="specificDuties"
                    value={formData.specificDuties || ""}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Please describe the specific duties and responsibilities for the worker(s)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-4">
                    Working Hours and Schedule
                  </label>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="time"
                        placeholder="Start time"
                        value={
                          formData.workingHoursAndSchedule
                            ?.split("-")[0]
                            ?.trim() || ""
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            workingHoursAndSchedule:
                              e.target.value +
                              " - " +
                              (formData.workingHoursAndSchedule
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
                          formData.workingHoursAndSchedule
                            ?.split("-")[1]
                            ?.trim() || ""
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            workingHoursAndSchedule:
                              (formData.workingHoursAndSchedule
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
                      {days.map((day) => (
                        <label
                          key={day}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDays.includes(day)}
                            onChange={() => handleDayToggle(day)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm">{day.slice(0, 3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="preferredGender"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Preferred Gender (if applicable)
                  </label>
                  <select
                    id="preferredGender"
                    name="preferredGender"
                    value={formData.preferredGender || ""}
                    onChange={handleChange}
                    disabled={loadingOptions}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">No preference</option>
                    {gendersList.map((gender) => (
                      <option key={gender.id} value={gender.name.toLowerCase()}>
                        {gender.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="languagePreference"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Language Preference
                  </label>
                  <input
                    type="text"
                    id="languagePreference"
                    name="languagePreference"
                    value={formData.languagePreference || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="wagesOffered"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Wages Offered
                  </label>
                  <input
                    type="text"
                    id="wagesOffered"
                    name="wagesOffered"
                    value={formData.wagesOffered || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="startDateRequired"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Start Date Required
                  </label>
                  <input
                    type="date"
                    id="startDateRequired"
                    name="startDateRequired"
                    value={formData.startDateRequired || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </fieldset>

            {/* Additional Requirements */}
            <fieldset className="mb-8 pb-8 border-b border-gray-200">
              <legend className="text-lg font-semibold text-foreground mb-6">
                Additional Requirements
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="reasonForHiring"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Reason for Hiring
                  </label>
                  <input
                    type="text"
                    id="reasonForHiring"
                    name="reasonForHiring"
                    value={formData.reasonForHiring || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="criminalRecord"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Criminal Record Check Required
                  </label>
                  <select
                    id="criminalRecord"
                    name="criminalRecord"
                    value={formData.criminalRecord || ""}
                    onChange={handleChange}
                    disabled={loadingOptions}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingOptions ? "Loading..." : "Select"}
                    </option>
                    {criminalRecordOptions.map((option) => (
                      <option key={option.id} value={option.name.toLowerCase()}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="paymentMode"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Preferred Payment Mode
                  </label>
                  <select
                    id="paymentMode"
                    name="paymentMode"
                    value={formData.paymentMode || ""}
                    onChange={handleChange}
                    disabled={loadingOptions}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingOptions ? "Loading..." : "Select Mode"}
                    </option>
                    {paymentModes.map((mode) => (
                      <option
                        key={mode.id}
                        value={mode.name.toLowerCase().replace(/\s+/g, "-")}
                      >
                        {mode.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="bankDetails"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Bank Details (if applicable)
                  </label>
                  <input
                    type="text"
                    id="bankDetails"
                    name="bankDetails"
                    value={formData.bankDetails || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="religious"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Religious Preferences
                  </label>
                  <input
                    type="text"
                    id="religious"
                    name="religious"
                    value={formData.religious || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="smokingDrinkingRestrictions"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Smoking/Drinking Restrictions
                  </label>
                  <select
                    id="smokingDrinkingRestrictions"
                    name="smokingDrinkingRestrictions"
                    value={formData.smokingDrinkingRestrictions || ""}
                    onChange={handleChange}
                    disabled={loadingOptions}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingOptions ? "Loading..." : "Select Tolerance"}
                    </option>
                    {smokingDrinkingOptions.map((option) => (
                      <option
                        key={option.id}
                        value={option.name.toLowerCase().replace(/\s+/g, "_")}
                      >
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="specialRequirements"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Special Requirements
                  </label>
                  <textarea
                    id="specialRequirements"
                    name="specialRequirements"
                    value={formData.specialRequirements || ""}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="specificSkillsNeeded"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Specific Skills Needed
                  </label>
                  <textarea
                    id="specificSkillsNeeded"
                    name="specificSkillsNeeded"
                    value={formData.specificSkillsNeeded || ""}
                    onChange={handleChange}
                    rows={3}
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
                  onClick={() => navigate("/homeowner/login")}
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
                className="flex-1 px-6 py-0.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center h-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 px-6 py-0.5 border border-gray-300 text-foreground font-semibold rounded-lg hover:bg-gray-50 transition-colors h-8"
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
