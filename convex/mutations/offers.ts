import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Ajouter une nouvelle candidature (offer)
export const createOffer = mutation({
  args: {
    jobId: v.id("jobs"),
    candidateId: v.id("users"),
    coverLetter: v.optional(v.string()),
    resume: v.optional(v.string()), // Identifiant du fichier du CV
    status: v.literal("Pending"), // Nouvelle candidature = "Pending"
    appliedAt: v.float64(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("offers", {
      ...args,
      reviewedAt: 0,
      recruiterNotes: "",
      updatedAt: args.appliedAt, // Initialisé à la date de candidature
    });
  },
});

// Mettre à jour une candidature
export const updateOffer = mutation({
  args: {
    id: v.id("offers"),
    status: v.optional(v.string()), // Nouveau statut de la candidature
    recruiterNotes: v.optional(v.string()),
    reviewedAt: v.optional(v.float64()),
    updatedAt: v.float64(), // Date de mise à jour
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: args.status,
      recruiterNotes: args.recruiterNotes,
      reviewedAt: args.reviewedAt ?? undefined,
      updatedAt: args.updatedAt,
    });
  },
});

// Supprimer une candidature
export const deleteOffer = mutation({
  args: { id: v.id("offers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
