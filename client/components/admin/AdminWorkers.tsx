import { useState, useEffect } from "react";
import { Trash2, Edit2, Plus, Loader } from "lucide-react";
import { getWorkers, deleteWorker } from "@/lib/api-client";
import { toast } from "sonner";

interface Worker {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  type_of_work: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
}

export default function AdminWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    typeOfWork: "",
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setIsLoading(true);
    try {
      const response = await getWorkers();
      if (response.success && response.data) {
        setWorkers(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch workers");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Worker registration is handled through /worker/register page");
    setShowForm(false);
    setFormData({ fullName: "", email: "", phoneNumber: "", typeOfWork: "" });
  };

  const handleDeleteWorker = async (id: string) => {
    if (!confirm("Are you sure you want to delete this worker?")) return;

    try {
      const response = await deleteWorker(id);
      if (response.success) {
        toast.success("Worker deleted successfully");
        setWorkers(workers.filter((w) => w.id !== id));
      } else {
        toast.error(response.error || "Failed to delete worker");
      }
    } catch (error) {
      toast.error("Error deleting worker");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Worker Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Plus size={18} />
        Add New Worker
      </button>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Add New Worker</h3>
          <form onSubmit={handleAddWorker} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Type of Work"
              value={formData.typeOfWork}
              onChange={(e) => setFormData({ ...formData, typeOfWork: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="md:col-span-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add Worker
            </button>
          </form>
        </div>
      )}

      {/* Workers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader size={20} className="animate-spin" />
              <span>Loading workers...</span>
            </div>
          ) : workers.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No workers found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Type of Work</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{worker.full_name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{worker.email}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{worker.phone_number}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{worker.type_of_work}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        worker.status === 'active' ? 'bg-green-100 text-green-700' :
                        worker.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {worker.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(worker.created_at).toLocaleDateString()}
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
                          onClick={() => handleDeleteWorker(worker.id)}
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
