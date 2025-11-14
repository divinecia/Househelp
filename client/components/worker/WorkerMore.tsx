import { useState, useEffect } from "react";
import { AlertCircle, LogOut, Send, X } from "lucide-react";
import { toast } from "sonner";
import { getReportTypes } from "@/lib/api-client";

interface MoreMenuProps {
  onLogout: () => void;
}

export default function WorkerMore({ onLogout }: MoreMenuProps) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    issue: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [reportTypes, setReportTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  useEffect(() => {
    const loadReportTypes = async () => {
      setIsLoadingTypes(true);
      try {
        const result = await getReportTypes();
        if (result.success && result.data) {
          setReportTypes(result.data);
        }
      } catch (error) {
        console.error("Failed to load report types:", error);
      } finally {
        setIsLoadingTypes(false);
      }
    };
    loadReportTypes();
  }, []);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportData.issue || !reportData.description) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("auth_token") || ""}`,
        },
        body: JSON.stringify({
          issueType: reportData.issue,
          description: reportData.description,
          reportedBy: "worker",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Report submitted successfully!");
        setReportData({ issue: "", description: "" });
        setShowReportForm(false);
      } else {
        toast.error(result.error || "Failed to submit report");
      }
    } catch (error) {
      toast.error("Error submitting report");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Issue Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Report an Issue
        </h2>

        {!showReportForm ? (
          <button
            onClick={() => setShowReportForm(true)}
            className="w-full px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
          >
            Open Report Form
          </button>
        ) : (
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Issue Type
              </label>
              <select
                value={reportData.issue}
                onChange={(e) => setReportData({ ...reportData, issue: e.target.value })}
                disabled={isLoadingTypes}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                required
              >
                <option value="">{isLoadingTypes ? "Loading..." : "Select an issue type"}</option>
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={reportData.description}
                onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                placeholder="Please describe the issue in detail..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Send size={18} />
                {isLoading ? "Submitting..." : "Submit Report"}
              </button>
              <button
                type="button"
                onClick={() => setShowReportForm(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-foreground rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Account Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Account</h2>

        <button
          onClick={onLogout}
          className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Help & Support */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Help & Support</h2>
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
            FAQ
          </button>
          <button className="w-full text-left px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
            Contact Support
          </button>
          <button className="w-full text-left px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
            About HouseHelp
          </button>
        </div>
      </div>
    </div>
  );
}
