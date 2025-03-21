"use client";

import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import CardPost from "@/components/Home/CardPost";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CardPostSkeleton } from "@/components/Home/CardPostSkeleton"; // Import the skeleton component
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Condidatjobs() {
    const Me = useQuery(api.auth.getMe);
    const router = useRouter();
  
    useEffect(() => {
      if (Me && Me.department!== null) {
        router.push("/access-denied");
      }
    }, [Me, router]);
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
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
             <Image
               src="/img/NoResultFound.png" // Chemin relatif depuis le dossier public
               alt="No offers available"
                         width={700} // Desired width of the image
                         height={700} // Desired height of the image
                         className="object-cover" // Ensures the image scales properly
                       />
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  No jobs available at the moment
                </h3>
                <p className="text-gray-600">
                  Check back later to discover new opportunities.
                </p>
              </div>
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
