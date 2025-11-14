import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getWorkers, createBooking, getServiceTypes } from "@/lib/api-client";
import { decodeJWT, getAccessToken } from "@/lib/jwt-auth";
import { toast } from "sonner";
import { Search, MapPin, Star, Calendar, Clock } from "lucide-react";

interface Worker {
  id: string;
  fullName: string;
  typeOfWork: string;
  expectedWages: string;
  rating?: number;
  totalBookings?: number;
  languageProficiency?: string;
}

interface BookingFormData {
  workerId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  serviceType: string;
  description: string;
}

export default function HomeownerBooking() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    workerId: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    serviceType: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchWorkers();
    loadServiceTypes();
  }, []);

  const loadServiceTypes = async () => {
    setIsLoadingServices(true);
    try {
      const result = await getServiceTypes();
      if (result.success && result.data) {
        setServiceTypes(result.data);
      }
    } catch (error) {
      console.error("Failed to load service types:", error);
    } finally {
      setIsLoadingServices(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredWorkers(workers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = workers.filter(
        (worker) =>
          worker.fullName.toLowerCase().includes(query) ||
          worker.typeOfWork?.toLowerCase().includes(query),
      );
      setFilteredWorkers(filtered);
    }
  }, [searchQuery, workers]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await getWorkers({ status: "active" });
      if (response.success && response.data) {
        setWorkers(response.data);
        setFilteredWorkers(response.data);
      } else {
        toast.error("Failed to load workers");
      }
    } catch (error) {
      toast.error("Error loading workers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const validateBooking = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!bookingData.workerId) newErrors.workerId = "Please select a worker";
    if (!bookingData.bookingDate)
      newErrors.bookingDate = "Booking date is required";
    if (!bookingData.startTime) newErrors.startTime = "Start time is required";
    if (!bookingData.endTime) newErrors.endTime = "End time is required";
    if (!bookingData.serviceType)
      newErrors.serviceType = "Service type is required";
    if (!bookingData.description)
      newErrors.description = "Description is required";

    // Validate end time is after start time
    if (bookingData.startTime && bookingData.endTime) {
      if (bookingData.startTime >= bookingData.endTime) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    // Validate booking date is not in the past
    const selectedDate = new Date(bookingData.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.bookingDate = "Booking date cannot be in the past";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookingChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateBooking()) {
      toast.error("Please fix the errors below");
      return;
    }

    try {
      setLoading(true);

      // Get homeowner ID from JWT token
      const token = getAccessToken();
      const payload = token ? decodeJWT(token) : null;
      const homeownerId = payload?.id;

      if (!homeownerId) {
        toast.error("Unable to determine your user ID. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await createBooking({
        workerId: bookingData.workerId,
        homeownerId: homeownerId,
        bookingDate: bookingData.bookingDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        serviceType: bookingData.serviceType,
        description: bookingData.description,
        status: "pending",
      });

      if (!response.success) {
        toast.error(response.error || "Failed to create booking");
        return;
      }

      toast.success("Booking request sent successfully!");
      setSelectedWorker(null);
      setBookingData({
        workerId: "",
        bookingDate: "",
        startTime: "",
        endTime: "",
        serviceType: "",
        description: "",
      });

      // Navigate to bookings history
      setTimeout(() => {
        navigate("/homeowner/bookings");
      }, 1500);
    } catch (error) {
      toast.error("Error creating booking");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12 bg-gradient-to-b from-white via-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Book a Worker
            </h1>
            <p className="text-muted-foreground">
              Find and book professional household workers for your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Workers List */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Available Workers
                </h2>

                {/* Search */}
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Workers List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading workers...
                    </div>
                  ) : filteredWorkers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No workers found
                    </div>
                  ) : (
                    filteredWorkers.map((worker) => (
                      <div
                        key={worker.id}
                        onClick={() => {
                          setSelectedWorker(worker);
                          setBookingData((prev) => ({
                            ...prev,
                            workerId: worker.id,
                          }));
                        }}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedWorker?.id === worker.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary/50"
                        }`}
                      >
                        <div className="font-semibold text-foreground text-sm">
                          {worker.fullName}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {worker.typeOfWork}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          {worker.rating && (
                            <>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{worker.rating}</span>
                            </>
                          )}
                          {worker.totalBookings && (
                            <span className="text-muted-foreground">
                              {worker.totalBookings} bookings
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
                {selectedWorker ? (
                  <>
                    <h2 className="text-2xl font-bold text-foreground mb-6">
                      Book {selectedWorker.fullName}
                    </h2>

                    <form onSubmit={handleSubmitBooking} className="space-y-6">
                      {/* Worker Details */}
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Service Type
                            </label>
                            <p className="text-foreground font-semibold">
                              {selectedWorker.typeOfWork}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Expected Cost
                            </label>
                            <p className="text-foreground font-semibold">
                              {selectedWorker.expectedWages}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="bookingDate"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Booking Date *
                          </label>
                          <input
                            type="date"
                            id="bookingDate"
                            name="bookingDate"
                            value={bookingData.bookingDate}
                            onChange={handleBookingChange}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          {errors.bookingDate && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.bookingDate}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="serviceType"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Service Type *
                          </label>
                          <select
                            id="serviceType"
                            name="serviceType"
                            value={bookingData.serviceType}
                            onChange={handleBookingChange}
                            disabled={isLoadingServices}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                          >
                            <option value="">
                              {isLoadingServices
                                ? "Loading..."
                                : "Select service type"}
                            </option>
                            {serviceTypes.length > 0 ? (
                              serviceTypes.map((service) => (
                                <option
                                  key={service.id}
                                  value={service.name.toLowerCase()}
                                >
                                  {service.name}
                                </option>
                              ))
                            ) : (
                              <>
                                <option value="cleaning">Cleaning</option>
                                <option value="cooking">Cooking</option>
                                <option value="laundry">Laundry</option>
                                <option value="gardening">Gardening</option>
                                <option value="childcare">Childcare</option>
                                <option value="eldercare">Elder Care</option>
                                <option value="other">Other</option>
                              </>
                            )}
                          </select>
                          {errors.serviceType && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.serviceType}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Time Selection */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="startTime"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Start Time *
                          </label>
                          <input
                            type="time"
                            id="startTime"
                            name="startTime"
                            value={bookingData.startTime}
                            onChange={handleBookingChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          {errors.startTime && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.startTime}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="endTime"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            End Time *
                          </label>
                          <input
                            type="time"
                            id="endTime"
                            name="endTime"
                            value={bookingData.endTime}
                            onChange={handleBookingChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          {errors.endTime && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.endTime}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Description / Special Requests *
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={bookingData.description}
                          onChange={handleBookingChange}
                          rows={4}
                          placeholder="Provide details about what you need..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        {errors.description && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.description}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                          {loading ? "Processing..." : "Confirm Booking"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedWorker(null)}
                          className="flex-1 px-6 py-3 border border-gray-300 text-foreground font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a worker from the list to proceed with booking
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
