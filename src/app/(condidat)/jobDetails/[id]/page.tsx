"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { CalendarDays, CheckCircle, Clock, FileUser, Save, SendHorizontal, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FaMapMarkerAlt } from "react-icons/fa";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Label } from "@/components/ui/label";
import BlockEditor from "@/components/BlockEditor"; // Import BlockEditor
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.id as Id<"jobs">;
  const job = useQuery(api.queries.jobs.getJobById, { id: jobId });
  const isLoading = job === undefined;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!coverLetter.trim()) {
      setError("La lettre de motivation est obligatoire.");
      return;
    }
    if (!resume) {
      setError("Veuillez télécharger votre CV.");
      return;
    }
    setError("");
    setIsDialogOpen(false);
    alert("Candidature soumise avec succès !");
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

  const icon = statusIcons[job.status];

  return (
    <AdminPanelLayout>
      <ContentLayout title="Job Details">
        <div className="flex items-center justify-between mb-4">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Job Details & Application</h1>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center justify-center w-[160px] h-[40px] gap-2">
                <SendHorizontal size={18} />
                <span>Apply Now</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Apply for {job.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {error && <p className="text-red-500">{error}</p>}
                <Label>Cover Letter</Label>
                <Textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Write your cover letter..." />
                <Label>Upload Resume</Label>
                <Input type="file" onChange={(e:any) => setResume(e.target.files?.[0] || null)} />
              </div>
              <DialogFooter>
                <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button className="bg-primary" onClick={handleSubmit}>Submit Application</Button>
              </DialogFooter>
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
              <div className=" flex-1 flex flex-col">

                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Job Details</h3>
                <p className="text-sm text-muted-foreground">
                  Essential information about the job.
                </p>
              </div>
              <div className="space-y-4">

                <div className="flex items-center gap-4">
                  <Label className="min-w-24 whitespace-nowrap font-bold">Title</Label>
                  <p className="text-sm">{job.title}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Label className="min-w-24 whitespace-nowrap font-bold">Department</Label>
                  <p className="text-sm">{job.departmentName}</p> {/* Display department name */}
                </div>
                <div className="flex items-center gap-4">
                  <Label className="min-w-24 whitespace-nowrap font-bold">Requirements</Label>
                  <p className="text-sm">{job.requirements}</p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Compensation & Location Section */}
              <div className=" flex-1 flex flex-col">

                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Compensation & Location</h3>
                <p className="text-sm text-muted-foreground">Salary range and location.</p>
              </div>
              <div className="space-y-4">

                <div className="flex items-center gap-4">
                  <Label className="min-w-24 whitespace-nowrap font-bold">Salary Range</Label>
                  <p className="text-lg  ml-2">
                    {job.salaryRange} DT
                  </p>
                  <p className="text-sm text-muted-foreground ">
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
              <div className=" flex-1 flex flex-col">

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
              <div className=" flex-1 flex flex-col">

                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Application & Interview</h3>
                <p className="text-sm text-muted-foreground">Application deadline and interview process.</p>
              </div>
              <div className="space-y-4">

                <div className="flex items-center gap-4">
                  <Label className="min-w-24 whitespace-nowrap font-bold">Application Deadline</Label>
                  <div className="flex items-center text-sm">
                    <CalendarDays className="mr-2" size={16} /> {/* Added spacing on the right of the icon */}
                    <span>
                      {job.applicationDeadline ? format(new Date(job.applicationDeadline), "PPP") : "N/A"}
                    </span>
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
                <div className=" flex-1 flex flex-col">
                  <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Job Description</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed description of the job.
                  </p>
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
  );
}
