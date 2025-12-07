import { useState, useEffect } from "react";
import { Calendar, MapPin, DollarSign, Clock, User, Search, Filter } from "lucide-react";
import { toast } from "sonner";

interface Worker {
  id: string;
  name: string;
  rating: number;
  experience: string;
  hourlyRate: number;
  services: string[];
  availability: string;
  photo?: string;
}

interface Booking {
  id: string;
  worker: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  amount: number;
  location: string;
}

export default function HomeownerBooking() {
  const [activeTab, setActiveTab] = useState<'book' | 'my-bookings'>('book');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockWorkers: Worker[] = [
        {
          id: '1',
          name: 'Alice Mukamana',
          rating: 4.8,
          experience: '5 years',
          hourlyRate: 5000,
          services: ['House Cleaning', 'Laundry', 'Cooking'],
          availability: 'Available',
        },
        {
          id: '2',
          name: 'Jean Baptiste',
          rating: 4.6,
          experience: '3 years',
          hourlyRate: 4500,
          services: ['Garden Maintenance', 'House Cleaning'],
          availability: 'Available',
        },
        {
          id: '3',
          name: 'Marie Claire',
          rating: 4.9,
          experience: '7 years',
          hourlyRate: 6000,
          services: ['Childcare', 'Cooking', 'House Cleaning'],
          availability: 'Busy until Dec 10',
        },
      ];

      const mockBookings: Booking[] = [
        {
          id: '1',
          worker: 'Alice Mukamana',
          service: 'House Cleaning',
          date: '2025-12-07',
          time: '09:00',
          duration: '4 hours',
          status: 'confirmed',
          amount: 20000,
          location: 'Kigali, Kimihurura',
        },
        {
          id: '2',
          worker: 'Jean Baptiste',
          service: 'Garden Maintenance',
          date: '2025-12-08',
          time: '14:00',
          duration: '3 hours',
          status: 'pending',
          amount: 13500,
          location: 'Kigali, Remera',
        },
      ];

      setWorkers(mockWorkers);
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesService = selectedService === 'all' || worker.services.includes(selectedService);
    return matchesSearch && matchesService;
  });

  const bookWorker = (workerId: string) => {
    // TODO: Navigate to booking form or open modal
    toast.info(`Booking feature for worker ${workerId} coming soon`);
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
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('book')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'book'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Book a Worker
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-bookings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Bookings
            <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
              {bookings.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Book a Worker Tab */}
      {activeTab === 'book' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workers or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Services</option>
                  <option value="House Cleaning">House Cleaning</option>
                  <option value="Laundry">Laundry</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Childcare">Childcare</option>
                  <option value="Garden Maintenance">Garden Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Workers List */}
          {filteredWorkers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <User size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No workers found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkers.map((worker) => (
                <div key={worker.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={32} className="text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="text-yellow-400"></span>
                        <span className="ml-1">{worker.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={16} className="mr-2 text-gray-400" />
                      {worker.experience} experience
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign size={16} className="mr-2 text-gray-400" />
                      RWF {worker.hourlyRate.toLocaleString()}/hour
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {worker.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      worker.availability === 'Available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {worker.availability}
                    </span>
                  </div>

                  <button
                    onClick={() => bookWorker(worker.id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Bookings Tab */}
      {activeTab === 'my-bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No bookings yet</p>
              <button
                onClick={() => setActiveTab('book')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Book Your First Worker
              </button>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{booking.service}</h3>
                      <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{booking.worker}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">RWF {booking.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{booking.duration}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    {booking.date} at {booking.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={16} className="mr-2 text-gray-400" />
                    {booking.location}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium">
                    View Details
                  </button>
                  {booking.status === 'pending' && (
                    <>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                        Confirm
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium">
                        Cancel
                      </button>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm font-medium">
                      Rate Worker
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
