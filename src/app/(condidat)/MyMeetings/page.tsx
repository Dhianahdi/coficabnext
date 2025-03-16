"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Video, MapPin, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useRouter } from "next/navigation";

export default function MyMeetingsPage() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null); // Null signifie pas de filtre
  const Me = useQuery(api.auth.getMe);
  const userId = Me?._id as Id<"users">;
  const router = useRouter();

  // Récupérer les réunions de l'utilisateur
  const meetings = useQuery(api.mutations.meetings.getUserMeetings, { userId });
  console.log("All Meetings:", meetings);

  // Filtrer les réunions par date (si une date est sélectionnée)
  const meetingsByDate = selectedDate
    ? meetings?.filter((meeting) => {
        const meetingDate = new Date(meeting.date);
        const selectedDateObj = new Date(selectedDate);

        // Début de la journée sélectionnée
        const startOfDay = new Date(selectedDateObj);
        startOfDay.setHours(0, 0, 0, 0);

        // Fin de la journée sélectionnée
        const endOfDay = new Date(selectedDateObj);
        endOfDay.setHours(23, 59, 59, 999);

        return meetingDate >= startOfDay && meetingDate <= endOfDay;
      })
    : meetings; // Afficher toutes les réunions si aucun filtre n'est appliqué

  console.log("Filtered Meetings:", meetingsByDate);

  // Afficher un loader pendant le chargement
  if (!meetings) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Formater la date pour l'affichage
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "dd/MM/yyyy HH:mm");
  };

  // Gérer l'indisponibilité du candidat
  const handleNotAvailable = async (meetingId: Id<"meetings">) => {
    try {
      // Ajoutez ici la logique pour indiquer que le candidat n'est pas disponible
      toast.success("Your unavailability has been noted.");
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability.");
    }
  };

  // Réinitialiser le filtre
  const resetFilter = () => {
    setSelectedDate(null);
  };

  return (
    <AdminPanelLayout>
      <ContentLayout title="My Meetings">
        <div className="p-6 space-y-6">
          {/* Titre de la page */}
          <Card className="border border-gray-200 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">My Meetings</CardTitle>
              <CardDescription className="text-gray-600">
                View and manage your scheduled meetings.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Filtre par date */}
          <div className="flex gap-4 items-center">
            <Input
              type="date"
              value={selectedDate ? format(new Date(selectedDate), "yyyy-MM-dd") : ""}
              onChange={(e) => setSelectedDate(new Date(e.target.value).getTime())}
              className="w-[200px]"
              placeholder="Select a date"
            />
            <Button variant="outline" onClick={resetFilter} disabled={!selectedDate}>
              Reset Filter
            </Button>
          </div>

          {/* Tableau des réunions */}
          <Card className="border border-gray-200 shadow-lg">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold text-gray-900">Title</TableHead>
                    <TableHead className="font-bold text-gray-900">Type</TableHead>
                    <TableHead className="font-bold text-gray-900">Date & Time</TableHead>
                    <TableHead className="font-bold text-gray-900">Status</TableHead>
                    <TableHead className="font-bold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetingsByDate && meetingsByDate.length > 0 ? (
                    meetingsByDate.map((meeting) => {
                      const statusBadge = {
                        scheduled: { color: "bg-blue-100 text-blue-800", icon: <Clock size={16} /> },
                        completed: { color: "bg-green-100 text-green-800", icon: <CheckCircle size={16} /> },
                        canceled: { color: "bg-red-100 text-red-800", icon: <XCircle size={16} /> },
                      }[meeting.status];

                      return (
                        <TableRow key={meeting._id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900">{meeting.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {meeting.type === "online" ? <Video size={16} /> : <MapPin size={16} />}
                              {meeting.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(meeting.startTime)}</TableCell>
                          <TableCell>
                            <Badge className={`${statusBadge.color} flex items-center gap-1`}>
                              {statusBadge.icon}
                              {meeting.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {/* Bouton "Join" pour les réunions en ligne */}
                              {meeting.type === "online" && meeting.status === "scheduled" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(meeting.meetingLink, "_blank")}
                                  className="flex items-center gap-1"
                                >
                                  <Video size={16} />
                                  Join
                                </Button>
                              )}
                              {/* Bouton "Not Available" */}
                              {meeting.status === "scheduled" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleNotAvailable(meeting._id)}
                                  className="flex items-center gap-1"
                                >
                                  <XCircle size={16} />
                                  Not Available
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-600">
                        No meetings found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}