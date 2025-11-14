import { useEffect, useState } from "react";
import { Award, BookOpen, BarChart2 } from "lucide-react";
import { apiGet } from "../../lib/api-client";

interface Training {
  id: string;
  title: string;
  category: "beginner" | "intermediate" | "expert";
  status: "pending" | "in_progress" | "completed";
  progress: number;
  hasCertificate: boolean;
  skills: string[];
  description?: string;
}

export default function WorkerTraining() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        const response = await apiGet("/trainings");

        if (response.success && response.data && Array.isArray(response.data)) {
          const trainingsData: Training[] = response.data.map((training: any) => {
            const categoryLower = (training.category || "beginner").toLowerCase();
            let category: "beginner" | "intermediate" | "expert" = "beginner";

            if (categoryLower.includes("advanced") || categoryLower.includes("intermediate")) {
              category = "intermediate";
            } else if (categoryLower.includes("expert") || categoryLower.includes("professional")) {
              category = "expert";
            }

            return {
              id: training.id,
              title: training.title,
              category,
              status: (training.status || "pending") as "pending" | "in_progress" | "completed",
              progress: training.progress || 0,
              hasCertificate: !!training.certificate_url,
              skills: training.description ? training.description.split(",").map(s => s.trim()) : [],
              description: training.description,
            };
          });

          setTrainings(trainingsData);
        } else {
          setTrainings([]);
        }
      } catch (error) {
        console.error("Error fetching trainings:", error);
        setTrainings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-blue-100 text-blue-700";
      case "expert":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Award className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <BarChart2 className="w-5 h-5 text-blue-600" />;
      case "pending":
        return <BookOpen className="w-5 h-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const completedCount = trainings.filter((t) => t.status === "completed").length;
  const inProgressCount = trainings.filter((t) => t.status === "in_progress").length;
  const pendingCount = trainings.filter((t) => t.status === "pending").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm animate-pulse h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Courses Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Available</p>
          <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
        </div>
      </div>

      {/* Training Courses */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Available Trainings</h2>
        {trainings.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm text-center text-muted-foreground">
            <p>No trainings available</p>
          </div>
        ) : (
          trainings.map((training) => (
            <div key={training.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(training.status)}
                    <h3 className="text-lg font-semibold text-foreground">{training.title}</h3>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(training.category)}`}>
                    {training.category}
                  </span>
                </div>
                {training.hasCertificate && (
                  <div className="text-center">
                    <Award className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
                    <p className="text-xs font-medium text-yellow-600">Certificate</p>
                  </div>
                )}
              </div>

              {training.progress > 0 && (
                <div className="my-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-sm font-bold text-primary">{training.progress}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${training.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {training.description && (
                <div className="py-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-foreground mb-2">Description:</p>
                  <p className="text-sm text-muted-foreground">{training.description}</p>
                </div>
              )}

              {training.skills.length > 0 && (
                <div className="py-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-foreground mb-2">Skills Covered:</p>
                  <div className="flex flex-wrap gap-2">
                    {training.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                  {training.status === "completed" ? "Review Course" : "Continue Learning"}
                </button>
                {training.status === "pending" && (
                  <button className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium">
                    Enroll
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
