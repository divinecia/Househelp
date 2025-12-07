import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertCircle, MapPin, Calendar, User } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  homeowner: string;
  location: string;
  date: string;
  time: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  amount: number;
}

export default function WorkerTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Deep House Cleaning',
          description: 'Complete deep cleaning of 3-bedroom house including kitchen and bathrooms',
          homeowner: 'John Doe',
          location: 'Kigali, Kimihurura',
          date: '2025-12-07',
          time: '09:00',
          status: 'pending',
          priority: 'high',
          amount: 35000
        },
        {
          id: '2',
          title: 'Garden Maintenance',
          description: 'Lawn mowing, weeding, and plant watering',
          homeowner: 'Jane Smith',
          location: 'Kigali, Remera',
          date: '2025-12-08',
          time: '14:00',
          status: 'pending',
          priority: 'medium',
          amount: 25000
        },
        {
          id: '3',
          title: 'Laundry Service',
          description: 'Washing and ironing of clothes',
          homeowner: 'Marie Claire',
          location: 'Kigali, Nyarutarama',
          date: '2025-12-06',
          time: '10:00',
          status: 'in-progress',
          priority: 'medium',
          amount: 15000
        },
        {
          id: '4',
          title: 'Window Cleaning',
          description: 'Clean all windows inside and outside',
          homeowner: 'Peter Johnson',
          location: 'Kigali, Kacyiru',
          date: '2025-12-05',
          time: '08:00',
          status: 'completed',
          priority: 'low',
          amount: 20000
        }
      ];

      setTasks(mockTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'medium':
        return <Clock size={16} className="text-yellow-600" />;
      case 'low':
        return <CheckCircle size={16} className="text-green-600" />;
    }
  };

  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter(task => task.status === filter);

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    // TODO: Make API call to update task status
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['all', 'pending', 'in-progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as typeof filter)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                filter === status
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {status}
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {status === 'all' ? tasks.length : tasks.filter(t => t.status === status).length}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No {filter !== 'all' ? filter : ''} tasks found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    {getPriorityIcon(task.priority)}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`px-3 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User size={16} className="mr-2 text-gray-400" />
                  {task.homeowner}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  {task.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  {task.date} at {task.time}
                </div>
                <div className="flex items-center text-sm text-gray-900 font-medium">
                  Amount: RWF {task.amount.toLocaleString()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {task.status === 'pending' && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'in-progress')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Start Task
                  </button>
                )}
                {task.status === 'in-progress' && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'completed')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Mark Complete
                  </button>
                )}
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
