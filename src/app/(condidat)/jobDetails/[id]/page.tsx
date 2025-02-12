"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { CalendarDays, CheckCircle, Clock, XCircle } from "lucide-react";
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

export default function JobDetailsPage() {
  // Use useParams to get the job ID from the URL
  const params = useParams();
  const jobId = params.id as Id<"jobs">;

  // Fetch the job details using the job ID
  const job = useQuery(api.queries.jobs.getJobById, { id: jobId });

  // Show a loading state while the job data is being fetched
  if (!job) {
    return <div>Loading...</div>;
  }

  // Status icons for different job statuses
  const statusIcons = {
    Pending: <Clock size={12} className="text-yellow-500 -ms-0.5" strokeWidth={2} aria-hidden="true" />,
    Open: <CheckCircle size={12} className="text-green-500 -ms-0.5" strokeWidth={2} aria-hidden="true" />,
    Closed: <XCircle size={12} className="text-red-500 -ms-0.5" strokeWidth={2} aria-hidden="true" />,
  };

  // Get the appropriate icon for the job status
  const icon = statusIcons[job.status];

  return (
    <AdminPanelLayout>
      <ContentLayout title="Job Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-6">
            {/* Description Section */}
            <Card className="p-6 h-full flex flex-col">
              <div className=" flex-1 flex flex-col">
                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Job Description</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed description of the job.
                </p>
                <div className="flex-1 overflow-y-auto">
                  <BlockEditor value={job.description} onChange={() => { }} editable={false} />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel */}
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
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}