"use client";

import { useEffect, useState } from "react";
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
import { XCircle, Loader2, Clock, Video, Edit, User, Calendar, Link } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminMeetingsPage() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [updatedDate, setUpdatedDate] = useState<string>("");
  const [updatedTime, setUpdatedTime] = useState<string>("");
  const [updatedLink, setUpdatedLink] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const meetings = useQuery(api.mutations.meetings.getAllMeetings);
  console.log(meetings)
  const cancelMeeting = useMutation(api.mutations.meetings.cancelMeeting);
  const updateMeeting = useMutation(api.mutations.meetings.updateMeeting);
  const createNotification = useMutation(api.mutations.notifications.createNotification);

  const Me = useQuery(api.auth.getMe);
  const router = useRouter();

  useEffect(() => {
    if (Me && Me.department?.name !== "RH") {
      router.push("/access-denied");
    }
  }, [Me, router]);

  if (!meetings) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const events = meetings.map((meeting: any) => ({
    id: meeting._id,
    title: ` ${meeting.participantName}`,
    start: new Date(meeting.startTime),
    end: new Date(meeting.startTime + 3600000),
    status: meeting.status,
    type: meeting.type,
    organizerId: meeting.organizerId,
    participantId: meeting.participantId,
    organizerName: meeting.organizerName,
    participantName: meeting.participantName,
    participantmail: meeting.participantmail,
    meetingLink: meeting.meetingLink,
    backgroundColor: meeting.status === "canceled" ? "#FFEBEE" : meeting.status === "completed" ? "#E8F5E9" : "#E3F2FD",
  }));

  const handleCancelMeeting = async (userId: any,meetingId: Id<"meetings">) => {
    try {
      await cancelMeeting({ meetingId });
      const notificationTitle = "Meeting Canceled";
      const notificationMessage = `The meeting with "${selectedEvent.title}" has been Canceled.`;
      const notificationLink = `/MyMeetings`; // Lien vers la réunion
  
      await createNotification({
        userId: userId,
        title: notificationTitle,
        message: notificationMessage,
        link: notificationLink,
        type: "info",
      });
      toast.success("Meeting canceled successfully!");
      setSelectedEvent(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error canceling meeting:", error);
      toast.error("Failed to cancel meeting.");
    }
  };

  const handleUpdateMeeting = async (userId: any,user: any) => {
    if (!selectedEvent) return;
  console.log({userId,user})
    try {
      const newStartTime = new Date(`${updatedDate}T${updatedTime}`).getTime();
  
      if (isNaN(newStartTime)) {
        toast.error("Invalid date or time.");
        return;
      }
  
      // Mettre à jour la réunion
      await updateMeeting({
        meetingId: selectedEvent.id,
        startTime: newStartTime,
        meetingLink: updatedLink,
      });
  
      const formattedDate = new Date(newStartTime).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
  
      // Envoyer une notification à l'organisateur et au participant
      const notificationTitle = "Meeting Updated";
      const notificationMessage = `The meeting with "${selectedEvent.title}" has been updated. The new date and time is ${formattedDate}.`;
      const notificationLink = `/MyMeetings`; // Lien vers la réunion
  
      await createNotification({
        userId: userId,
        title: notificationTitle,
        message: notificationMessage,
        link: notificationLink,
        type: "info",
      });
  
      // Envoyer un e-mail avec le template moderne
      const emailTemplate = `
        <div style="
          font-family: Arial, sans-serif;
          color: #000;
          background-color: #ffffff;
          padding: 40px 20px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          margin: 0 auto;
        ">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="
              font-size: 28px;
              font-weight: bold;
              color: #111827;
              margin: 0;
            ">
              ℹ Meeting Updated!
            </h1>
            <p style="
              font-size: 16px;
              color: #6b7280;
              margin-top: 10px;
            ">
              The details of your meeting have been updated.
            </p>
          </div>
      
          <!-- Content -->
          <div style="
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          ">
            <p style="
              font-size: 16px;
              color: #374151;
              margin: 0;
            ">
              The meeting with <strong>${selectedEvent.title}</strong> has been updated. The new date and time is <strong>${formattedDate}</strong>.
            </p>
            <a href="${updatedLink}" style="
              display: inline-block;
              background-color: #3b82f6;
              color: #ffffff;
              font-size: 16px;
              font-weight: bold;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              margin-top: 20px;
            ">
              Join Meeting
            </a>
          </div>
      
          <!-- Footer -->
          <div style="
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #6b7280;
          ">
            <p style="margin: 0;">
              If you did not request this update, please contact support.
            </p>
            <p style="margin: 10px 0 0;">
              Need help? <a href="mailto:support@example.com" style="color: #3b82f6; text-decoration: none;">Contact support</a>.
            </p>
          </div>
        </div>
      `;
  
      // Envoyer l'e-mail
      const response = await fetch("/api/costummail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user,
          subject: "Meeting Updated",
          template: emailTemplate,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to send email");
      }
  
      toast.success("Meeting updated and email sent successfully!");
      setIsEditMode(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast.error("Failed to update meeting.");
    }
  };

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setIsDialogOpen(true);
    setIsEditMode(false);
    setUpdatedDate(formatDate(info.event.start, { year: "numeric", month: "2-digit", day: "2-digit" }));
    setUpdatedTime(formatDate(info.event.start, { hour: "2-digit", minute: "2-digit", hour12: false }));
    setUpdatedLink(info.event.extendedProps?.meetingLink || "");
  };

  const handleJoinMeeting = () => {
    const meetingUrl = selectedEvent?.extendedProps?.meetingLink || "https://example.com/meeting";
    window.open(meetingUrl, "_blank");
  };

  return (
    <AdminPanelLayout>
      <ContentLayout title="My Meetings">
        <div className="p-6 space-y-6 bg-background text-foreground">
          {/* Titre de la page */}
          <Card className="border-border bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">My Meetings</CardTitle>
              <CardDescription className="text-muted-foreground">
                View and manage all scheduled meetings.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Calendrier des réunions */}
          <Card className="border-border bg-card">
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
                height="auto"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                eventClassNames="dark:bg-opacity-20" 
                eventContent={(eventInfo) => (
                  <div className="flex flex-col items-start p-1">
                    <span className="font-semibold text-foreground">
                      {eventInfo.event.title}
                    </span>
                    <Badge
      className={`${
        eventInfo.event.extendedProps.status === "canceled"
          ? "bg-red-100 text-red-800"
          : eventInfo.event.extendedProps.status === "completed"
          ? "bg-green-100 text-green-800"
          : "bg-blue-100 text-blue-800"
      } text-xs mt-1`}
    >
      {eventInfo.event.extendedProps.status}
    </Badge>
                  </div>
                )}
              />
            </CardContent>
          </Card>

          {/* Dialog pour afficher les détails de la réunion */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[600px] bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {selectedEvent?.title}
                </DialogTitle>
                <DialogDescription>
                  <Badge className={`
                    ${selectedEvent?.extendedProps?.status === "canceled" 
                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" 
                        : selectedEvent?.extendedProps.status === "completed" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"}
                    flex items-center gap-1
                  `}>
                    {selectedEvent?.extendedProps?.status === "canceled" ? 
                      <XCircle size={16} /> : <Clock size={16} />}
                    {selectedEvent?.extendedProps?.status}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 p-4 text-foreground">
                {isEditMode ? (
                  <>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={updatedDate}
                        onChange={(e) => setUpdatedDate(e.target.value)}
                        className="border-border focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={updatedTime}
                        onChange={(e) => setUpdatedTime(e.target.value)}
                        className="border-border focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Meeting Link</Label>
                      <Input
                        type="url"
                        value={updatedLink}
                        onChange={(e) => setUpdatedLink(e.target.value)}
                        className="border-border focus:ring-primary"
                        placeholder="https://"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <User size={16} className="text-primary" />
                        <strong>Organizer:</strong> {selectedEvent?.extendedProps?.organizerName}
                      </p>
                      <p className="flex items-center gap-2">
                        <User size={16} className="text-primary" />
                        <strong>Participant:</strong> {selectedEvent?.extendedProps?.participantmail}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar size={16} className="text-primary" />
                        <strong>Start:</strong>{" "}
                        {new Date(selectedEvent?.start).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar size={16} className="text-primary" />
                        <strong>End:</strong>{" "}
                        {new Date(selectedEvent?.end).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="flex items-center gap-2">
                        <Link size={16} className="text-primary" />
                        <strong>Link:</strong> {selectedEvent?.extendedProps?.meetingLink || "N/A"}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter className="flex flex-col gap-4 p-4">
                {isEditMode ? (
                  <Button
                    variant="default"
                    onClick={async () => {
                      setIsUpdating(true);
                      try {
                        await handleUpdateMeeting(
                          selectedEvent?.extendedProps.participantId,
                          selectedEvent?.extendedProps.participantmail
                        );
                      } catch (error) {
                        console.error("Error updating meeting:", error);
                        toast.error("Failed to update meeting.");
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                ) : (
                  <>
                    {selectedEvent?.extendedProps?.status === "scheduled" && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        {selectedEvent?.extendedProps?.type === "online" && (
                          <Button
                            variant="secondary"
                            onClick={handleJoinMeeting}
                            className="w-full sm:w-auto"
                          >
                            <Video size={16} className="mr-2" />
                            Join Meeting
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => setIsEditMode(true)}
                          className="w-full sm:w-auto"
                        >
                          <Edit size={16} className="mr-2" />
                          Edit Meeting
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelMeeting(selectedEvent?.extendedProps.participantId, selectedEvent.id)}
                          className="w-full sm:w-auto"
                        >
                          <XCircle size={16} className="mr-2" />
                          Cancel Meeting
                        </Button>
                      </div>
                    )}
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