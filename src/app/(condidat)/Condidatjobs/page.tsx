"use client";

import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import CardPost from "@/components/Home/CardPost";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CardPostSkeleton } from "@/components/Home/CardPostSkeleton"; // Import the skeleton component

export default function Condidatjobs() {
  // Fetch jobs from Convex
  const jobs = useQuery(api.queries.jobs.getJobs);

  if (jobs === undefined) {
    // Loading state with skeleton placeholders
    return (
      <AdminPanelLayout>
        <ContentLayout title="Recent Jobs">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Available Jobs
          </h1>
          <small className="text-sm font-medium leading-none">
            Browse the latest job listings tailored to your interests and skills. Stay ahead with real-time updates!
          </small>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <CardPostSkeleton key={index} /> // Use the skeleton component
            ))}
          </div>
        </ContentLayout>
      </AdminPanelLayout>
    );
  }

  // Filter jobs with status "Open" and applicationDeadline > now
  const currentTimestamp = Date.now();
  console.log(currentTimestamp)
  const openJobs = jobs.filter(job => 
    job.status === "Open" && 
    job.applicationDeadline !== undefined && 
    job.applicationDeadline > currentTimestamp
  );

  if (openJobs.length === 0) {
    // No open jobs found
    return (
      <AdminPanelLayout>
        <ContentLayout title="Recent Jobs">
          <div className="mt-6">
            <p className="text-muted-foreground">No open jobs found.</p>
          </div>
        </ContentLayout>
      </AdminPanelLayout>
    );
  }

  return (
    <AdminPanelLayout>
      <ContentLayout title="Recent Jobs">
        <div>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Available Jobs
          </h1>
          <small className="text-sm font-medium leading-none">
            Browse the latest job listings tailored to your interests and skills. Stay ahead with real-time updates!
          </small>

          {/* Render the CardPost components in a grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {openJobs.map((job) => (
              <CardPost
                key={job._id}
                user={{
                  avatar: job.recruiterImage, // Pass the recruiter's avatar
                  name: job.recruiterName,
                }}
                post={{
                  _id: job._id,
                  title: job.title,
                  content: job.description || "No description available.",
                  tags: job.tags || [], // Default to an empty array if tags are not provided
                  createdAt: job._creationTime, // Pass the numeric timestamp directly
                  recruiterName: job.recruiterName,
                  departmentName: job.departmentName,
                  collaboratorNames: job.collaboratorNames || [], // Default to an empty array if collaborators are not provided
                  requirements: job.requirements,
                  salaryRange: job.salaryRange,
                  employmentType: job.employmentType,
                  location: job.location,
                  experienceLevel: job.experienceLevel,
                  applicationDeadline: job.applicationDeadline,
                  interviewProcess: job.interviewProcess,
                  status: job.status,
                }}
              />
            ))}
          </div>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}
