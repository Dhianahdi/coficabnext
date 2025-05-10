"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Clock, 
  Video, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Calendar,
  Filter,
  RefreshCw,
  Info,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MyMeetingsPage() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [meetingsPerPage, setMeetingsPerPage] = useState("5");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const Me = useQuery(api.auth.getMe);
  const userId = Me?._id as Id<"users">;
  const router = useRouter();

  const meetings = useQuery(api.mutations.meetings.getUserMeetings, { userId });

  // Filter meetings by date
  const filteredByDate = selectedDate
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

  // Filter by status
  const filteredByStatus = statusFilter
    ? filteredByDate?.filter(meeting => meeting.status === statusFilter)
    : filteredByDate;

  // Filter by type
  const filteredByType = typeFilter
    ? filteredByStatus?.filter(meeting => meeting.type === typeFilter)
    : filteredByStatus;

  const uniqueMeetings = Array.from(new Map(filteredByType?.map(m => [m._id, m])).values());

  // Get upcoming meetings (scheduled meetings sorted by date)
  const upcomingMeetings = uniqueMeetings
    ?.filter(meeting => meeting.status === "scheduled")
    .sort((a, b) => a.startTime - b.startTime);

  // Get past meetings (completed or canceled meetings)
  const pastMeetings = uniqueMeetings
    ?.filter(meeting => meeting.status === "completed" || meeting.status === "canceled")
    .sort((a, b) => b.startTime - a.startTime);

  // Pagination
  const indexOfLastMeeting = currentPage * parseInt(meetingsPerPage);
  const indexOfFirstMeeting = indexOfLastMeeting - parseInt(meetingsPerPage);
  const currentMeetings = uniqueMeetings?.slice(indexOfFirstMeeting, indexOfLastMeeting);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [selectedDate, statusFilter, typeFilter]);

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

  const formatRelativeDate = (timestamp: number) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return `Today at ${format(date, "HH:mm")}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, "HH:mm")}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, "HH:mm")}`;
    } else {
      return format(date, "dd MMM yyyy 'at' HH:mm");
    }
  };

  const resetFilters = () => {
    setSelectedDate(null);
    setStatusFilter(null);
    setTypeFilter(null);
    setCurrentPage(1);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/30 dark:text-green-500">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Completed
          </Badge>
        );
      case "canceled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800/30 dark:text-red-500">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Canceled
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-800/30 dark:text-yellow-500">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Scheduled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800/30 dark:text-gray-400">
            {status}
          </Badge>
        );
    }
  };

  const renderTypeBadge = (type: string) => {
    switch (type) {
      case "online":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800/30 dark:text-blue-500">
            <Video className="w-3.5 h-3.5 mr-1" />
            Online
          </Badge>
        );
      case "in-person":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-800/30 dark:text-purple-500">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            In-person
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800/30 dark:text-gray-400">
            {type}
          </Badge>
        );
    }
  };

  const getNextMeeting = () => {
    const now = Date.now();
    return meetings
      ?.filter(m => m.status === "scheduled" && m.startTime > now)
      .sort((a, b) => a.startTime - b.startTime)[0];
  };

  const nextMeeting = getNextMeeting();

  const openMeetingDetails = (meeting: any) => {
    setSelectedMeeting(meeting);
    setIsDetailsOpen(true);
  };

  return (
    <AdminPanelLayout>
      <ContentLayout title="My Meetings">
        <div className="p-6 space-y-6">
          {/* Header Card */}
          <Card className="border border-border shadow-lg bg-background">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">My Meetings</CardTitle>
              <CardDescription className="text-muted-foreground">
                View and manage your scheduled meetings.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Next Meeting Card */}
          {nextMeeting && (
            <Card className="border border-border shadow-lg bg-gradient-to-r from-primary/5 to-background">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-foreground flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Your Next Meeting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{nextMeeting.title}</h3>
                    <p className="text-muted-foreground mt-1">{formatRelativeDate(nextMeeting.startTime)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {renderTypeBadge(nextMeeting.type)}
                      {renderStatusBadge(nextMeeting.status)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMeetingDetails(nextMeeting)}
                      className="flex items-center gap-1"
                    >
                      <Info size={16} />
                      Details
                    </Button>
                    {nextMeeting.type === "online" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => window.open(nextMeeting.meetingLink, "_blank")}
                        className="flex items-center gap-1"
                      >
                        <Video size={16} />
                        Join Meeting
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filter Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Date</span>
                  <Input
                    type="date"
                    value={selectedDate ? format(new Date(selectedDate), "yyyy-MM-dd") : ""}
                    onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value).getTime() : null)}
                    className="w-[200px] bg-background text-foreground border-border"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
                    <SelectTrigger className="w-[150px] bg-background text-foreground border-border">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Type</span>
                  <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? null : value)}>
                    <SelectTrigger className="w-[150px] bg-background text-foreground border-border">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="in-person">In-person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Rows per page</span>
                  <Select value={meetingsPerPage} onValueChange={setMeetingsPerPage}>
                    <SelectTrigger className="w-[100px] bg-background text-foreground border-border">
                      <SelectValue placeholder="Rows" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={resetFilters} 
                  disabled={!selectedDate && !statusFilter && !typeFilter}
                  className="mt-auto"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for different views */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-3 h-auto">
              <TabsTrigger value="all" className="py-2">All Meetings</TabsTrigger>
              <TabsTrigger value="upcoming" className="py-2">Upcoming</TabsTrigger>
              <TabsTrigger value="past" className="py-2">Past</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <MeetingsTable 
                meetings={currentMeetings} 
                formatDate={formatDate} 
                renderStatusBadge={renderStatusBadge} 
                renderTypeBadge={renderTypeBadge}
                openMeetingDetails={openMeetingDetails}
              />
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-4">
              <MeetingsTable 
                meetings={upcomingMeetings?.slice(0, parseInt(meetingsPerPage))} 
                formatDate={formatDate} 
                renderStatusBadge={renderStatusBadge} 
                renderTypeBadge={renderTypeBadge}
                openMeetingDetails={openMeetingDetails}
              />
            </TabsContent>
            
            <TabsContent value="past" className="mt-4">
              <MeetingsTable 
                meetings={pastMeetings?.slice(0, parseInt(meetingsPerPage))} 
                formatDate={formatDate} 
                renderStatusBadge={renderStatusBadge} 
                renderTypeBadge={renderTypeBadge}
                openMeetingDetails={openMeetingDetails}
              />
            </TabsContent>
          </Tabs>
  
          {/* Pagination */}
          <div className="flex justify-between items-center pt-4">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Previous
            </Button>
            <span className="text-foreground">
              Page {currentPage} of {Math.ceil((uniqueMeetings?.length || 0) / parseInt(meetingsPerPage)) || 1}
            </span>
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLastMeeting >= (uniqueMeetings?.length || 0)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Meeting Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Meeting Details</DialogTitle>
              <DialogDescription>
                Complete information about this meeting
              </DialogDescription>
            </DialogHeader>
            
            {selectedMeeting && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{selectedMeeting.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {renderTypeBadge(selectedMeeting.type)}
                    {renderStatusBadge(selectedMeeting.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {formatRelativeDate(selectedMeeting.startTime)}
                      </p>
                    </div>
                  </div>
                  
                  {selectedMeeting.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{selectedMeeting.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedMeeting.description && (
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Description</p>
                        <p className="text-sm text-muted-foreground">{selectedMeeting.description}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedMeeting.type === "online" && selectedMeeting.meetingLink && (
                  <div className="pt-2">
                    <Button 
                      className="w-full" 
                      onClick={() => window.open(selectedMeeting.meetingLink, "_blank")}
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Join Meeting
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </ContentLayout>
    </AdminPanelLayout>
  );
}

// Extracted table component for reuse
function MeetingsTable({ 
  meetings, 
  formatDate, 
  renderStatusBadge, 
  renderTypeBadge,
  openMeetingDetails
}: { 
  meetings: any[] | undefined, 
  formatDate: (timestamp: number) => string,
  renderStatusBadge: (status: string) => JSX.Element,
  renderTypeBadge: (type: string) => JSX.Element,
  openMeetingDetails: (meeting: any) => void
}) {
  return (
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
            {meetings && meetings.length > 0 ? (
              meetings.map((meeting) => (
                <TableRow key={meeting._id} className="hover:bg-secondary/50 transition-colors">
                  <TableCell className="font-medium text-foreground">{meeting.title}</TableCell>
                  <TableCell>{renderTypeBadge(meeting.type)}</TableCell>
                  <TableCell>{formatDate(meeting.startTime)}</TableCell>
                  <TableCell>{renderStatusBadge(meeting.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openMeetingDetails(meeting)}
                              className="h-8 w-8"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {meeting.type === "online" && meeting.status === "scheduled" && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(meeting.meetingLink, "_blank")}
                                className="flex items-center gap-1 bg-background text-foreground border-border"
                              >
                                <Video size={16} />
                                Join
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Join online meeting</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p>No meetings found.</p>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or check back later.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}