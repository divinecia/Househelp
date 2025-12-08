import { useState, useEffect } from "react";
import { User, Mail, Home, Users, Edit2, Save, X } from "lucide-react";

interface HomeownerProfile {
  fullName: string;
  contactNumber: string;
  email: string;
  age?: string;
  homeAddress: string;
  city?: string;
  state?: string;
  postalCode?: string;
  typeOfResidence?: string;
  numberOfFamilyMembers?: string;
  homeComposition?: {
    adults: boolean;
    children: boolean;
    elderly: boolean;
    pets: boolean;
  };
  preferredGender?: string;
  languagePreference?: string;
  wagesOffered?: string;
  specialRequirements?: string;
}

export default function HomeownerProfile() {
  const [profile, setProfile] = useState<HomeownerProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<HomeownerProfile | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // TODO: Replace with actual API call
      const mockProfile: HomeownerProfile = {
        fullName: "John Doe",
        contactNumber: "+250 788 111 222",
        email: "john.doe@example.com",
        age: "35",
        homeAddress: "KN 123 St, Kimihurura",
        city: "Kigali",
        state: "Kigali City",
        postalCode: "00100",
        typeOfResidence: "Apartment",
        numberOfFamilyMembers: "4",
        homeComposition: {
          adults: true,
          children: true,
          elderly: false,
          pets: true,
        },
        preferredGender: "Any",
        languagePreference: "English, Kinyarwanda",
        wagesOffered: "RWF 150,000/month",
        specialRequirements: "Experience with pets",
      };

      setProfile(mockProfile);
      setEditedProfile(mockProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    setSaving(true);
    try {
      // TODO: Make API call to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setProfile(editedProfile);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setEditMode(false);
  };

  const handleChange = (field: keyof HomeownerProfile, value: unknown) => {
    if (editedProfile) {
      setEditedProfile({ ...editedProfile, [field]: value });
    }
  };

  const handleCompositionChange = (
    field: keyof NonNullable<HomeownerProfile["homeComposition"]>,
    value: boolean,
  ) => {
    if (editedProfile?.homeComposition) {
      setEditedProfile({
        ...editedProfile,
        homeComposition: {
          ...editedProfile.homeComposition,
          [field]: value,
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!profile || !editedProfile) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Edit2 size={16} className="mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              <Save size={16} className="mr-2" />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
            >
              <X size={16} className="mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Sections */}
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User size={20} className="mr-2" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editedProfile.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.fullName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editedProfile.age || ""}
                  onChange={(e) => handleChange("age", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.age || "N/A"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Mail size={20} className="mr-2" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{profile.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              {editMode ? (
                <input
                  type="tel"
                  value={editedProfile.contactNumber}
                  onChange={(e) =>
                    handleChange("contactNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.contactNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* Home Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Home size={20} className="mr-2" />
            Home Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Home Address
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editedProfile.homeAddress}
                  onChange={(e) => handleChange("homeAddress", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.homeAddress}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editedProfile.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.city || "N/A"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editedProfile.state || ""}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.state || "N/A"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type of Residence
              </label>
              {editMode ? (
                <select
                  value={editedProfile.typeOfResidence || ""}
                  onChange={(e) =>
                    handleChange("typeOfResidence", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {profile.typeOfResidence || "N/A"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editedProfile.postalCode || ""}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.postalCode || "N/A"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Family Composition */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users size={20} className="mr-2" />
            Family Composition
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Family Members
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editedProfile.numberOfFamilyMembers || ""}
                  onChange={(e) =>
                    handleChange("numberOfFamilyMembers", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">
                  {profile.numberOfFamilyMembers || "N/A"}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home Includes:
              </label>
              {editMode ? (
                <div className="flex flex-wrap gap-4">
                  {["adults", "children", "elderly", "pets"].map((key) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          editedProfile.homeComposition?.[
                            key as keyof typeof editedProfile.homeComposition
                          ] || false
                        }
                        onChange={(e) =>
                          handleCompositionChange(
                            key as keyof NonNullable<HomeownerProfile["homeComposition"]>,
                            e.target.checked
                          )
                        }
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {key}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.homeComposition &&
                    Object.entries(profile.homeComposition).map(
                      ([key, value]) =>
                        value && (
                          <span
                            key={key}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full capitalize"
                          >
                            {key}
                          </span>
                        ),
                    )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Worker Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Gender
              </label>
              {editMode ? (
                <select
                  value={editedProfile.preferredGender || ""}
                  onChange={(e) =>
                    handleChange("preferredGender", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="Any">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {profile.preferredGender || "N/A"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language Preference
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editedProfile.languagePreference || ""}
                  onChange={(e) =>
                    handleChange("languagePreference", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">
                  {profile.languagePreference || "N/A"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wages Offered
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editedProfile.wagesOffered || ""}
                  onChange={(e) => handleChange("wagesOffered", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.wagesOffered || "N/A"}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requirements
              </label>
              {editMode ? (
                <textarea
                  value={editedProfile.specialRequirements || ""}
                  onChange={(e) =>
                    handleChange("specialRequirements", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">
                  {profile.specialRequirements || "N/A"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
