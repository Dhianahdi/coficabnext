"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Spinner } from "@/components/spinner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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

export default function JobOffersPage() {
  const params = useParams();
  const jobId = params.jobId as Id<"jobs">;
  const id = jobId;

  const job = useQuery(api.queries.jobs.getJobById, { id });
  const rawOffers = useQuery(api.queries.offres.getOffersByJobId, { jobId });
  const formIds = useQuery(api.mutations.form.getFormsByJobId, { jobId });

  const assignFormsToUser = useMutation(api.mutations.form.assignFormsToUser);
  const updateRecruiterNotes = useMutation(api.mutations.offers.updateRecruiterNotes); // Ajout de la mutation

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [openPdfViewer, setOpenPdfViewer] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [openNotesDialog, setOpenNotesDialog] = useState(false); // État pour ouvrir le Dialog des notes
  const [currentNotes, setCurrentNotes] = useState(""); // État pour stocker les notes actuelles
  const [currentOfferId, setCurrentOfferId] = useState<Id<"offers"> | null>(null); // État pour stocker l'ID de l'offre actuelle

  const isLoading = !job || !rawOffers;

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


  const handleAssignForms = async (userId: Id<"users">, candidateEmail: string) => {
    if (!formIds || formIds.length === 0) {
      toast.error("No form is associated with this job.");
      return;
    }
  
    setIsAssigning(true); // Activer le loader
  
    try {
      const assignedCount = await assignFormsToUser({ userId, formIds });
  
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
        toast.success("Email sent successfully!");
      }
    } catch (error) {
      console.error("Error assigning forms:", error);
      toast.error("An error occurred while assigning the forms.");
    } finally {
      setIsAssigning(false); // Désactiver le loader
    }
  };

  return (
    <AdminPanelLayout>
      <ContentLayout title="Dashboard">
        <div className="p-6 space-y-6">
          {/* En-tête de la page */}
          <Card className="border border-gray-200 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
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
                    className="text-blue-500"
                  >
                    <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                    <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{job?.title}</CardTitle>
                  <CardDescription className="text-lg text-gray-600">{job?.departmentName}</CardDescription>
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
                  className="text-gray-500"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Created At: {new Date(job?._creationTime).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Barre de recherche et filtre de tri */}
          <div className="flex gap-4">
            <Input
              placeholder="Search candidates by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Highest score first</SelectItem>
                <SelectItem value="asc">Lowest score first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau des offres */}
          <Card className="border border-gray-200 shadow-sm">
            <Table>
              <TableCaption className="text-lg font-semibold text-gray-900">
                List of offers for this job.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied At</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Recruiter Notes</TableHead>
                  <TableHead>CV</TableHead>
                  <TableHead>Report</TableHead>
                  <TableHead>Assign Forms</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers?.map((offer) => {
                  const statusBadge = getStatusBadge(offer.status);

                  return (
                    <TableRow key={offer._id}>
                      <TableCell className="font-medium">{offer.candidateName}</TableCell>
                      <TableCell>{offer.candidateEmail}</TableCell>
                      <TableCell>
                        <Badge className={`${statusBadge.color} flex items-center gap-1`}>
                          {statusBadge.icon}
                          {offer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(offer.appliedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{offer.score || "N/A"}</TableCell>
                      <TableCell>{offer.recruiterNotes || "No notes"}</TableCell>
                      <TableCell>
                        {offer.resume ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (offer.resume) {
                                handleOpenPdf(`/uploads/${offer.resume}`);
                              }
                            }}
                          >
                            <Download size={16} className="mr-2" />
                            View CV
                          </Button>
                        ) : (
                          <span className="text-gray-500">No CV available</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {offer.reportPdf ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (offer.reportPdf) {
                                handleOpenPdf(`/uploads/rapports/${offer.reportPdf}`);
                              }
                            }}
                          >
                            <Download size={16} className="mr-2" />
                            View Report
                          </Button>
                        ) : (
                          <span className="text-gray-500">No report available</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignForms(offer.candidateId, offer.candidateEmail)}
                          disabled={isAssigning}
                        >
                          {isAssigning ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Assign Forms"
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenNotesDialog(offer._id, offer.recruiterNotes || "")}
                        >
                          <Edit size={16} className="mr-2" />
                          Notes
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {/* Modal pour afficher les PDF */}
          <Dialog open={openPdfViewer} onOpenChange={setOpenPdfViewer}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>PDF Viewer</DialogTitle>
              </DialogHeader>
              {currentPdfUrl && <PDFViewer fileUrl={currentPdfUrl} />}
            </DialogContent>
          </Dialog>

          {/* Modal pour afficher et modifier les notes */}
          <Dialog open={openNotesDialog} onOpenChange={setOpenNotesDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Recruiter Notes</DialogTitle>
                <DialogDescription>Edit the notes for this candidate.</DialogDescription>
              </DialogHeader>
              <Textarea
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                placeholder="Enter your notes here..."
                className="mt-4"
              />
              <DialogFooter>
                <Button onClick={handleUpdateNotes}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}