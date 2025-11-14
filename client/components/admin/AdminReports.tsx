import { useState, useEffect } from "react";
import { Trash2, Eye } from "lucide-react";
import { getReportTypes } from "@/lib/api-client";

interface Report {
  id: string;
  type: "system_issue" | "worker_behavior" | "review" | "rating";
  title: string;
  reporter: string;
  targetUser?: string;
  status: "pending" | "reviewed" | "resolved" | "closed";
  createdDate: string;
  rating?: number;
}

export default function AdminReports() {
  const [reportTypes, setReportTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      type: "system_issue",
      title: "Login page not loading",
      reporter: "John Doe",
      status: "pending",
      createdDate: "2024-01-28",
    },
    {
      id: "2",
      type: "worker_behavior",
      title: "Worker was late to appointment",
      reporter: "Alice Johnson",
      targetUser: "Jane Smith",
      status: "reviewed",
      createdDate: "2024-01-27",
    },
    {
      id: "3",
      type: "rating",
      title: "5-star review for excellent service",
      reporter: "Bob Wilson",
      targetUser: "John Doe",
      status: "closed",
      rating: 5,
      createdDate: "2024-01-26",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
  });

  useEffect(() => {
    const loadReportTypes = async () => {
      setIsLoadingTypes(true);
      try {
        const result = await getReportTypes();
        if (result.success && result.data) {
          setReportTypes(result.data);
          if (result.data.length > 0) {
            setFormData((prev) => ({ ...prev, type: result.data[0].name }));
          }
        }
      } catch (error) {
        console.error("Failed to load report types:", error);
      } finally {
        setIsLoadingTypes(false);
      }
    };
    loadReportTypes();
  }, []);

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title) {
      const newReport: Report = {
        id: Date.now().toString(),
        ...formData,
        reporter: "Admin",
        status: "pending",
        createdDate: new Date().toISOString().split("T")[0],
      };
      setReports([...reports, newReport]);
      setFormData({ type: "system_issue", title: "" });
      setShowForm(false);
    }
  };

  const handleDeleteReport = (id: string) => {
    setReports(reports.filter((r) => r.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "system_issue":
        return "bg-red-100 text-red-700";
      case "worker_behavior":
        return "bg-orange-100 text-orange-700";
      case "review":
      case "rating":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Report Form Toggle */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        {showForm ? "Cancel" : "Add New Report"}
      </button>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Add New Report</h3>
          <form onSubmit={handleAddReport} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              disabled={isLoadingTypes}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">{isLoadingTypes ? "Loading..." : "Select Report Type"}</option>
              {reportTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Report Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="md:col-span-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add Report
            </button>
          </form>
        </div>
      )}

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Type</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Reporter</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Target User</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(report.type)}`}>
                      {report.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{report.title}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{report.reporter}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{report.targetUser || "N/A"}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.status === "closed" ? "bg-gray-100 text-gray-700" :
                      report.status === "resolved" ? "bg-green-100 text-green-700" :
                      report.status === "reviewed" ? "bg-blue-100 text-blue-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{report.createdDate}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
