import { v } from "convex/values";
import { query } from "../_generated/server";

export const getJobs = query(async ({ db }) => {
    const jobs = await db.query("jobs").collect();

    return await Promise.all(
        jobs.map(async (job) => {
            // Fetch recruiter details
            const recruiter = await db.get(job.recruiterId);
            const recruiterName = recruiter?.name || "Unknown Recruiter";

            // Fetch department details (if departmentId exists)
            let departmentName = "No Department";
            if (job.departmentId) {
                const department = await db.get(job.departmentId);
                departmentName = department?.name || "Unknown Department";
            }

            // Fetch collaborator names (if collaborators exist)
            let collaboratorNames: string[] = [];
            if (job.collaborators && job.collaborators.length > 0) {
                collaboratorNames = await Promise.all(
                    job.collaborators.map(async (collaboratorId) => {
                        const collaborator = await db.get(collaboratorId);
                        return collaborator?.name || "Unknown Collaborator";
                    })
                );
            }

            return {
                ...job,
                recruiterName, // Add recruiter name
                departmentName, // Add department name
                collaboratorNames, // Add collaborator names
            };
        })
    );
});
export const getJobById = query({
    args: { id: v.id("jobs") }, // Job ID to fetch
    handler: async ({ db }, { id }) => {
        const job = await db.get(id);
        if (!job) return null;

        // Fetch recruiter details
        const recruiter = await db.get(job.recruiterId);
        const recruiterName = recruiter?.name || "Unknown Recruiter";

        // Fetch department details (if departmentId exists)
        let departmentName = "No Department";
        if (job.departmentId) {
            const department = await db.get(job.departmentId);
            departmentName = department?.name || "Unknown Department";
        }

        // Fetch collaborator names (if collaborators exist)
        let collaboratorNames: string[] = [];
        if (job.collaborators && job.collaborators.length > 0) {
            collaboratorNames = await Promise.all(
                job.collaborators.map(async (collaboratorId) => {
                    const collaborator = await db.get(collaboratorId);
                    return collaborator?.name || "Unknown Collaborator";
                })
            );
        }
        

        return {
            ...job,
            recruiterName, // Add recruiter name
            departmentName, // Add department name
            collaboratorNames, // Add collaborator names
        };
    },
});