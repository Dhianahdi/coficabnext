"use client";

import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import CardPost from "@/components/Home/CardPost";
import { useQuery } from "convex/react";
import { Skeleton } from "@/components/ui/skeleton"; // Add a skeleton loader
import { Card } from "@/components/ui/card";
import { api } from "../../../../convex/_generated/api";

export default function Condidatjobs() {
  // Fetch jobs from Convex
  const jobs = useQuery(api.queries.jobs.getJobs);

  if (jobs === undefined) {
    // Loading state
    return (
      <AdminPanelLayout>
        <ContentLayout title="Recent Jobs">
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </ContentLayout>
      </AdminPanelLayout>
    );
  }

  if (jobs.length === 0) {
    // No jobs found
    return (
      <AdminPanelLayout>
        <ContentLayout title="Recent Jobs">
          <div className="mt-6">
            <p className="text-muted-foreground">No jobs found.</p>
          </div>
        </ContentLayout>
      </AdminPanelLayout>
    );
  }

  return (
    <AdminPanelLayout>
      <ContentLayout title="Recent Jobs">
        <div>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Home
          </h3>
          <div className="leading-7">
            Overview of your activities and trends.
          </div>

          {/* Render the CardPost components in a grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <CardPost
                key={job._id}
                user={{
                  avatar: job.recruiterAvatar, // Pass the recruiter's avatar
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