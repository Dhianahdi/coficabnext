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
          };
        })
      );
  
      return meetingsWithDetails;
    },
  });

  