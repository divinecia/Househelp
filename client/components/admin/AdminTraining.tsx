import { useState, useEffect } from "react";
import { Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, apiDelete } from "../../lib/api-client";

interface Training {
  id: string;
  title: string;
  category: string;
  instructor: string;
  start_date?: string;
  end_date?: string;
  status: "active" | "inactive" | "completed";
  description?: string;
}

export default function AdminTraining() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "beginner",
    instructor: "",
    startDate: "",
    description: "",
    duration: 1,
  });

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    setIsLoading(true);
    try {
      const result = await apiGet("/trainings");
      if (result.success && result.data) {
        setTrainings(result.data);
      } else {
        toast.error(result.error || "Failed to fetch trainings");
      }
    } catch (error) {
      toast.error("Failed to fetch trainings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTraining = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.instructor) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiPost("/trainings", {
        title: formData.title,
        category: formData.category,
        instructor: formData.instructor,
        start_date: formData.startDate,
        description: formData.description,
        status: "active",
      });

      if (result.success) {
        toast.success("Training added successfully!");
        setFormData({
          title: "",
          category: "beginner",
          instructor: "",
          startDate: "",
          description: "",
          duration: 1,
        });
        setShowForm(false);
        await fetchTrainings();
      } else {
        toast.error(result.error || "Failed to add training");
      }
    } catch (error) {
      toast.error("Error adding training");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTraining = async (id: string) => {
    if (!confirm("Are you sure you want to delete this training?")) return;

    try {
      const response = await fetch(`/api/trainings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("auth_token") || ""}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Training deleted successfully");
        setTrainings(trainings.filter((t) => t.id !== id));
      } else {
        toast.error(result.error || "Failed to delete training");
      }
    } catch (error) {
      toast.error("Error deleting training");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Training Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Plus size={18} />
        Add New Training
      </button>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Add New Training
          </h3>
          <form
            onSubmit={handleAddTraining}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              placeholder="Training Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as any })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
            <input
              type="text"
              placeholder="Instructor Name"
              value={formData.instructor}
              onChange={(e) =>
                setFormData({ ...formData, instructor: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <input
              type="number"
              placeholder="Duration (hours)"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              min="1"
            />
            <button
              type="submit"
              className="md:col-span-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add Training
            </button>
          </form>
        </div>
      )}

      {/* Training Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              Loading trainings...
            </div>
          ) : trainings.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No trainings found
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {trainings.map((training) => (
                  <tr
                    key={training.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {training.title}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                        {training.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {training.instructor}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {training.start_date
                        ? new Date(training.start_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          training.status === "active"
                            ? "bg-green-100 text-green-700"
                            : training.status === "inactive"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {training.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTraining(training.id)}
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
          )}
        </div>
      </div>
    </div>
  );
}
