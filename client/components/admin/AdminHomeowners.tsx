import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

interface Homeowner {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: "active" | "inactive";
  createdAt: string;
  bookingsCount: number;
}

export default function AdminHomeowners() {
  const [homeowners, setHomeowners] = useState<Homeowner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeowners();
  }, []);

  const fetchHomeowners = async () => {
    try {
      // TODO: Replace with actual API call
      setHomeowners([
        {
          id: "1",
          fullName: "Alice Johnson",
          email: "alice@example.com",
          phoneNumber: "+250123456789",
          address: "Kigali, Rwanda",
          status: "active",
          createdAt: "2024-01-10",
          bookingsCount: 5,
        },
        {
          id: "2",
          fullName: "Bob Williams",
          email: "bob@example.com",
          phoneNumber: "+250987654321",
          address: "Kigali, Rwanda",
          status: "active",
          createdAt: "2024-01-15",
          bookingsCount: 3,
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch homeowners:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHomeowners = homeowners.filter(homeowner =>
    homeowner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    homeowner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    homeowner.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Homeowner Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search homeowners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center py-8">Loading homeowners...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHomeowners.map((homeowner) => (
                  <TableRow key={homeowner.id}>
                    <TableCell className="font-medium">{homeowner.fullName}</TableCell>
                    <TableCell>{homeowner.email}</TableCell>
                    <TableCell>{homeowner.phoneNumber}</TableCell>
                    <TableCell>{homeowner.address}</TableCell>
                    <TableCell>{getStatusBadge(homeowner.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{homeowner.bookingsCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}