import { useState } from "react";
import { Trash2, Edit2, Plus } from "lucide-react";

interface Training {
  id: string;
  title: string;
  category: "beginner" | "intermediate" | "expert";
  instructor: string;
  duration: number;
  status: "active" | "archived";
}

export default function AdminTraining() {
  const [trainings, setTrainings] = useState<Training[]>([
    {
      id: "1",
      title: "Basic Cleaning Techniques",
      category: "beginner",
      instructor: "Sarah Johnson",
      duration: 4,
      status: "active",
    },
    {
      id: "2",
      title: "Advanced Cooking Methods",
      category: "intermediate",
      instructor: "Chef Pierre",
      duration: 8,
      status: "active",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "beginner" as const,
    instructor: "",
    duration: 4,
  });

  const handleAddTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.instructor) {
      const newTraining: Training = {
        id: Date.now().toString(),
        ...formData,
        status: "active",
      };
      setTrainings([...trainings, newTraining]);
      setFormData({ title: "", category: "beginner", instructor: "", duration: 4 });
      setShowForm(false);
    }
  };

  const handleDeleteTraining = (id: string) => {
    setTrainings(trainings.filter((t) => t.id !== id));
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
          <h3 className="text-lg font-semibold text-foreground mb-4">Add New Training</h3>
          <form onSubmit={handleAddTraining} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Training Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
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
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <input
              type="number"
              placeholder="Duration (hours)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
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
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Category</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Instructor</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Duration</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trainings.map((training) => (
                <tr key={training.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{training.title}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                      {training.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{training.instructor}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{training.duration} hours</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {training.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
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
        </div>
      </div>
    </div>
  );
}
