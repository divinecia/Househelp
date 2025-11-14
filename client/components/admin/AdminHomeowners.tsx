import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { getHomeowners, getBookings } from "@/lib/api-client";
import { toast } from "sonner";

interface Homeowner {
  id: string;
  full_name: string;
  email: string;
  home_address: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  totalBookings: number;
}

export default function AdminHomeowners() {
  const [homeowners, setHomeowners] = useState<Homeowner[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchHomeowners();
  }, []);

  const fetchHomeowners = async () => {
    setIsLoading(true);
    try {
      // Fetch homeowners
      const homeownerRes = await getHomeowners();
      if (homeownerRes.success && homeownerRes.data) {
        // Fetch bookings to count per homeowner
        const bookingsRes = await getBookings();
        const allBookings = bookingsRes.data || [];

        // Enrich homeowner data with booking count
        const enrichedHomeowners = homeownerRes.data.map((homeowner: any) => {
          const bookingCount = allBookings.filter(
            (booking: any) => booking.homeowner_id === homeowner.id
          ).length;
          return {
            ...homeowner,
            totalBookings: bookingCount,
          };
        });

        setHomeowners(enrichedHomeowners);
      } else {
        toast.error("Failed to fetch homeowners");
      }
    } catch (error) {
      toast.error("Error fetching homeowners");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Address</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Bookings</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {homeowners.map((homeowner) => (
                <tr key={homeowner.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{homeowner.fullName}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{homeowner.email}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{homeowner.homeAddress}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {homeowner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{homeowner.totalBookings}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{homeowner.joinsDate}</td>
                  <td className="px-6 py-4 text-sm">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                      <Eye size={16} />
                    </button>
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
