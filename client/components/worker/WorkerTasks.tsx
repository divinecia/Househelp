import { useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  frequency: "daily" | "weekly" | "monthly";
  dueDate?: string;
}

export default function WorkerTasks() {
  const [activeFrequency, setActiveFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Check new job requests",
      completed: true,
      frequency: "daily",
      dueDate: "2024-01-28",
    },
    {
      id: "2",
      title: "Update profile information",
      completed: false,
      frequency: "daily",
      dueDate: "2024-01-28",
    },
    {
      id: "3",
      title: "Complete certification course",
      completed: false,
      frequency: "weekly",
      dueDate: "2024-02-04",
    },
    {
      id: "4",
      title: "Monthly performance review",
      completed: false,
      frequency: "monthly",
      dueDate: "2024-02-28",
    },
  ]);

  const [newTask, setNewTask] = useState("");

  const filteredTasks = tasks.filter((t) => t.frequency === activeFrequency);

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now().toString(),
          title: newTask,
          completed: false,
          frequency: activeFrequency,
          dueDate: new Date().toISOString().split("T")[0],
        },
      ]);
      setNewTask("");
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Frequency Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["daily", "weekly", "monthly"] as const).map((freq) => (
          <button
            key={freq}
            onClick={() => setActiveFrequency(freq)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors capitalize ${
              activeFrequency === freq
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {freq}
          </button>
        ))}
      </div>

      {/* Add Task */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Add a ${activeFrequency} task...`}
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            onClick={handleAddTask}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No {activeFrequency} tasks yet</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={24} className="text-green-600" />
                    ) : (
                      <Circle size={24} />
                    )}
                  </button>
                  <div>
                    <p
                      className={`font-medium transition-all ${
                        task.completed
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Progress */}
      {filteredTasks.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Progress</p>
            <p className="text-sm font-bold text-primary">
              {Math.round((filteredTasks.filter((t) => t.completed).length / filteredTasks.length) * 100)}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(filteredTasks.filter((t) => t.completed).length / filteredTasks.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
