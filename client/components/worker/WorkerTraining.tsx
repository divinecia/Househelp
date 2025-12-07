import { useState, useEffect } from "react";
import { BookOpen, Clock, CheckCircle, Award, Play, FileText } from "lucide-react";
import { toast } from "sonner";

interface Training {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  certificate?: string;
  completedDate?: string;
}

export default function WorkerTraining() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [filter, setFilter] = useState<'all' | 'not-started' | 'in-progress' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockTrainings: Training[] = [
        {
          id: '1',
          title: 'Basic House Cleaning',
          description: 'Learn the fundamentals of professional house cleaning including proper techniques and safety measures',
          category: 'House Cleaning',
          duration: '2 hours',
          status: 'completed',
          progress: 100,
          certificate: 'CERT-HC-001',
          completedDate: '2025-11-15'
        },
        {
          id: '2',
          title: 'Advanced Laundry Techniques',
          description: 'Master different fabric care, stain removal, and proper ironing techniques',
          category: 'Laundry',
          duration: '3 hours',
          status: 'in-progress',
          progress: 65
        },
        {
          id: '3',
          title: 'Safety and First Aid',
          description: 'Essential safety procedures and basic first aid for domestic workers',
          category: 'Safety',
          duration: '4 hours',
          status: 'completed',
          progress: 100,
          certificate: 'CERT-SF-001',
          completedDate: '2025-10-20'
        },
        {
          id: '4',
          title: 'Professional Communication',
          description: 'Effective communication skills for working with homeowners and families',
          category: 'Soft Skills',
          duration: '2 hours',
          status: 'not-started',
          progress: 0
        },
        {
          id: '5',
          title: 'Kitchen Hygiene & Food Safety',
          description: 'Comprehensive training on kitchen cleanliness and food handling safety',
          category: 'Kitchen',
          duration: '3 hours',
          status: 'not-started',
          progress: 0
        },
        {
          id: '6',
          title: 'Garden Maintenance Basics',
          description: 'Introduction to lawn care, plant maintenance, and basic gardening',
          category: 'Gardening',
          duration: '2.5 hours',
          status: 'in-progress',
          progress: 30
        }
      ];

      setTrainings(mockTrainings);
    } catch (error) {
      console.error('Error fetching trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Training['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'not-started':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Training['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'in-progress':
        return <Clock size={20} className="text-yellow-600" />;
      case 'not-started':
        return <Play size={20} className="text-blue-600" />;
    }
  };

  const filteredTrainings = filter === 'all'
    ? trainings
    : trainings.filter(training => training.status === filter);

  const completedCount = trainings.filter(t => t.status === 'completed').length;
  const inProgressCount = trainings.filter(t => t.status === 'in-progress').length;

  const startTraining = (trainingId: string) => {
    // TODO: Navigate to training module or start training
    toast.info(`Training module ${trainingId} coming soon`);
  };

  const continueTraining = (trainingId: string) => {
    // TODO: Navigate to training module
    toast.info(`Continue training ${trainingId}`);
  };

  const downloadCertificate = (certificate: string) => {
    // TODO: Download certificate
    toast.success(`Certificate ${certificate} download initiated`);
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
      {/* Training Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Trainings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{trainings.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-full text-white">
              <BookOpen size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{completedCount}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-full text-white">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{inProgressCount}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-full text-white">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['all', 'not-started', 'in-progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as typeof filter)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                filter === status
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {status.replace('-', ' ')}
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {status === 'all' ? trainings.length : trainings.filter(t => t.status === status).length}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Trainings List */}
      {filteredTrainings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <BookOpen size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No {filter !== 'all' ? filter.replace('-', ' ') : ''} trainings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTrainings.map((training) => (
            <div key={training.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(training.status)}
                    <h3 className="text-lg font-semibold text-gray-900">{training.title}</h3>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(training.status)}`}>
                    {training.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{training.description}</p>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-900">{training.category}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">{training.duration}</span>
                </div>

                {training.status === 'in-progress' && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium text-gray-900">{training.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${training.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {training.status === 'completed' && training.certificate && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-medium text-gray-900">{training.completedDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Certificate:</span>
                      <span className="font-medium text-gray-900">{training.certificate}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                {training.status === 'not-started' && (
                  <button
                    onClick={() => startTraining(training.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    Start Training
                  </button>
                )}
                {training.status === 'in-progress' && (
                  <button
                    onClick={() => continueTraining(training.id)}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm font-medium"
                  >
                    Continue
                  </button>
                )}
                {training.status === 'completed' && training.certificate && (
                  <button
                    onClick={() => downloadCertificate(training.certificate!)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center justify-center"
                  >
                    <Award size={16} className="mr-2" />
                    Download Certificate
                  </button>
                )}
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium flex items-center">
                  <FileText size={16} className="mr-2" />
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
