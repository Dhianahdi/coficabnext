"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Spinner } from "@/components/ui/spinner";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Définir les types
type FormQuestion = {
  _id: string;
  text: string;
  type: "single-choice" | "multiple-choice" | "open-ended";
  options?: string[];
};

type FormResponse = {
  questionId: string;
  answer: string | string[];
};

type SelectedForm = {
  _id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
  responses: FormResponse[];
};

export default function FilledFormsPage() {
  const params = useParams();
  const jobId = params.id as Id<"jobs">;
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedForm, setSelectedForm] = useState<SelectedForm | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const Me = useQuery(api.auth.getMe);
  const router = useRouter();

  useEffect(() => {
    if (Me && Me.department?.name !== "RH") {
      router.push("/access-denied");
    }
  }, [Me, router]);

  const filledFormsByEmail = useQuery(api.mutations.form.getFilledFormsByJobId, {
    jobId,
  });

  if (!filledFormsByEmail) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  const filteredFormsByEmail = Object.entries(filledFormsByEmail).filter(([email]) =>
    email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  const handleViewDetails = (form: SelectedForm) => {
    setSelectedForm(form);
    setIsDialogOpen(true);
  };

  return (
    <TooltipProvider>
      <AdminPanelLayout>
        <ContentLayout title="Dashboard">
          <div className="p-6 space-y-6">
            {/* Titre et barre de recherche */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-lg bg-background">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-foreground">
                    Filled Forms
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    View and manage forms filled by candidates.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    type="text"
                    placeholder="Search by email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="bg-background text-foreground border-border"
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Liste des formulaires remplis */}
            {filteredFormsByEmail.length > 0 ? (
              filteredFormsByEmail.map(([email, forms]) => (
                <motion.div
                  key={email}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${email}`} />
                      <AvatarFallback>{email[0]}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold text-foreground">User: {email}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map((form) => (
                      <motion.div
                        key={form._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow duration-300 bg-background">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xl font-bold text-foreground">
                                {form.title}
                              </CardTitle>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant={form.completed ? "default" : "destructive"}>
                                    {form.completed ? "Completed" : "Pending"}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {form.completed
                                    ? "This form has been completed."
                                    : "This form is still pending."}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <CardDescription className="text-muted-foreground">
                              {form.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm text-muted-foreground">
                              <p>
                                <strong>Submitted on:</strong>{" "}
                                {new Date(form.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button
                              variant="outline"
                              className="w-full bg-background text-foreground border-border hover:bg-secondary"
                              onClick={() => handleViewDetails(form)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <p className="text-muted-foreground">No forms found for this job ID.</p>
              </motion.div>
            )}
          </div>

          {/* Dialogue pour afficher les détails du formulaire */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background text-foreground">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedForm?.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {selectedForm?.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {selectedForm?.questions.map((question) => {
                  const response = selectedForm.responses.find(
                    (r) => r.questionId === question._id
                  );

                  return (
                    <div key={question._id} className="space-y-2">
                      <p className="font-medium text-foreground">{question.text}</p>
                      {question.type === "single-choice" && (
                        <div className="space-y-1">
                          {question.options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                checked={response?.answer === option}
                                readOnly
                                className="form-radio text-primary"
                              />
                              <label className="text-foreground">{option}</label>
                            </div>
                          ))}
                        </div>
                      )}
                      {question.type === "multiple-choice" && (
                        <div className="space-y-1">
                          {question.options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={response?.answer?.includes(option)}
                                readOnly
                                className="form-checkbox text-primary"
                              />
                              <label className="text-foreground">{option}</label>
                            </div>
                          ))}
                        </div>
                      )}
                      {question.type === "open-ended" && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Answer:</strong> {response?.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </ContentLayout>
      </AdminPanelLayout>
    </TooltipProvider>
  );
}