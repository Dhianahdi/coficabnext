import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Exécuter toutes les heures
crons.interval(
  "close expired jobs",
  { hours: 1 }, // Toutes les heures
  api.mutations.jobs.closeExpiredJobs,
);

crons.interval(
  "complete past meetings",
  { hours: 1 }, // Toutes les heures
  api.mutations.meetings.completePastMeetings,
);

export default crons;