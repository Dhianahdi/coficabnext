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

export const getOffersByCandidateId = query({
  args: {
    candidateId: v.id("users"), // ID du candidat
  },
  handler: async (ctx, args) => {
    const { candidateId } = args;

    // Récupérer toutes les offres pour ce candidat
    const offers = await ctx.db
      .query("offers")
      .filter((q) => q.eq(q.field("candidateId"), candidateId))
      .collect();

    // Joindre les informations supplémentaires (comme le titre du poste et le nom de l'entreprise)
    const offersWithDetails = await Promise.all(
      offers.map(async (offer) => {
        const job = await ctx.db.get(offer.jobId);
        return {
          ...offer,
          jobTitle: job?.title || "N/A",
        };
      })
    );

    return offersWithDetails;
  },
});


export const getFormWithQuestions = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error("Formulaire non trouvé");
    }

    const questions = await ctx.db
      .query("questions")
      .withIndex("formId", (q) => q.eq("formId", args.formId))
      .collect();

    return {
      ...form,
      questions,
    };
  },
});