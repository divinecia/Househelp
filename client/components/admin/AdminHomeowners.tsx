import { useState } from "react";
import { Eye } from "lucide-react";

interface Homeowner {
  id: string;
  fullName: string;
  email: string;
  homeAddress: string;
  status: "active" | "inactive";
  joinsDate: string;
  totalBookings: number;
}

export default function AdminHomeowners() {
  const [homeowners] = useState<Homeowner[]>([
    {
      id: "1",
      fullName: "Alice Johnson",
      email: "alice@example.com",
      homeAddress: "KG 123 St, Kigali",
      status: "active",
      joinsDate: "2024-01-10",
      totalBookings: 5,
    },
    {
      id: "2",
      fullName: "Bob Wilson",
      email: "bob@example.com",
      homeAddress: "KN 456 Ave, Kigali",
      status: "active",
      joinsDate: "2024-01-25",
      totalBookings: 3,
    },
  ]);

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
