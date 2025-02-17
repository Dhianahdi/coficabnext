// app/jobs/page.tsx
"use client";

import { useEffect, useState } from "react"; // Import useState
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { JobsTable } from "@/components/JobManagement/JobsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/spinner"; // Import the Spinner component

export default function JobsPage() {
  const router = useRouter();
  const rawJobs = useQuery(api.queries.jobs.getJobs);
  const [isRedirecting, setIsRedirecting] = useState(false); // State for loading spinner

  const jobs =
    rawJobs?.map((job) => {
      const createdAt = new Date(job._creationTime).toISOString();
      return {
        ...job,
        createdAt,
        collaborators: job.collaborators ? job.collaborators.map(() => "Unknown Collaborator") : [],
      };
    }) || [];

  const isLoading = !rawJobs;

  useEffect(() => {
    console.log("Jobs:", jobs);
  }, [jobs]);

  // Handle the "Add Job" button click
  const handleAddJobClick = () => {
    setIsRedirecting(true); // Show the spinner

    setTimeout(() => {
      router.push("/Recruiterjobs/add"); // Navigate after a short delay
      setIsRedirecting(false); // Show the spinner

    }, 1000); // 300ms delay ensures the spinner appears
  };



  return (
    <AdminPanelLayout>
      <ContentLayout title="Dashboard">
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Job Management
            </h1>
            <Button
              onClick={handleAddJobClick}
              className="flex items-center justify-center w-[120px] h-[40px]" // Fixed width and height
              disabled={isRedirecting} // Disable the button while redirecting
            >
              {isRedirecting ? (
                <Spinner variant="ring" size={24} />
              ) : (
                <>
                  <Plus size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Add Job</span>
                </>
              )}
            </Button>




          </div>

          <p className="leading-7 [&:not(:first-child)]:mb-6">
            Manage and oversee job postings within the system. Jobs can be posted,
            updated.
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center h-[300px] w-full">
              <Spinner variant="ring" size={40} className="text-primary" />
            </div>
          ) : (
            <JobsTable jobs={jobs} />
          )}
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}