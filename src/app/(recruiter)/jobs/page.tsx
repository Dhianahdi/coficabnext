// app/jobs/page.tsx
"use client";

import { useEffect } from "react";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { JobsTable } from "@/components/JobManagement/JobsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function JobsPage() {
  const router = useRouter();
  const rawJobs = useQuery(api.queries.jobs.getJobs);

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

  return (
    <AdminPanelLayout>
      <ContentLayout title="Dashboard">
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Job Management
            </h1>
            <Button onClick={() => router.push("/jobs/add")}>
              <Plus size={16} strokeWidth={2} aria-hidden="true" />
              <span>Add Job</span>
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Manage and oversee job postings within the system. Jobs can be posted,
            updated, and assigned to recruiters.
          </p>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <JobsTable jobs={jobs} />
          )}
        </div>

        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Spinner size="sm" className="bg-black dark:bg-white" />
          </div>
        )}
      </ContentLayout>
    </AdminPanelLayout>
  );
}