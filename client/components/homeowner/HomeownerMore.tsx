import { useState } from "react";
import { Star, AlertCircle, LogOut, Send, X } from "lucide-react";
import { updateBooking } from "@/lib/api-client";
import { toast } from "sonner";

interface MoreMenuProps {
  onLogout: () => void;
}

export default function HomeownerMore({ onLogout }: MoreMenuProps) {
  const [activeTab, setActiveTab] = useState<"rate" | "report">("rate");
  const [ratingData, setRatingData] = useState({
    worker: "",
    rating: 5,
    review: "",
  });
  const [reportData, setReportData] = useState({
    issue: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ratingData.worker) {
      toast.error("Please select a worker");
      return;
    }

    setIsLoading(true);
    try {
      // Submit rating by updating the booking with rating and review
      const response = await updateBooking(ratingData.worker, {
        rating: ratingData.rating,
        review: ratingData.review,
        status: "completed",
      });

      if (response.success) {
        toast.success("Rating submitted successfully!");
        setRatingData({ worker: "", rating: 5, review: "" });
      } else {
        toast.error(response.error || "Failed to submit rating");
      }
    } catch (error) {
      toast.error("Error submitting rating");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportData.issue || !reportData.description) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // Submit report via API
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("auth_token") || ""}`,
        },
        body: JSON.stringify({
          issueType: reportData.issue,
          description: reportData.description,
          reportedBy: "homeowner",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Report submitted successfully!");
        setReportData({ issue: "", description: "" });
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
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("rate")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "rate"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star size={18} />
          Rate Worker
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "report"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <AlertCircle size={18} />
          Report Issue
        </button>
      </div>

      {/* Rate Worker Tab */}
      {activeTab === "rate" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Rate a Worker</h2>
          <form onSubmit={handleSubmitRating} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Worker
              </label>
              <select
                value={ratingData.worker}
                onChange={(e) => setRatingData({ ...ratingData, worker: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Choose a worker...</option>
                <option value="john-doe">John Doe</option>
                <option value="jane-smith">Jane Smith</option>
                <option value="mike-johnson">Mike Johnson</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rating (out of 5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingData({ ...ratingData, rating: star })}
                    className={`text-3xl transition-colors ${
                      star <= ratingData.rating
                        ? "text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Review (Optional)
              </label>
              <textarea
                value={ratingData.review}
                onChange={(e) => setRatingData({ ...ratingData, review: e.target.value })}
                placeholder="Share your experience with this worker..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {isLoading ? "Submitting..." : "Submit Rating"}
            </button>
          </form>
        </div>
      )}

      {/* Report Issue Tab */}
      {activeTab === "report" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Report an Issue</h2>
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Issue Type
              </label>
              <select
                value={reportData.issue}
                onChange={(e) => setReportData({ ...reportData, issue: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select an issue type</option>
                <option value="worker-behavior">Worker Behavior</option>
                <option value="quality-issue">Quality Issue</option>
                <option value="payment-issue">Payment Issue</option>
                <option value="technical-issue">Technical Issue</option>
                <option value="other">Other</option>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {isLoading ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </div>
      )}

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
