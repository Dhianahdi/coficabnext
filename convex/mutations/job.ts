import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Create a new job posting
 */
export const createJob = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    recruiterId: v.id("users"),
    departmentId: v.optional(v.id("departments")),
    requirements: v.optional(v.string()),
    salaryRange: v.optional(v.string()),
    employmentType: v.optional(v.string()),
    location: v.optional(v.string()),
    experienceLevel: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    applicationDeadline: v.optional(v.float64()),
    interviewProcess: v.optional(v.string()),
    benefits: v.optional(v.string()),
    status: v.string(), // Open, closed, paused
    collaborators: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const jobId = await ctx.db.insert("jobs", {
      ...args,
      updatedAt: Date.now(),
    });
    return jobId;
  },
});

/**
 * Update a job posting
 */
export const updateJob = mutation({
  args: {
    jobId: v.id("jobs"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    requirements: v.optional(v.string()),
    salaryRange: v.optional(v.string()),
    employmentType: v.optional(v.string()),
    location: v.optional(v.string()),
    experienceLevel: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    applicationDeadline: v.optional(v.float64()),
    interviewProcess: v.optional(v.string()),
    benefits: v.optional(v.string()),
    status: v.optional(v.string()),
    collaborators: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, { jobId, ...updates }) => {
    await ctx.db.patch(jobId, { ...updates, updatedAt: Date.now() });
    return { success: true };
  },
});

/**
 * Delete a job posting
 */
export const deleteJob = mutation({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, { jobId }) => {
    await ctx.db.delete(jobId);
    return { success: true };
  },
});
