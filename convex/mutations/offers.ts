import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Ajouter une nouvelle candidature (offer)
export const createOffer = mutation({
  args: {
    jobId: v.id("jobs"),
    candidateId: v.id("users"),
    coverLetter: v.optional(v.string()),
    resume: v.optional(v.string()), 
    status: v.literal("Pending"), 
    appliedAt: v.float64(),
    score: v.optional(v.number()),
    reportPdf: v.optional(v.string()), 


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
    score: v.optional(v.number()),
    reportPdf: v.optional(v.string()), 
    // Nouvel attribut score
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: args.status,
      recruiterNotes: args.recruiterNotes,
      reviewedAt: args.reviewedAt ?? undefined,
      updatedAt: args.updatedAt,
      score: args.score, // Mise à jour du score
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

export const updateRecruiterNotes = mutation({
  args: {
    offerId: v.id("offers"), // ID de l'offre à mettre à jour
    notes: v.string(), // Les nouvelles notes du recruteur
  },
  handler: async (ctx, args) => {
    const { offerId, notes } = args;

    await ctx.db.patch(offerId, {
      recruiterNotes: notes,
    });

    return "Notes updated successfully!";
  },
});