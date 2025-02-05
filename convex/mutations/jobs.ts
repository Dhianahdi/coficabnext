import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "../_generated/dataModel";


/**
 * Create a new job posting
 */

export const createJob = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    departmentId: v.optional(v.id("departments")),
    requirements: v.optional(v.string()),
    salaryRange: v.optional(v.string()),
    employmentType: v.optional(v.string()),
    location: v.optional(v.string()),
    experienceLevel: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    applicationDeadline: v.optional(v.float64()),
    interviewProcess: v.optional(v.string()),
    collaborators: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    // Ensure the recruiter exists
    const recruiter = await ctx.db.get(userId as Id<"users">);
    if (!recruiter) throw new Error("Recruiter not found");

    // Ensure the department exists if provided
    if (args.departmentId) {
      const department = await ctx.db.get(args.departmentId);
      if (!department) throw new Error("Department not found");
    }

    // Ensure collaborators exist if provided
    if (args.collaborators) {
      for (const collaboratorId of args.collaborators) {
        const collaborator = await ctx.db.get(collaboratorId);
        if (!collaborator) throw new Error(`Collaborator ID ${collaboratorId} not found`);
      }
    }

    // Insert the job into the database
    const jobId = await ctx.db.insert("jobs", {
      title: args.title,
      description: args.description,
      recruiterId: userId as Id<"users">,
      departmentId: args.departmentId,
      requirements: args.requirements,
      salaryRange: args.salaryRange,
      employmentType: args.employmentType,
      location: args.location,
      experienceLevel: args.experienceLevel,
      tags: args.tags,
      applicationDeadline: args.applicationDeadline,
      interviewProcess: args.interviewProcess,
      collaborators: args.collaborators,
      updatedAt: Date.now(),
    });

    return jobId;
  },
});
