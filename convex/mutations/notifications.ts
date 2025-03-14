import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Mutation pour créer une nouvelle notification
export const createNotification = mutation({
  args: {
    userId: v.id("users"), // ID de l'utilisateur
    title: v.string(), // Titre de la notification
    message: v.string(), // Message de la notification
    link: v.optional(v.string()), // Lien optionnel
    type: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("success")
    ), // Type de notification
  },
  handler: async (ctx, args) => {
    const { userId, title, message, link, type } = args;

    // Créer la notification
    await ctx.db.insert("notifications", {
      userId,
      title,
      message,
      link,
      type,
      isRead: false, // Par défaut, la notification n'est pas lue
      createdAt: Date.now(),
    });
  },
});

// Mutation pour marquer une notification comme lue
export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"), // ID de la notification
  },
  handler: async (ctx, args) => {
    const { notificationId } = args;

    // Mettre à jour la notification pour la marquer comme lue
    await ctx.db.patch(notificationId, {
      isRead: true,
    });
  },
});

// Mutation pour supprimer une notification
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"), // ID de la notification
  },
  handler: async (ctx, args) => {
    const { notificationId } = args;

    // Supprimer la notification
    await ctx.db.delete(notificationId);
  },
});

// Mutation pour récupérer les notifications d'un utilisateur
export const getNotificationsForUser = mutation({
  args: {
    userId: v.id("users"), // ID de l'utilisateur
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Récupérer les notifications de l'utilisateur
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return notifications;
  },
});

// Mutation pour marquer toutes les notifications comme lues
export const markAllNotificationsAsRead = mutation({
  args: {
    userId: v.id("users"), // ID de l'utilisateur
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Récupérer toutes les notifications non lues de l'utilisateur
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    // Marquer chaque notification comme lue
    for (const notification of notifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
      });
    }
  },
});