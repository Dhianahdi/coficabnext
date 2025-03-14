// convex/queries/jobs.ts
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getJobStats = query({
  handler: async (ctx) => {
    const jobs = await ctx.db.query("jobs").collect();
    const offers = await ctx.db.query("offers").collect();

    const totalJobs = jobs.length;
    const openPositions = jobs.filter((job) => job.status === "Open").length;
    const candidatesHired = offers.filter((offer) => offer.status === "Accepted").length;
    const totalCandidates = offers.length;
    const pendingInterviews = offers.filter((offer) => offer.status === "Interview").length;
    const rejectedCandidates = offers.filter((offer) => offer.status === "Rejected").length;

    return [
      { title: "Total Jobs Posted", value: totalJobs, progress: (totalJobs / 100) * 100 },
      { title: "Open Positions", value: openPositions, progress: (openPositions / totalJobs) * 100 },
      { title: "Candidates Hired", value: candidatesHired, progress: (candidatesHired / totalJobs) * 100 },
      { title: "Total Candidates", value: totalCandidates, progress: (totalCandidates / 100) * 100 },
      { title: "Pending Interviews", value: pendingInterviews, progress: (pendingInterviews / totalCandidates) * 100 },
      { title: "Rejected Candidates", value: rejectedCandidates, progress: (rejectedCandidates / totalCandidates) * 100 },
    ];
  },
});

  export const getRecentJobs = query({
    handler: async (ctx) => {
      // Récupérer les 5 derniers jobs
      const jobs = await ctx.db
        .query("jobs")
        .order("desc")
        .take(5);
  
      // Ajouter le nombre de candidatures pour chaque job
      const jobsWithApplications = await Promise.all(
        jobs.map(async (job) => {
          const applications = await ctx.db
            .query("offers")
            .filter((q) => q.eq(q.field("jobId"), job._id))
            .collect();
  
          return {
            ...job,
            applications: applications.length,
          };
        })
      );
  
      return jobsWithApplications;
    },
  });
// convex/queries/offers.ts
export const getTopCandidates = query({
    handler: async (ctx) => {
      // Récupérer les 5 meilleures offres triées par score
      const topOffers = await ctx.db
        .query("offers")
        .order("desc")
        .take(5);
  
      // Récupérer les détails des candidats et des jobs associés
      const topCandidates = await Promise.all(
        topOffers.map(async (offer) => {
          const candidate = await ctx.db.get(offer.candidateId);
          const job = await ctx.db.get(offer.jobId);
  
          return {
            ...offer,
            name: candidate?.name || "Unknown",
            department: job?.departmentId || "Unknown",
          };
        })
      );
  
      return topCandidates;
    },
  });