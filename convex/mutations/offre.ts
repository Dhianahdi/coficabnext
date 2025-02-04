import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Create a new job offer (Candidate applies for a job)
 */
export const createOffer = mutation({
  args: {
    jobId: v.id("jobs"),
    candidateId: v.id("users"),
    resumeURL: v.string(), // Link to the candidate's resume
    coverLetter: v.optional(v.string()), // Optional cover letter
    status: v.string(), // pending, accepted, rejected
  },
  handler: async (ctx, args) => {
    const offerId = await ctx.db.insert("offers", {
        ...args,

        updatedAt: Date.now(),
        appliedAt: Date.now()
    });
    return offerId;
  },
});

/**
 * Update an offer status (Recruiter updates candidate's application)
 */
export const updateOffer = mutation({
  args: {
    offerId: v.id("offers"),
    status: v.string(), // pending, accepted, rejected
  },
  handler: async (ctx, { offerId, status }) => {
    await ctx.db.patch(offerId, { status, updatedAt: Date.now() });
    return { success: true };
  },
});

/**
 * Delete an offer (Candidate withdraws their application)
 */
export const deleteOffer = mutation({
  args: {
    offerId: v.id("offers"),
  },
  handler: async (ctx, { offerId }) => {
    await ctx.db.delete(offerId);
    return { success: true };
  },
});
