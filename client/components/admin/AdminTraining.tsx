import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, BookOpen, Clock, CheckCircle } from "lucide-react";

interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: "active" | "draft" | "completed";
  enrolledWorkers: number;
  createdAt: string;
}

interface TrainingSession {
  id: string;
  programId: string;
  programTitle: string;
  date: string;
  time: string;
  instructor: string;
  status: "scheduled" | "in-progress" | "completed";
  attendees: number;
}

export default function AdminTraining() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [activeTab, setActiveTab] = useState<"programs" | "sessions">("programs");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const fetchTrainingData = async () => {
    try {
      // TODO: Replace with actual API calls
      setPrograms([
        {
          id: "1",
          title: "Household Cleaning Basics",
          description: "Learn fundamental cleaning techniques and safety protocols",
          duration: "2 weeks",
          status: "active",
          enrolledWorkers: 25,
          createdAt: "2024-01-01",
        },
        {
          id: "2",
          title: "Childcare Essentials",
          description: "Comprehensive training for childcare providers",
          duration: "4 weeks",
          status: "draft",
          enrolledWorkers: 0,
          createdAt: "2024-01-15",
        },
      ]);

      setSessions([
        {
          id: "1",
          programId: "1",
          programTitle: "Household Cleaning Basics",
          date: "2024-01-20",
          time: "09:00 AM",
          instructor: "Sarah Johnson",
          status: "scheduled",
          attendees: 15,
        },
        {
          id: "2",
          programId: "1",
          programTitle: "Household Cleaning Basics",
          date: "2024-01-22",
          time: "02:00 PM",
          instructor: "Mike Chen",
          status: "completed",
          attendees: 20,
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch training data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPrograms = programs.filter(program =>
    program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSessions = sessions.filter(session =>
    session.programTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Training Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Button
                variant={activeTab === "programs" ? "default" : "outline"}
                onClick={() => setActiveTab("programs")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Programs
              </Button>
              <Button
                variant={activeTab === "sessions" ? "default" : "outline"}
                onClick={() => setActiveTab("sessions")}
              >
                <Clock className="h-4 w-4 mr-2" />
                Sessions
              </Button>
            </div>
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center py-8">Loading training data...</p>
          ) : activeTab === "programs" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrograms.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">{program.title}</TableCell>
                    <TableCell>{program.description}</TableCell>
                    <TableCell>{program.duration}</TableCell>
                    <TableCell>{getStatusBadge(program.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{program.enrolledWorkers}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm">
                          <BookOpen className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.programTitle}</TableCell>
                    <TableCell>{session.date}</TableCell>
                    <TableCell>{session.time}</TableCell>
                    <TableCell>{session.instructor}</TableCell>
                    <TableCell>{getStatusBadge(session.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{session.attendees}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </div>
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