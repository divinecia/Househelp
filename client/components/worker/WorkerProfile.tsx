import { useState, useEffect } from "react";
import { User, Save, X } from "lucide-react";
import { getMaritalStatuses } from "@/lib/api-client";

export default function WorkerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [maritalStatuses, setMaritalStatuses] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
  const [profileData, setProfileData] = useState({
    maritalStatus: "single",
    typeOfWork: "Cleaning",
    workExperience: "5",
    expectedWages: "50000 per hour",
    workingHoursAndDays: "08:00 - 17:00, Mon-Fri",
    educationQualification: "High School",
    trainingCertificate: "Advanced Cleaning",
    languageProficiency: "English (Fluent), Kinyarwanda (Native)",
    healthCondition: "No allergies",
    emergencyName: "John Doe",
    emergencyContact: "+250 123 456 789",
    bankAccountNumber: "****5678",
    accountHolder: "Jane Smith",
  });

  const [tempData, setTempData] = useState(profileData);

  useEffect(() => {
    const loadStatuses = async () => {
      setIsLoadingStatuses(true);
      try {
        const result = await getMaritalStatuses();
        if (result.success && result.data) {
          setMaritalStatuses(result.data);
        }
      } catch (error) {
        console.error("Failed to load marital statuses:", error);
      } finally {
        setIsLoadingStatuses(false);
      }
    };
    loadStatuses();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setTempData(profileData);
  };

  const handleSave = () => {
    setProfileData(tempData);
    setIsEditing(false);
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
            <h2 className="text-2xl font-bold text-foreground">Jane Smith</h2>
            <p className="text-muted-foreground">Worker Profile</p>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
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
          Professional Information
        </h3>

        <div className="space-y-6">
          {isEditing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Marital Status
                  </label>
                  <select
                    value={tempData.maritalStatus}
                    onChange={(e) =>
                      handleChange("maritalStatus", e.target.value)
                    }
                    disabled={isLoadingStatuses}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">
                      {isLoadingStatuses ? "Loading..." : "Select Status"}
                    </option>
                    {maritalStatuses.map((status) => (
                      <option key={status.id} value={status.name.toLowerCase()}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Type of Work
                  </label>
                  <input
                    type="text"
                    value={tempData.typeOfWork}
                    onChange={(e) => handleChange("typeOfWork", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Work Experience (years)
                  </label>
                  <input
                    type="text"
                    value={tempData.workExperience}
                    onChange={(e) =>
                      handleChange("workExperience", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Expected Wages
                  </label>
                  <input
                    type="text"
                    value={tempData.expectedWages}
                    onChange={(e) =>
                      handleChange("expectedWages", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Working Hours and Days
                  </label>
                  <input
                    type="text"
                    value={tempData.workingHoursAndDays}
                    onChange={(e) =>
                      handleChange("workingHoursAndDays", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Education Qualification
                  </label>
                  <input
                    type="text"
                    value={tempData.educationQualification}
                    onChange={(e) =>
                      handleChange("educationQualification", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Training Certificate
                  </label>
                  <input
                    type="text"
                    value={tempData.trainingCertificate}
                    onChange={(e) =>
                      handleChange("trainingCertificate", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Language Proficiency
                  </label>
                  <input
                    type="text"
                    value={tempData.languageProficiency}
                    onChange={(e) =>
                      handleChange("languageProficiency", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Health Condition / Insurance
                  </label>
                  <input
                    type="text"
                    value={tempData.healthCondition}
                    onChange={(e) =>
                      handleChange("healthCondition", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={tempData.emergencyName}
                    onChange={(e) =>
                      handleChange("emergencyName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Emergency Contact Number
                  </label>
                  <input
                    type="text"
                    value={tempData.emergencyContact}
                    onChange={(e) =>
                      handleChange("emergencyContact", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={tempData.bankAccountNumber}
                    onChange={(e) =>
                      handleChange("bankAccountNumber", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={tempData.accountHolder}
                    onChange={(e) =>
                      handleChange("accountHolder", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-foreground rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {Object.entries(profileData).map(([key, value]) => (
                <div
                  key={key}
                  className="border-b border-gray-200 pb-4 last:border-0"
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p className="text-foreground font-medium">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
