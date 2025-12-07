import { useState, useEffect } from "react";
import { Search, Download, Eye, Star, Briefcase, Link, Plus, Phone } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  service: string;
  worker: string;
  date: string;
  time: string;
  status: 'completed' | 'in-progress' | 'scheduled' | 'cancelled';
  amount: number;
  location: string;
  rating?: number;
  workerPhone?: string;
}

export default function HomeownerJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // TODO: Replace with actual API calls
      // Mock data for jobs
      const mockJobs: Job[] = [
        {
          id: '1',
          service: 'House Cleaning',
          worker: 'Alice Mukamana',
          date: '2024-01-14',
          time: '09:00',
          status: 'completed',
          amount: 25000,
          location: 'Kigali, Kimihurura',
          rating: 5,
          workerPhone: '+250 788 123 456'
        },
        {
          id: '2',
          service: 'Laundry Service',
          worker: 'Jean Baptiste',
          date: '2024-01-13',
          time: '14:00',
          status: 'completed',
          amount: 15000,
          location: 'Kigali, Remera',
          rating: 4,
          workerPhone: '+250 788 234 567'
        },
        {
          id: '3',
          service: 'Garden Maintenance',
          worker: 'Marie Claire',
          date: '2024-01-12',
          time: '08:00',
          status: 'completed',
          amount: 30000,
          location: 'Kigali, Nyarutarama',
          rating: 5,
          workerPhone: '+250 788 345 678'
        },
        {
          id: '4',
          service: 'Deep Cleaning',
          worker: 'Peter Habimana',
          date: '2024-01-15',
          time: '10:00',
          status: 'scheduled',
          amount: 35000,
          location: 'Kigali, Kacyiru',
          workerPhone: '+250 788 456 789'
        },
        {
          id: '5',
          service: 'Carpet Cleaning',
          worker: 'Grace Uwase',
          date: '2024-01-16',
          time: '15:00',
          status: 'scheduled',
          amount: 20000,
          location: 'Kigali, Gisozi',
          workerPhone: '+250 788 567 890'
        }
      ];

      setJobs(mockJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.worker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRateWorker = (jobId: string) => {
    // TODO: Implement rating functionality
    toast.info(`Rating feature for job ${jobId} coming soon`);
  };

  const handleContactWorker = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  const handleViewDetails = (jobId: string) => {
    // TODO: Implement view details functionality
    toast.info(`View details for job ${jobId}`);
  };

  const exportJobs = () => {
    // TODO: Implement export functionality
    toast.info('Export feature coming soon');
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Jobs</h2>
          <p className="text-gray-600">Manage your household service jobs</p>
        </div>
        <button
          onClick={exportJobs}
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <Download size={20} className="mr-2" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search jobs, workers, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="scheduled">Scheduled</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'You haven\'t booked any services yet'
            }
          </p>
          <Link
            to="/homeowner/booking"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Book a Service
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.service}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Worker:</strong> {job.worker}</p>
                    <p><strong>Date:</strong> {job.date} at {job.time}</p>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Amount:</strong> RWF {job.amount.toLocaleString()}</p>
                  </div>
                  {job.rating && job.status === 'completed' && (
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-600 mr-2">Your rating:</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${
                              i < job.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleViewDetails(job.id)}
                    className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Eye size={16} className="mr-1" />
                    Details
                  </button>
                  
                  {job.workerPhone && (
                    <button
                      onClick={() => handleContactWorker(job.workerPhone!)}
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <Phone size={16} className="mr-1" />
                      Contact
                    </button>
                  )}
                  
                  {job.status === 'completed' && !job.rating && (
                    <button
                      onClick={() => handleRateWorker(job.id)}
                      className="inline-flex items-center px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                    >
                      <Star size={16} className="mr-1" />
                      Rate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}