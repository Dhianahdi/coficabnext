import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const scheduleMeeting = mutation({
    args: {
      title: v.string(),
      description: v.optional(v.string()),
      type: v.union(v.literal("online"), v.literal("in-person")),
      meetingLink: v.optional(v.string()),
      date: v.number(), // Date de la réunion (timestamp)
      startTime: v.number(), // Heure de début (timestamp)
      organizerId: v.id("users"),
      participantId: v.id("users"), // ID du candidat
    },
    handler: async (ctx, args) => {
      const meetingId = await ctx.db.insert("meetings", {
        title: args.title,
        description: args.description,
        type: args.type,
        meetingLink: args.meetingLink,
        date: args.date,
        startTime: args.startTime,
        organizerId: args.organizerId,
        participantId: args.participantId,
        status: "scheduled",
      });
      return meetingId;
    },
  });

  export const updateMeeting = mutation({
    args: {
      meetingId: v.id("meetings"),
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      type: v.optional(v.union(v.literal("online"), v.literal("in-person"))),
      meetingLink: v.optional(v.string()),
      date: v.optional(v.number()), // Date de la réunion (timestamp)
      startTime: v.optional(v.number()),
      participantId: v.optional(v.id("users")), // Un seul participant
      status: v.optional(
        v.union(v.literal("scheduled"), v.literal("completed"), v.literal("canceled"))
      ),
    },
    handler: async (ctx, args) => {
      const { meetingId, ...rest } = args;
      await ctx.db.patch(meetingId, rest);
    },
  });

  export const cancelMeeting = mutation({
    args: {
      meetingId: v.id("meetings"),
    },
    handler: async (ctx, args) => {
      await ctx.db.patch(args.meetingId, { status: "canceled" });
    },
  });

  export const completeMeeting = mutation({
    args: {
      meetingId: v.id("meetings"),
    },
    handler: async (ctx, args) => {
      await ctx.db.patch(args.meetingId, { status: "completed" });
    },
  });

  
export const getUserMeetings = query({
    args: {
      userId: v.id("users"),
    },
    handler: async (ctx, args) => {
      const organizedMeetings = await ctx.db
        .query("meetings")
        .withIndex("organizerId", (q) => q.eq("organizerId", args.userId))
        .collect();
  
      const participatedMeetings = await ctx.db
        .query("meetings")
        .filter((q) => q.eq(q.field("participantId"), args.userId))
        .collect();
  
      return [...organizedMeetings, ...participatedMeetings];
    },
  });

  export const getMeetingsByDate = query({
    args: {
      date: v.number(), // Date de la réunion (timestamp)
    },
    handler: async (ctx, args) => {
      const meetings = await ctx.db
        .query("meetings")
        .withIndex("date", (q) => q.eq("date", args.date))
        .collect();
      return meetings;
    },
  });
  export const getAllMeetings = query({
    handler: async (ctx) => {
      const meetings = await ctx.db.query("meetings").collect();
  
      const meetingsWithDetails = await Promise.all(
        meetings.map(async (meeting) => {
          const organizer = await ctx.db.get(meeting.organizerId);
          const participant = await ctx.db.get(meeting.participantId);
  
          return {
            ...meeting,
            organizerName: organizer?.name || "Unknown Organizer",
            participantName: participant?.name || "Unknown Participant",
            participantid: participant?._id || "Unknown Participant",
            participantmail: participant?.email || "Unknown Participant",


          };
        })
      );
  
      return meetingsWithDetails;
    },
  });


  export const completePastMeetings = mutation({
    handler: async (ctx) => {
      // Récupérer la date actuelle en millisecondes
      const now = Date.now();
  
      // Récupérer tous les meetings planifiés
      const scheduledMeetings = await ctx.db
        .query("meetings")
        .filter((q) => q.eq(q.field("status"), "scheduled"))
        .collect();
  
      // Parcourir chaque meeting planifié
      for (const meeting of scheduledMeetings) {
        // Vérifier si le meeting est terminé (startTime + 2 heures < maintenant)
        if (meeting.startTime + 2 * 60 * 60 * 1000 < now) {
          // Mettre à jour le statut du meeting à "completed"
          await ctx.db.patch(meeting._id, {
            status: "completed",
          });
        }
      }
    },
  });

  