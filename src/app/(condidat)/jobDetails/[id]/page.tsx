"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { CalendarDays, CheckCircle, Clock, FileUser, SendHorizontal, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FaMapMarkerAlt } from "react-icons/fa";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Label } from "@/components/ui/label";
import BlockEditor from "@/components/BlockEditor";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.id as Id<"jobs">;
  const job = useQuery(api.queries.jobs.getJobById, { id: jobId });
  const Me = useQuery(api.auth.getMe);


  const isLoading = job === undefined;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractedText, setExtractedText] = useState("");

  const existingApplication = useQuery(api.queries.offres.getOfferByCandidateAndJob, {
    candidateId: Me?._id as Id<"users">,
    jobId: jobId,
  });



  /**
   * Handles the submission of the application form.
   */
  const handleSubmit = async () => {
    if (existingApplication) {
      setError("You have already applied to this job.");
      return;
    }

    if (!resume) {
      setError("Please upload your resume.");
      return;
    }

    if (!Me) {
      setError("You must be logged in to apply.");
      return;
    }

    if (!job) {
      setError("Job details are not available.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: Upload the resume
      const formData = new FormData();
      formData.append("file", resume);
      
      // File upload
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload resume");
      }
      
      const { fileName } = await uploadResponse.json();
      
      // Step 2: Extract text from the resume
      const extractFormData = new FormData();
      extractFormData.append("file", resume);
      
      const extractResponse = await fetch("/api/extract-text", {
        method: "POST",
        body: extractFormData,
      });
      
      if (!extractResponse.ok) {
        throw new Error("Failed to extract text from resume");
      }
      
      const { text: cvText } = await extractResponse.json();
      setExtractedText(cvText);
      
   
      toast.info("Your resume is being processed...");
      // Close the dialog immediately
      setIsDialogOpen(false);
      
      // Reset form states
      setCoverLetter("");
      setResume(null);
      setError("");
      
      // Step 3: Submit the application
      const applicationFormData = new FormData();
      applicationFormData.append("file", resume);
      applicationFormData.append("jobId", jobId);
      applicationFormData.append("candidateId", Me._id);
      applicationFormData.append("coverLetter", coverLetter);
      applicationFormData.append("candidateName", Me.name || "Candidate");
      applicationFormData.append("cvText", cvText);
      applicationFormData.append("fileName", fileName);
      
      // Add job details
      applicationFormData.append("jobTitle", job.title);
      applicationFormData.append("jobDepartment", job.departmentName || "");
      applicationFormData.append("jobRequirements", job.requirements || "");
      applicationFormData.append("jobSalaryRange", job.salaryRange || "");
      applicationFormData.append("jobLocation", job.location || "");
      applicationFormData.append("jobEmploymentType", job.employmentType || "");
      applicationFormData.append("jobExperienceLevel", job.experienceLevel || "");
      
      // Call the submit-application API
      const submitResponse = await fetch("/api/submit-application", {
        method: "POST",
        body: applicationFormData,
      });
      
      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.error || "Failed to submit application");
      }
      
      const result = await submitResponse.json();
      
      // Display a success toast after submission
    
      toast.success("Your application has been submitted successfully.");
      
    } catch (error) {
      console.error("Error submitting application:", error);
      setError(error instanceof Error ? error.message : "An error occurred while submitting your application.");
      
      // Display an error toast
     

      toast.error("Application failed")
      
      // Reopen the dialog if there was an error
      setIsDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Spinner variant="ring" size={40} className="text-primary" />
      </div>
    );
  }

  const statusIcons = {
    Pending: <Clock size={12} className="text-yellow-500 -ms-0.5" strokeWidth={2} aria-hidden="true" />,
    Open: <CheckCircle size={12} className="text-green-500 -ms-0.5" strokeWidth={2} aria-hidden="true" />,
    Closed: <XCircle size={12} className="text-red-500 -ms-0.5" strokeWidth={2} aria-hidden="true" />,
  };


  return (
    <AdminPanelLayout>
      <ContentLayout title="Job Details">
        <div className="flex items-center justify-between mb-4">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Job Details & Application</h1>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center justify-center w-[160px] h-[40px] gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
                <SendHorizontal size={18} />
                <span>Apply Now</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl p-0 overflow-hidden">
              <div className="flex flex-col h-full">
                {/* Application form */}
                <div className="w-full p-6">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl">Apply for {job.title}</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Complete the form below to submit your application
                    </p>
                  </DialogHeader>

                  {isSubmitting ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                      <div className="relative">
                        <Spinner variant="ring" size={50} className="text-primary" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileUser size={20} className="text-primary/70" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Processing your application</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Please wait while we analyze your resume...
                        </p>
                        <div className="w-full max-w-xs mx-auto mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary animate-pulse rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Error and warning messages */}
                      {existingApplication && (
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start mb-4">
                          <Clock className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-amber-800 font-medium">You have already applied to this job</p>
                            <p className="text-amber-700 text-sm mt-1">Your application is under review.</p>
                          </div>
                        </div>
                      )}
                      
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start mb-4">
                          <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                          <p className="text-red-700 font-medium">{error}</p>
                        </div>
                      )}

                      {/* Application steps */}
                      <div className="flex justify-between mb-5 relative">
                        <div className="absolute top-3 left-0 w-full h-0.5 bg-muted"></div>
                        {['Resume', 'Cover Letter', 'Review'].map((step, i) => (
                          <div key={i} className="relative flex flex-col items-center z-10">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${i === 0 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                              {i + 1}
                            </div>
                            <span className="text-xs mt-1">{step}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        {/* Resume Section */}
                        <div>
                          <Label className="text-base font-medium">Resume / CV</Label>
                          <p className="text-sm text-muted-foreground mb-2">Upload your resume in PDF format (max 5MB)</p>
                          
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors bg-muted/10">
                            {resume ? (
                              <div className="w-full">
                                <div className="flex items-center gap-2 text-sm bg-white/50 p-2 rounded-md">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <FileUser size={16} className="text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <span className="font-medium block">{resume.name}</span>
                                    <span className="text-xs text-muted-foreground">{(resume.size / 1024).toFixed(0)} KB · PDF</span>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 px-2 text-muted-foreground hover:text-destructive" 
                                    onClick={() => setResume(null)}
                                  >
                                    <XCircle size={14} />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                  <FileUser size={20} className="text-primary" />
                                </div>
                                <p className="text-sm font-medium">Drag and drop your resume here or click to browse</p>
                                <p className="text-xs text-muted-foreground">PDF format only, max size 5MB</p>
                              </>
                            )}
                            <Input 
                              type="file" 
                              accept="application/pdf" 
                              onChange={(e) => setResume(e.target.files?.[0] || null)} 
                              className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${resume ? 'pointer-events-none' : ''}`}
                            />
                          </div>
                        </div>

                        {/* Cover Letter Section */}
                        <div>
                          <Label className="text-base font-medium">Cover Letter</Label>
                          <p className="text-sm text-muted-foreground mb-2">Explain why you're the ideal candidate for this position</p>
                          <Textarea 
                            value={coverLetter} 
                            onChange={(e) => setCoverLetter(e.target.value)} 
                            placeholder="Describe your motivations and relevant skills..." 
                            className="min-h-[100px] resize-y"
                          />
                        </div>

                        {/* GDPR Consent */}
                        <div className="bg-muted/20 p-3 rounded-md">
                          <div className="flex items-start space-x-2">
                            <input type="checkbox" id="consent" className="mt-1" />
                            <label htmlFor="consent" className="text-xs text-muted-foreground">
                              By submitting my application, I agree that my personal data will be processed in accordance with the privacy policy for the recruitment process.
                            </label>
                          </div>
                        </div>
                      </div>

                      <DialogFooter className="mt-5 gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSubmit} 
                          disabled={!!existingApplication || isSubmitting}
                          className="gap-2"
                        >
                          <SendHorizontal size={16} />
                          Submit Application
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <p className="leading-7 [&:not(:first-child)]:mb-6">View job details, requirements, and compensation. Submit your application to take the next step in your career.</p>

        {isLoading ? (
          <div className="flex justify-center items-center h-[300px] w-full">
            <Spinner variant="ring" size={40} className="text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Panel */}
            <div className="space-y-6">
              {/* Job Details Section */}
              <div className="flex-1 flex flex-col">
                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Job Details</h3>
                <p className="text-sm text-muted-foreground">Essential information about the job.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label className="min-w-24 whitespace-nowrap font-bold">Title</Label>
                  <p className="text-sm">{job.title}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Label className="min-w-24 whitespace-nowrap font-bold">Department</Label>
                  <p className="text-sm">{job.departmentName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Label className="min-w-24 whitespace-nowrap font-bold">Requirements</Label>
                  <p className="text-sm">{job.requirements}</p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Compensation & Location Section */}
              <div className="flex-1 flex flex-col">
                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Compensation & Location</h3>
                <p className="text-sm text-muted-foreground">Salary range and location.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label className="min-w-24 whitespace-nowrap font-bold">Salary Range</Label>
                  <p className="text-lg ml-2">{job.salaryRange} DT</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">/ Month</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Label className="min-w-24 whitespace-nowrap font-bold">Location</Label>
                  <div className="flex items-center text-sm mb-1">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Employment Details Section */}
              <div className="flex-1 flex flex-col">
                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Employment Details</h3>
                <p className="text-sm text-muted-foreground">Employment type, experience level, and tags.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label className="min-w-24 whitespace-nowrap font-bold">Employment Type</Label>
                  <p className="text-sm">{job.employmentType}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Label className="min-w-24 whitespace-nowrap font-bold">Experience Level</Label>
                  <p className="text-sm">{job.experienceLevel}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Label className="min-w-28 whitespace-nowrap font-bold">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {job.tags?.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Application & Interview Section */}
              <div className="flex-1 flex flex-col">
                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Application & Interview</h3>
                <p className="text-sm text-muted-foreground">Application deadline and interview process.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label className="min-w-24 whitespace-nowrap font-bold">Application Deadline</Label>
                  <div className="flex items-center text-sm">
                    <CalendarDays className="mr-2" size={16} />
                    <span>{job.applicationDeadline ? format(new Date(job.applicationDeadline), "PPP") : "N/A"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Label className="min-w-24 whitespace-nowrap font-bold">Interview Process</Label>
                  <p className="text-sm">{job.interviewProcess}</p>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="space-y-6">
              {/* Description Section */}
              <Card className="p-6 h-full flex flex-col">
                <div className="flex-1 flex flex-col">
                  <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Job Description</h3>
                  <p className="text-sm text-muted-foreground">Detailed description of the job.</p>
                  <div className="flex-1 overflow-y-auto">
                    <BlockEditor initialContent={job.description} onChange={() => { }} editable={false} />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </ContentLayout>
    </AdminPanelLayout>
  );}
