"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { XCircle, Loader2, Clock, Video } from "lucide-react"; // Ajout de l'icône Video pour "Join"
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@fullcalendar/core";

export default function AdminMeetingsPage() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const meetings = useQuery(api.mutations.meetings.getAllMeetings);
  const cancelMeeting = useMutation(api.mutations.meetings.cancelMeeting);
  const Me = useQuery(api.auth.getMe);

  if (!meetings) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const events = meetings.map((meeting: any) => ({
    id: meeting._id,
    title: `${meeting.title} - ${meeting.status}`, // Ajouter le statut au titre
    start: new Date(meeting.startTime),
    end: new Date(meeting.startTime + 3600000),
    status: meeting.status,
    type: meeting.type,
    organizerId: meeting.organizerId,
    participantId: meeting.participantId,
    backgroundColor: meeting.status === "canceled" ? "#FFEBEE" : meeting.status === "completed" ? "#E8F5E9" : "#E3F2FD",
  }));

  const handleCancelMeeting = async (meetingId: Id<"meetings">) => {
    try {
      await cancelMeeting({ meetingId });
      toast.success("Meeting canceled successfully!");
      setSelectedEvent(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error canceling meeting:", error);
      toast.error("Failed to cancel meeting.");
    }
  };

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleJoinMeeting = () => {
    // Rediriger vers l'URL de la réunion en ligne
    const meetingUrl = "https://example.com/meeting"; // Remplacez par l'URL réelle
    window.open(meetingUrl, "_blank");
  };

  return (
    <AdminPanelLayout>
      <ContentLayout title="Admin Meetings">
        <div className="p-6 space-y-6">
          {/* Titre de la page */}
          <Card className="border border-gray-200 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">My Meetings</CardTitle>
              <CardDescription className="text-gray-600">
                View and manage all scheduled meetings.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Calendrier des réunions */}
          <Card className="border border-gray-200 shadow-sm rounded-lg">
            <CardContent className="p-4">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                eventClick={handleEventClick}
                height="auto" // Ajustez la hauteur du calendrier
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                eventContent={(eventInfo) => (
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{eventInfo.event.title}</span>
                    <Badge className={`${eventInfo.event.extendedProps.status === "canceled" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"} text-xs mt-1`}>
                      {eventInfo.event.extendedProps.status}
                    </Badge>
                  </div>
                )}
              />
            </CardContent>
          </Card>

          {/* Dialog pour afficher les détails de la réunion */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px] rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedEvent?.title}</DialogTitle>
                <DialogDescription>
                  <Badge className={`${selectedEvent?.extendedProps?.status === "canceled" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"} flex items-center gap-1 rounded-full`}>
                    {selectedEvent?.extendedProps?.status === "canceled" ? <XCircle size={16} /> : <Clock size={16} />}
                    {selectedEvent?.extendedProps?.status}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p>
                  <strong>Type:</strong> {selectedEvent?.extendedProps?.type}
                </p>
                <p>
                  <strong>Start:</strong> {formatDate(selectedEvent?.start, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p>
                  <strong>End:</strong> {formatDate(selectedEvent?.end, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog} className="rounded-lg">
                  Close
                </Button>
                {selectedEvent?.extendedProps?.status === "scheduled" && (
                  <>
                    {selectedEvent?.extendedProps?.type === "online" && (
                      <Button
                        variant="default"
                        onClick={handleJoinMeeting}
                        className="rounded-lg bg-green-500 hover:bg-green-600"
                      >
                        <Video size={16} className="mr-2" />
                        Join Meeting
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelMeeting(selectedEvent.id)}
                      className="rounded-lg"
                    >
                      <XCircle size={16} className="mr-2" />
                      Cancel Meeting
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}