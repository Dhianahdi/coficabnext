"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Video, MapPin, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function MyMeetingsPage() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [meetingsPerPage, setMeetingsPerPage] = useState("5");

  const Me = useQuery(api.auth.getMe);
  const userId = Me?._id as Id<"users">;
  const router = useRouter();

  const meetings = useQuery(api.mutations.meetings.getUserMeetings, { userId });
  console.log("All Meetings:", meetings);

  const meetingsByDate = selectedDate
    ? meetings?.filter((meeting) => {
        const meetingDate = new Date(meeting.startTime);
        const selectedDateObj = new Date(selectedDate);
        const startOfDay = new Date(selectedDateObj);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDateObj);
        endOfDay.setHours(23, 59, 59, 999);

        return meetingDate >= startOfDay && meetingDate <= endOfDay;
      })
    : meetings;

  const uniqueMeetings = Array.from(new Map(meetingsByDate?.map(m => [m._id, m])).values());

  const indexOfLastMeeting = currentPage * parseInt(meetingsPerPage);
  const indexOfFirstMeeting = indexOfLastMeeting - parseInt(meetingsPerPage);
  const currentMeetings = uniqueMeetings?.slice(indexOfFirstMeeting, indexOfLastMeeting);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (!meetings) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "dd/MM/yyyy HH:mm");
  };

  const resetFilter = () => {
    setSelectedDate(null);
    setCurrentPage(1);
  };

  const renderStatusBadge = (status: string) => {
    const statusColors:any = {
      completed: "bg-green-200 text-green-800",
      canceled: "bg-red-200 text-red-800",
      scheduled: "bg-yellow-200 text-yellow-800",
    };

    return <Badge className={statusColors[status] || "bg-gray-200 text-gray-800"}>{status}</Badge>;
  };

  return (
    <AdminPanelLayout>
      <ContentLayout title="My Meetings">
        <div className="p-6 space-y-6">
          <Card className="border border-border shadow-lg bg-background">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">My Meetings</CardTitle>
              <CardDescription className="text-muted-foreground">
                View and manage your scheduled meetings.
              </CardDescription>
            </CardHeader>
          </Card>
  
          <div className="flex gap-4 items-center">
            <Input
              type="date"
              value={selectedDate ? format(new Date(selectedDate), "yyyy-MM-dd") : ""}
              onChange={(e) => setSelectedDate(new Date(e.target.value).getTime())}
              className="w-[200px] bg-background text-foreground border-border"
              placeholder="Select a date"
            />
            <Button variant="outline" onClick={resetFilter} disabled={!selectedDate}>
              Reset Filter
            </Button>
  
            <Select value={meetingsPerPage} onValueChange={setMeetingsPerPage}>
              <SelectTrigger className="w-[120px] bg-background text-foreground border-border">
                <SelectValue placeholder="Rows per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
  
          <Card className="border border-border shadow-lg">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold text-foreground">Title</TableHead>
                    <TableHead className="font-bold text-foreground">Type</TableHead>
                    <TableHead className="font-bold text-foreground">Date & Time</TableHead>
                    <TableHead className="font-bold text-foreground">Status</TableHead>
                    <TableHead className="font-bold text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMeetings && currentMeetings.length > 0 ? (
                    currentMeetings.map((meeting) => (
                      <TableRow key={meeting._id} className="hover:bg-secondary/50 transition-colors">
                        <TableCell className="font-medium text-foreground">{meeting.title}</TableCell>
                        <TableCell>{meeting.type}</TableCell>
                        <TableCell>{formatDate(meeting.startTime)}</TableCell>
                        <TableCell>{renderStatusBadge(meeting.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {/* Bouton "Join" pour les réunions en ligne */}
                            {meeting.type === "online" && meeting.status === "scheduled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(meeting.meetingLink, "_blank")}
                                className="flex items-center gap-1 bg-background text-foreground border-border"
                              >
                                <Video size={16} />
                                Join
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No meetings found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
  
          <div className="flex justify-between items-center pt-4">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Previous
            </Button>
            <span className="text-foreground">Page {currentPage}</span>
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLastMeeting >= uniqueMeetings.length}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Next
            </Button>
          </div>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}