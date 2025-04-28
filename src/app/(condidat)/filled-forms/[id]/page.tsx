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
console.log(filledFormsByEmail)
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
        <ContentLayout title="Filled Forms">
          <div className="p-6 space-y-8">
            {/* Header and search bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border border-border overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary"></div>
                <CardHeader className="bg-muted/20 pb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                        Candidate Responses
                      </CardTitle>
                      <CardDescription className="text-base text-muted-foreground mt-1">
                        Review forms completed by candidates for this position
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                      </svg>
                    </div>
                    <Input
                      type="text"
                      placeholder="Filter by candidate email..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="pl-10 border-border bg-background text-foreground"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Candidate forms list */}
            {filteredFormsByEmail.length > 0 ? (
              filteredFormsByEmail.map(([email, forms]) => (
                <motion.div
                  key={email}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 bg-muted/10 p-4 rounded-lg border border-border">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${email}`} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{email}</h2>
                      <p className="text-sm text-muted-foreground">
                        {forms.length} {forms.length === 1 ? 'form' : 'forms'} submitted
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map((form) => (
                      <motion.div
                        key={form._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="hover:shadow-md transition-all duration-300 border border-border overflow-hidden">
                          <div className={`h-1 w-full ${form.completed ? "bg-green-500" : "bg-amber-500"}`}></div>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg font-bold text-foreground line-clamp-1">
                                {form.title}
                              </CardTitle>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    variant={form.completed ? "default" : "outline"} 
                                    className={form.completed ? 
                                      "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200" : 
                                      "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200"
                                    }
                                  >
                                    {form.completed ? "Completed" : "Pending"}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  {form.completed
                                    ? "This form has been completed"
                                    : "This form is still pending completion"}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <CardDescription className="text-muted-foreground line-clamp-2 mt-1">
                              {form.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              <span>
                                Submitted on {new Date(form.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center text-sm">
                              <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-2 font-medium">
                                {form.questions?.length || 0}
                              </div>
                              <span className="text-muted-foreground">
                                {form.questions?.length || 0} {form.questions?.length === 1 ? 'question' : 'questions'}
                              </span>
                            </div>
                          </CardContent>
                          <CardFooter className="bg-muted/10 border-t border-border pt-3">
                            <Button
                              variant="outline"
                              className="w-full hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors"
                              onClick={() => handleViewDetails(form)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View Responses
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
                className="flex flex-col items-center justify-center py-12 space-y-4"
              >
                <div className="bg-muted/20 rounded-full p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M12 18v-6"></path>
                    <path d="M8 15h8"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground">No forms found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  There are no submitted forms for this job position yet, or your search filter returned no results.
                </p>
              </motion.div>
            )}
          </div>

          {/* Form details dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background text-foreground">
              <DialogHeader className="border-b border-border pb-4">
                <DialogTitle className="text-2xl font-bold">{selectedForm?.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1">
                  {selectedForm?.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {selectedForm?.questions.map((question, qIndex) => {
                  const response = selectedForm.responses.find(
                    (r) => r.questionId === question._id
                  );

                  return (
                    <div key={question._id} className="p-4 border border-border rounded-lg bg-muted/5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-primary/10 text-primary rounded-full w-7 h-7 flex items-center justify-center font-medium text-sm">
                          {qIndex + 1}
                        </div>
                        <Badge variant="outline" className="font-normal">
                          {question.type === "single-choice" 
                            ? "Single Choice" 
                            : question.type === "multiple-choice" 
                              ? "Multiple Choice" 
                              : "Open-Ended"}
                        </Badge>
                      </div>
                      
                      <p className="font-medium text-foreground mb-3">{question.text}</p>
                      
                      {question.type === "single-choice" && (
                        <div className="space-y-2 pl-2">
                          {question.options?.map((option, index) => (
                            <div 
                              key={index} 
                              className={`flex items-center space-x-2 p-2 rounded-md ${
                                response?.answer === option ? "bg-primary/10 border border-primary/20" : ""
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full border ${
                                response?.answer === option 
                                  ? "border-primary bg-primary" 
                                  : "border-muted-foreground"
                              }`}>
                                {response?.answer === option && (
                                  <div className="w-2 h-2 rounded-full bg-white mx-auto mt-0.5"></div>
                                )}
                              </div>
                              <label className={`text-sm ${
                                response?.answer === option ? "font-medium text-foreground" : "text-muted-foreground"
                              }`}>
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === "multiple-choice" && (
                        <div className="space-y-2 pl-2">
                          {question.options?.map((option, index) => {
                            const isSelected = Array.isArray(response?.answer) && response?.answer.includes(option);
                            return (
                              <div 
                                key={index} 
                                className={`flex items-center space-x-2 p-2 rounded-md ${
                                  isSelected ? "bg-primary/10 border border-primary/20" : ""
                                }`}
                              >
                                <div className={`w-4 h-4 rounded-sm border ${
                                  isSelected 
                                    ? "border-primary bg-primary" 
                                    : "border-muted-foreground"
                                }`}>
                                  {isSelected && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mt-0.5">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  )}
                                </div>
                                <label className={`text-sm ${
                                  isSelected ? "font-medium text-foreground" : "text-muted-foreground"
                                }`}>
                                  {option}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {question.type === "open-ended" && (
                        <div className="bg-muted/20 p-4 rounded-md border border-border mt-2">
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {response?.answer || <span className="italic text-muted-foreground">No answer provided</span>}
                          </p>
                        </div>
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