"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Spinner } from "@/components/spinner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Clock, CheckCircle, XCircle, Loader2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PDFViewer } from "@/components/PDFViewer/PDFViewer";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/dist/client/link";
import Image from "next/image";

export default function JobOffersPage() {
  const params = useParams();
  const jobId = params.jobId as Id<"jobs">;
  const id = jobId;

  const job = useQuery(api.queries.jobs.getJobById, { id });
  const rawOffers = useQuery(api.queries.offres.getOffersByJobId, { jobId });
  const formIds = useQuery(api.mutations.form.getFormsByJobId, { jobId });
  const updateOfferStatus = useMutation(api.mutations.offers.updateOfferStatus);
  const scheduleMeeting = useMutation(api.mutations.meetings.scheduleMeeting);

  const assignFormsToUser = useMutation(api.mutations.form.assignFormsToUser);
  const updateRecruiterNotes = useMutation(api.mutations.offers.updateRecruiterNotes); // Ajout de la mutation
  const user = useQuery(api.auth.getMe);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [openPdfViewer, setOpenPdfViewer] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [openNotesDialog, setOpenNotesDialog] = useState(false); // État pour ouvrir le Dialog des notes
  const [currentNotes, setCurrentNotes] = useState(""); // État pour stocker les notes actuelles
  const [currentOfferId, setCurrentOfferId] = useState<Id<"offers"> | null>(null); // État pour stocker l'ID de l'offre actuelle
  const [openMeetingDialog, setOpenMeetingDialog] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [meetingType, setMeetingType] = useState<"online" | "in-person">("online");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingDate, setMeetingDate] = useState<number>(Date.now());
  const [meetingStartTime, setMeetingStartTime] = useState<number>(Date.now());
  const [currentCandidateId, setCurrentCandidateId] = useState<Id<"users"> | null>(null);
  const isLoading = !job || !rawOffers;

  const createNotification = useMutation(api.mutations.notifications.createNotification);


 const Me = useQuery(api.auth.getMe);
  const router = useRouter();

  useEffect(() => {
    if (Me && Me.department?.name !== "RH") {
      router.push("/access-denied");
    }
  }, [Me, router]);



  const getStatusBadge = (status: string) => {

    
    switch (status) {
      case "Pending":
        return {
          icon: <Clock size={16} className="text-yellow-500" />,
          color: "bg-yellow-100 text-yellow-800",
        };
      case "Interview":
        return {
          icon: <CheckCircle size={16} className="text-blue-500" />,
          color: "bg-blue-100 text-blue-800",
        };
      case "Accepted":
        return {
          icon: <CheckCircle size={16} className="text-green-500" />,
          color: "bg-green-100 text-green-800",
        };
      case "Rejected":
        return {
          icon: <XCircle size={16} className="text-red-500" />,
          color: "bg-red-100 text-red-800",
        };
      default:
        return {
          icon: null,
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  // Filtrer et trier les offres
  const offers = rawOffers
    ?.filter((offer) =>
      offer.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return (a.score || 0) - (b.score || 0);
      } else {
        return (b.score || 0) - (a.score || 0);
      }
    });

  // Ouvrir le visualiseur PDF
  const handleOpenPdf = (pdfUrl: string) => {
    setCurrentPdfUrl(pdfUrl);
    setOpenPdfViewer(true);
  };

  // Ouvrir le Dialog des notes
  const handleOpenNotesDialog = (offerId: Id<"offers">, notes: string) => {
    setCurrentOfferId(offerId);
    setCurrentNotes(notes);
    setOpenNotesDialog(true);
  };

  // Mettre à jour les notes
  const handleUpdateNotes = async () => {
    if (!currentOfferId) return;

    try {
      await updateRecruiterNotes({
        offerId: currentOfferId,
        notes: currentNotes,
      });
      toast.success("Notes updated successfully!");
      setOpenNotesDialog(false);
    } catch (error) {
      console.error("Error updating notes:", error);
      toast.error("An error occurred while updating the notes.");
    }
  };

  
  const handleUpdateStatus = async (userId: Id<"users">,offerId: Id<"offers">, status:"Pending" | "Interview" | "Accepted" | "Rejected") => {
    try {
      await updateOfferStatus({ offerId, status });
      const notificationTitle = ` Your offer status updated to ${status}`;
      const notificationMessage = ` Your offer status updated to ${status}`;
      const notificationLink = ``; // Lien vers la réunion
  
      await createNotification({
        userId: userId,
        title: notificationTitle,
        message: notificationMessage,
        link: notificationLink,
        type: "info",
      });
      toast.success(`Offer status updated to ${status}`);
    } catch (error) {
      console.error("Error updating offer status:", error);
      toast.error("An error occurred while updating the offer status.");
    }
  };
  const handleOpenMeetingDialog = (offerId: Id<"offers">,candidateId: Id<"users">) => {
    setCurrentOfferId(offerId);

    setCurrentCandidateId(candidateId);
    setOpenMeetingDialog(true);
  };

  const handleScheduleMeeting = async (offerId: Id<"offers">) => {
    if (!currentCandidateId || !user) return;

    try {
      const formattedDate = new Date(meetingStartTime).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
  
      await scheduleMeeting({
        title: meetingTitle,
        description: meetingDescription,
        type: meetingType,
        meetingLink: meetingType === "online" ? meetingLink : undefined,
        date: meetingDate,
        startTime: meetingStartTime,
        organizerId: user._id as Id<"users">, // ID de l'organisateur (recruteur)
        participantId: currentCandidateId,
      });
      const notificationTitle = "Meeting Updated";
      const notificationMessage = `You have new meeting at ${formattedDate}.`;
      const notificationLink = `/MyMeetings`; // Lien vers la réunion
  
      await createNotification({
        userId: currentCandidateId,
        title: notificationTitle,
        message: notificationMessage,
        link: notificationLink,
        type: "info",
      });
      const status="Interview"
      await updateOfferStatus({ offerId, status});

      toast.success("Meeting scheduled successfully!");
      setOpenMeetingDialog(false);
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast.error("An error occurred while scheduling the meeting.");
    }
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner variant="ring" size={40} className="text-primary" />
      </div>
    );
  }
  const emailTemplate = (assignedCount: number, jobTitle: string, formLinks: string[]) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f4f8; border-radius: 8px; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #003366; color: #fff; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Forms Assigned to You</h1>
    </div>
    <div style="padding: 20px;">
      <p style="font-size: 16px; color: #333;">Hello,</p>
      <p style="font-size: 16px; color: #333;">
        You have been assigned <strong>${assignedCount} forms</strong> for the job: <strong>${jobTitle}</strong>.
      </p>
      <p style="font-size: 16px; color: #333;">
        Please complete the forms at your earliest convenience by clicking the buttons below:
      </p>
      <div style="margin-top: 20px;">
        ${formLinks
          .map(
            (link, index) => `
          <a href="${link}" style="display: inline-block; margin: 5px; padding: 10px 20px; background-color: #003366; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Form ${index + 1}
          </a>
        `
          )
          .join("")}
      </div>
      <p style="font-size: 16px; color: #333; margin-top: 20px;">
        Thank you for your cooperation!
      </p>
    </div>
    <div style="background-color: #003366; color: #fff; padding: 20px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
      <p style="margin: 0; font-size: 14px;">Best regards,<br />The Recruitment Team</p>
    </div>
  </div>
`;


const generateFormLinks = (formIds: Id<"forms">[]) => {
  return formIds.map((formId) => `http://localhost:3000/test/${formId}`);
};  
  const sendEmail = async (email: string, subject: string, template: string) => {
    try {
      const response = await fetch("/api/costummail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          subject,
          template,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to send email");
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  };


  const handleAssignForms = async (offerId: Id<"offers">,userId: Id<"users">, candidateEmail: string) => {
    if (!formIds || formIds.length === 0) {
      toast.error("No form is associated with this job.");
      return;
    }
  
    setIsAssigning(true); // Activer le loader
  
    try {
      const assignedCount = await assignFormsToUser({ userId, formIds,jobId });
  
      if (assignedCount === 0) {
        toast.info("You have already assigned these forms.");
      } else {
        toast.success(`${assignedCount} forms have been successfully assigned!`);
  
        // Générer les liens des formulaires
        const formLinks = generateFormLinks(formIds);
  
        // Envoyer un e-mail au candidat
        const emailSubject = "Forms Assigned to You";
        const emailTemplateHtml = emailTemplate(assignedCount, job?.title || "Job", formLinks);
  
        await sendEmail(candidateEmail, emailSubject, emailTemplateHtml);
        const notificationTitle = "New forms Assigned";
        const notificationMessage = `Forms Assigned to You`;
        const notificationLink = `/Mytests`; // Lien vers la réunion
    
        await createNotification({
          userId: userId,
          title: notificationTitle,
          message: notificationMessage,
          link: notificationLink,
          type: "info",
        });
        const status="Under test"
        await updateOfferStatus({ offerId, status});
        toast.success("Forms Assigned successfully!");
      }
    } catch (error) {
      console.error("Error assigning forms:", error);
      toast.error("An error occurred while assigning the forms.");
    } finally {
      setIsAssigning(false); // Désactiver le loader
    }
  };
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score > 50) return "text-yellow-600";
    return "text-red-600";
  };

  if (rawOffers.length === 0) {
    // No open jobs found
    return (
      <AdminPanelLayout>
        <ContentLayout title="Recent Jobs">
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <Image
    src="/img/NoResultFound.png" // Chemin relatif depuis le dossier public
    alt="No offers available"
              width={700} // Desired width of the image
              height={700} // Desired height of the image
              className="object-cover" // Ensures the image scales properly
            />
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  No offers available at the moment
                </h3>
                <p className="text-gray-600">
                  Check back later to discover new opportunities.
                </p>
              </div>
            </div>
        </ContentLayout>
      </AdminPanelLayout>
    );
  }
  return (
    <AdminPanelLayout>
      <ContentLayout title="Dashboard">
        <div className="p-6 space-y-6">
          {/* En-tête de la page */}
          <Card className="border border-border bg-background text-foreground shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-200 to-blue-500 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                    <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">{job?.title}</CardTitle>
                  <CardDescription className="text-lg text-muted-foreground">{job?.departmentName}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Created At: {new Date(job?._creationTime).toLocaleDateString()}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/filled-forms/${jobId}`} passHref>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  View Filled Forms
                </Button>
              </Link>
            </CardFooter>
          </Card>
  
          {/* Barre de recherche et filtre de tri */}
          <div className="flex gap-4 bg-background p-4 rounded-lg shadow-sm border border-border">
            <Input
              placeholder="Rechercher un candidat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-border bg-background text-foreground"
            />
            <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
              <SelectTrigger className="w-[180px] border-border bg-background text-foreground">
                <SelectValue placeholder="Trier par score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Highest score first</SelectItem>
                <SelectItem value="asc">Lowest score first</SelectItem>
              </SelectContent>
            </Select>
          </div>
  
          {/* Liste des offres sous forme de cartes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers?.map((offer) => {
              const statusBadge = getStatusBadge(offer.status);
  
              return (
                <Card
                  key={offer._id}
                  className="hover:shadow-lg transition-shadow duration-300 relative overflow-hidden bg-background text-foreground"
                >
                  {/* Image de profil */}
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-200 to-blue-500" />
                  <div className="relative p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center border-4 border-background shadow-lg">
                        <span className="text-2xl font-bold text-primary">
                          {offer.candidateName[0]}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-foreground">
                          {offer.candidateName}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {offer.candidateEmail}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
  
                  {/* Informations du candidat */}
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Applied At:</span>
                      <span className="text-sm font-medium text-foreground">
                        {new Date(offer.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Score:</span>
                      <span className={`text-sm font-medium ${getScoreColor(offer.score || 0)}`}>
                        {offer.score || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Status:</span>
                      <div className="flex items-center gap-2 mt-2">
                        <Select
                          value={offer.status}
                          onValueChange={(value: "Pending" | "Interview" | "Accepted" | "Rejected") =>
                            handleUpdateStatus(offer.candidateId, offer._id, value)
                          }
                        >
                          <SelectTrigger className="w-[120px] border-border bg-background text-foreground">
                            <SelectValue placeholder="Change Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Interview">Interview</SelectItem>
                            <SelectItem value="Accepted">Accepted</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">CV:</span>
                      {offer.resume ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPdf(`/uploads/${offer.resume}`)}
                          className="border-border bg-background text-foreground"
                        >
                          <Download size={16} className="mr-2" />
                          View CV
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">No CV available</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Report:</span>
                      {offer.reportPdf ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPdf(`/uploads/rapports/${offer.reportPdf}`)}
                          className="border-border bg-background text-foreground"
                        >
                          <Download size={16} className="mr-2" />
                          View Report
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">No report available</span>
                      )}
                    </div>
                  </CardContent>
  
                  {/* Section des actions */}
                  <CardFooter className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignForms(offer._id, offer.candidateId, offer.candidateEmail)}
                        disabled={isAssigning}
                        className="border-border bg-background text-foreground"
                      >
                        {isAssigning ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Assign Forms"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenNotesDialog(offer._id, offer.recruiterNotes || "")}
                        className="border-border bg-background text-foreground"
                      >
                        <Edit size={16} className="mr-2" />
                        Notes
                      </Button>
                    </div>
  
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenMeetingDialog(offer._id, offer.candidateId)}
                      className="border-border bg-background text-foreground"
                    >
                      Schedule Meeting
                    </Button>
                  </CardFooter>
  
                  {/* Badge de statut */}
                  <div className="absolute top-4 right-4">
                    <Badge className={`${statusBadge.color} flex items-center gap-1`}>
                      {statusBadge.icon}
                      {offer.status}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
  
          {/* Modal pour afficher les PDF */}
          <Dialog open={openPdfViewer} onOpenChange={setOpenPdfViewer}>
            <DialogContent className="max-w-4xl bg-background text-foreground">
              <DialogHeader>
                <DialogTitle>PDF Viewer</DialogTitle>
              </DialogHeader>
              {currentPdfUrl && <PDFViewer fileUrl={currentPdfUrl} />}
            </DialogContent>
          </Dialog>
  
          {/* Modal pour afficher et modifier les notes */}
          <Dialog open={openNotesDialog} onOpenChange={setOpenNotesDialog}>
            <DialogContent className="bg-background text-foreground">
              <DialogHeader>
                <DialogTitle>Recruiter Notes</DialogTitle>
                <DialogDescription>Edit the notes for this candidate.</DialogDescription>
              </DialogHeader>
              <Textarea
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                placeholder="Enter your notes here..."
                className="mt-4 bg-background text-foreground border-border"
              />
              <DialogFooter>
                <Button onClick={handleUpdateNotes} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  
          {/* Modal pour planifier une réunion */}
          <Dialog open={openMeetingDialog} onOpenChange={setOpenMeetingDialog}>
            <DialogContent className="bg-background text-foreground">
              <DialogHeader>
                <DialogTitle>Schedule a Meeting</DialogTitle>
                <DialogDescription>
                  Plan a meeting with the candidate.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Meeting Title"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="bg-background text-foreground border-border"
                />
                <Textarea
                  placeholder="Meeting Description"
                  value={meetingDescription}
                  onChange={(e) => setMeetingDescription(e.target.value)}
                  className="bg-background text-foreground border-border"
                />
                <Select
                  value={meetingType}
                  onValueChange={(value: "online" | "in-person") => setMeetingType(value)}
                >
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Select meeting type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
                {meetingType === "online" && (
                  <Input
                    placeholder="Meeting Link (e.g., Google Meet)"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="bg-background text-foreground border-border"
                  />
                )}
                <Input
                  type="date"
                  value={new Date(meetingDate).toISOString().split("T")[0]}
                  onChange={(e) => setMeetingDate(new Date(e.target.value).getTime())}
                  className="bg-background text-foreground border-border"
                />
                <Input
                  type="time"
                  value={new Date(meetingStartTime).toLocaleTimeString("en-US", {
                    hour12: false,
                  })}
                  onChange={(e) => {
                    const time = e.target.value.split(":");
                    const date = new Date(meetingDate);
                    date.setHours(parseInt(time[0], 10));
                    date.setMinutes(parseInt(time[1], 10));
                    setMeetingStartTime(date.getTime());
                  }}
                  className="bg-background text-foreground border-border"
                />
              </div>
              <DialogFooter>
                <Button onClick={() => handleScheduleMeeting(currentOfferId as Id<"offers">)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}