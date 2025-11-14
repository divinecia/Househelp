import { useState, useEffect } from "react";
import { User, Save, X, Loader } from "lucide-react";
import { getUser } from "@/lib/auth";
import type { HomeownerData } from "@/lib/auth";
import {
  getResidenceTypes,
  getWorkerInfoOptions,
  getGenders,
  getPaymentMethods,
  updateHomeowner,
  apiGet,
} from "@/lib/api-client";
import { toast } from "sonner";

export default function HomeownerProfile() {
  const user = getUser("homeowner") as HomeownerData & { id?: string };
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [residenceTypes, setResidenceTypes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [workerInfos, setWorkerInfos] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [gendersList, setGendersList] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [paymentModes, setPaymentModes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [profileData, setProfileData] = useState({
    age: "32",
    homeAddress: "KG 123 St, Kigali",
    typeOfResidence: "apartment",
    numberOfFamilyMembers: "4",
    homeComposition: "2 Adults, 2 Children",
    workerInfo: "Full-time",
    specificDuties: "Cleaning, Cooking, Childcare",
    workingHoursAndSchedule: "08:00 - 17:00, Mon-Fri",
    numberOfWorkersNeeded: "2",
    preferredGender: "Female",
    languagePreference: "English, Kinyarwanda",
    wagesOffered: "50,000 - 100,000 RWF",
    reasonForHiring: "Household management assistance",
    specialRequirements: "Must have experience with children",
    startDateRequired: "2024-02-01",
    criminalRecord: "Yes, cleared",
    preferredPaymentMode: "Bank Transfer",
    bankDetails: "Sample Bank, Account: ****5678",
    religious: "Christian",
    smokingDrinkingRestrictions: "No smoking",
    specificSkillsNeeded: "Childcare, Cooking, Organization",
  });

  const [tempData, setTempData] = useState(profileData);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const [residences, workerInfoOpts, genders, payments, homeownerData] =
          await Promise.all([
            getResidenceTypes(),
            getWorkerInfoOptions(),
            getGenders(),
            getPaymentMethods(),
            apiGet(`/homeowners/${user.id}`),
          ]);

        if (residences.success && residences.data)
          setResidenceTypes(residences.data);
        if (workerInfoOpts.success && workerInfoOpts.data)
          setWorkerInfos(workerInfoOpts.data);
        if (genders.success && genders.data) setGendersList(genders.data);
        if (payments.success && payments.data) setPaymentModes(payments.data);

        // Load homeowner profile from database
        if (homeownerData.success && homeownerData.data) {
          const dbData = homeownerData.data;
          const newProfileData = {
            age: dbData.age || "32",
            homeAddress: dbData.home_address || "KG 123 St, Kigali",
            typeOfResidence: dbData.type_of_residence || "apartment",
            numberOfFamilyMembers: dbData.number_of_family_members || "4",
            homeComposition: dbData.home_composition || "2 Adults, 2 Children",
            workerInfo: dbData.worker_info || "Full-time",
            specificDuties: dbData.specific_duties || "Cleaning, Cooking, Childcare",
            workingHoursAndSchedule:
              dbData.working_hours_and_schedule || "08:00 - 17:00, Mon-Fri",
            numberOfWorkersNeeded: dbData.number_of_workers_needed || "2",
            preferredGender: dbData.preferred_gender || "Female",
            languagePreference: dbData.language_preference || "English, Kinyarwanda",
            wagesOffered: dbData.wages_offered || "50,000 - 100,000 RWF",
            reasonForHiring: dbData.reason_for_hiring || "Household management assistance",
            specialRequirements: dbData.special_requirements || "Must have experience with children",
            startDateRequired: dbData.start_date_required || "2024-02-01",
            criminalRecord: dbData.criminal_record_required || "Yes, cleared",
            preferredPaymentMode: dbData.payment_mode || "Bank Transfer",
            bankDetails: dbData.bank_details || "Sample Bank, Account: ****5678",
            religious: dbData.religious_preferences || "Christian",
            smokingDrinkingRestrictions:
              dbData.smoking_drinking_restrictions || "No smoking",
            specificSkillsNeeded: dbData.specific_skills_needed || "Childcare, Cooking, Organization",
          };
          setProfileData(newProfileData);
          setTempData(newProfileData);
        }
      } catch (error) {
        console.error("Failed to load profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
        setLoadingOptions(false);
      }
    };
    loadData();
  }, [user?.id]);

  const handleEdit = () => {
    setIsEditing(true);
    setTempData(profileData);
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error("User not found");
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        age: tempData.age,
        home_address: tempData.homeAddress,
        type_of_residence: tempData.typeOfResidence,
        number_of_family_members: tempData.numberOfFamilyMembers,
        home_composition: tempData.homeComposition,
        worker_info: tempData.workerInfo,
        specific_duties: tempData.specificDuties,
        working_hours_and_schedule: tempData.workingHoursAndSchedule,
        number_of_workers_needed: tempData.numberOfWorkersNeeded,
        preferred_gender: tempData.preferredGender,
        language_preference: tempData.languagePreference,
        wages_offered: tempData.wagesOffered,
        reason_for_hiring: tempData.reasonForHiring,
        special_requirements: tempData.specialRequirements,
        start_date_required: tempData.startDateRequired,
        criminal_record_required: tempData.criminalRecord,
        payment_mode: tempData.preferredPaymentMode,
        bank_details: tempData.bankDetails,
        religious_preferences: tempData.religious,
        smoking_drinking_restrictions: tempData.smokingDrinkingRestrictions,
        specific_skills_needed: tempData.specificSkillsNeeded,
      };

      const response = await updateHomeowner(user.id, updateData);
      if (response.success) {
        setProfileData(tempData);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(response.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Error saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setTempData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary">
            <User size={60} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {user?.fullName || "Homeowner"}
            </h2>
            <p className="text-muted-foreground">Homeowner Profile</p>
            {!isEditing && (
              <button
                onClick={handleEdit}
                disabled={isLoading}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Profile Information
        </h3>

        {isEditing ? (
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={tempData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Home Address
                </label>
                <input
                  type="text"
                  value={tempData.homeAddress}
                  onChange={(e) => handleChange("homeAddress", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type of Residence
                </label>
                <select
                  value={tempData.typeOfResidence}
                  onChange={(e) =>
                    handleChange("typeOfResidence", e.target.value)
                  }
                  disabled={loadingOptions}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingOptions ? "Loading..." : "Select Residence Type"}
                  </option>
                  {residenceTypes.map((type) => (
                    <option key={type.id} value={type.name.toLowerCase()}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Number of Family Members
                </label>
                <input
                  type="number"
                  value={tempData.numberOfFamilyMembers}
                  onChange={(e) =>
                    handleChange("numberOfFamilyMembers", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Home Composition
                </label>
                <input
                  type="text"
                  value={tempData.homeComposition}
                  onChange={(e) =>
                    handleChange("homeComposition", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Worker Info
                </label>
                <select
                  value={tempData.workerInfo}
                  onChange={(e) => handleChange("workerInfo", e.target.value)}
                  disabled={loadingOptions}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingOptions ? "Loading..." : "Select Worker Info"}
                  </option>
                  {workerInfos.map((info) => (
                    <option key={info.id} value={info.name}>
                      {info.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Specific Duties
                </label>
                <textarea
                  value={tempData.specificDuties}
                  onChange={(e) =>
                    handleChange("specificDuties", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Working Hours and Schedule
                </label>
                <input
                  type="text"
                  value={tempData.workingHoursAndSchedule}
                  onChange={(e) =>
                    handleChange("workingHoursAndSchedule", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Number of Workers Needed
                </label>
                <input
                  type="number"
                  value={tempData.numberOfWorkersNeeded}
                  onChange={(e) =>
                    handleChange("numberOfWorkersNeeded", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preferred Gender
                </label>
                <select
                  value={tempData.preferredGender}
                  onChange={(e) =>
                    handleChange("preferredGender", e.target.value)
                  }
                  disabled={loadingOptions}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingOptions ? "Loading..." : "Select Gender"}
                  </option>
                  <option value="No preference">No preference</option>
                  {gendersList.map((gender) => (
                    <option key={gender.id} value={gender.name}>
                      {gender.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Language Preference
                </label>
                <input
                  type="text"
                  value={tempData.languagePreference}
                  onChange={(e) =>
                    handleChange("languagePreference", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Wages Offered
                </label>
                <input
                  type="text"
                  value={tempData.wagesOffered}
                  onChange={(e) => handleChange("wagesOffered", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reason for Hiring
                </label>
                <input
                  type="text"
                  value={tempData.reasonForHiring}
                  onChange={(e) =>
                    handleChange("reasonForHiring", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Special Requirements
                </label>
                <textarea
                  value={tempData.specialRequirements}
                  onChange={(e) =>
                    handleChange("specialRequirements", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Date Required
                </label>
                <input
                  type="date"
                  value={tempData.startDateRequired}
                  onChange={(e) =>
                    handleChange("startDateRequired", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Criminal Record
                </label>
                <input
                  type="text"
                  value={tempData.criminalRecord}
                  onChange={(e) =>
                    handleChange("criminalRecord", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preferred Payment Mode
                </label>
                <select
                  value={tempData.preferredPaymentMode}
                  onChange={(e) =>
                    handleChange("preferredPaymentMode", e.target.value)
                  }
                  disabled={loadingOptions}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingOptions ? "Loading..." : "Select Payment Mode"}
                  </option>
                  {paymentModes.map((mode) => (
                    <option key={mode.id} value={mode.name}>
                      {mode.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bank Details
                </label>
                <input
                  type="text"
                  value={tempData.bankDetails}
                  onChange={(e) => handleChange("bankDetails", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Religious Preferences
                </label>
                <input
                  type="text"
                  value={tempData.religious}
                  onChange={(e) => handleChange("religious", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Smoking/Drinking Restrictions
                </label>
                <input
                  type="text"
                  value={tempData.smokingDrinkingRestrictions}
                  onChange={(e) =>
                    handleChange("smokingDrinkingRestrictions", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Specific Skills Needed
                </label>
                <textarea
                  value={tempData.specificSkillsNeeded}
                  onChange={(e) =>
                    handleChange("specificSkillsNeeded", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-foreground rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {Object.entries(profileData).map(([key, value]) => (
              <div
                key={key}
                className="border-b border-gray-200 pb-4 last:border-0"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim()}
                </p>
                <p className="text-foreground font-medium">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
