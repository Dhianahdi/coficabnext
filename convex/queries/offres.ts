import { query } from "../_generated/server";
import { v } from "convex/values";

export const getOfferByCandidateAndJob = query({
  args: {
    candidateId: v.id("users"), // ID du candidat
    jobId: v.id("jobs"), // ID de l'offre d'emploi
  },
  handler: async (ctx, args) => {
    // Rechercher une candidature correspondante
    const offer = await ctx.db
      .query("offers")
      .filter((q) =>
        q.and(
          q.eq(q.field("candidateId"), args.candidateId),
          q.eq(q.field("jobId"), args.jobId)
        )
      )
      .first();

    return offer; // Retourne la candidature si elle existe, sinon `null`
  },
});
export const getOffers = query({
  args: {}, // Pas d'arguments nécessaires
  handler: async (ctx) => {
    // Récupérer toutes les offres
    const offers = await ctx.db.query("offers").collect();
    return offers;
  },
});


export const getOffersByJobId = query({
  args: {
    jobId: v.id("jobs"), // L'ID du job pour lequel récupérer les offres
  },
  handler: async (ctx, args) => {
    // Récupérer toutes les offres associées à ce job
    const offers = await ctx.db
      .query("offers")
      .withIndex("jobId", (q) => q.eq("jobId", args.jobId))
      .collect();

    // Récupérer les détails des candidats pour chaque offre
    const offersWithCandidates = await Promise.all(
      offers.map(async (offer) => {
        const candidate = await ctx.db.get(offer.candidateId); // Récupérer les détails du candidat
        return {
          ...offer,
          candidateName: candidate ? `${candidate.email} ` : "Unknown",
          candidateEmail: candidate ? candidate.email : "Unknown",
        };
      })
    );

    return offersWithCandidates;
  },
});